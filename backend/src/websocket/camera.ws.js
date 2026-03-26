import { WebSocketServer } from "ws";
import prisma from "../db/prisma.js";
import axios from "axios";
import { searchFaceEmbedding } from "../services/vectorSearch.service.js";

const MODEL_SERVICE_URL = process.env.MODEL_SERVICE_URL;

// ─────────────────────────────
// Matching thresholds
// ─────────────────────────────
const CONFIRMED_THRESHOLD = 0.30;
const POSSIBLE_THRESHOLD = 0.45;

// Event cooldown per camera + person
const EVENT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const lastEventMap = new Map(); // key = cameraId:personId

export const initCameraWebSocket = (httpServer) => {
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws/camera",
  });

  console.log("📡 Camera WebSocket initialized at /ws/camera");

  wss.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const cameraCode = url.searchParams.get("camera_code");

      if (!cameraCode) {
        ws.close(1008, "camera_code required");
        return;
      }

      const camera = await prisma.cctv_cameras.findUnique({
        where: { camera_code: cameraCode },
        select: { id: true, camera_code: true, status: true },
      });

      if (!camera || camera.status !== "ACTIVE") {
        ws.close(1008, "Invalid or inactive camera");
        return;
      }

      ws.cameraId = camera.id;
      ws.cameraCode = camera.camera_code;

      console.log(`📷 Camera connected: ${ws.cameraCode}`);

      ws.on("message", async (data) => {
        try {
          const payload = JSON.parse(data.toString());
          const { frame_id, image_base64 } = payload;

          if (!frame_id || !image_base64) {
            console.log("⚠️ Invalid frame payload");
            return;
          }

          const cleanBase64 = image_base64.includes("base64,")
            ? image_base64.split("base64,")[1]
            : image_base64;

          // ─────────────────────────────
          // 1️⃣ Call ML engine
          // ─────────────────────────────
          const res = await axios.post(
            `${MODEL_SERVICE_URL}/identify/image`,
            {
              camera_id: ws.cameraCode,
              frame_id,
              image_base64: cleanBase64,
            }
          );

          const { detections } = res.data;

          if (!detections || !detections.length) {
            return;
          }

          // ─────────────────────────────
          // 2️⃣ Process each detection
          // ─────────────────────────────
          for (const det of detections) {
            const { bbox, embedding } = det;

            if (!embedding || !bbox) {
              continue;
            }

            // Vector search (top 1 match)
            const matches = await searchFaceEmbedding(embedding, 1);

            if (!matches.length) {
              continue;
            }

            const best = matches[0];
            const distance = Number(best.distance);
            const confidence = Number((1 - distance).toFixed(4));

            let status = "UNKNOWN";
            let personId = null;
            let caseId = null;

            if (distance <= CONFIRMED_THRESHOLD) {
              status = "CONFIRMED";
              personId = best.case_person_id;
              caseId = best.case_id;
            } else if (distance <= POSSIBLE_THRESHOLD) {
              status = "POSSIBLE";
              personId = best.case_person_id;
              caseId = best.case_id;
            }

            if (status === "UNKNOWN") {
              continue;
            }

            console.log(
              `🎯 ${status} | person=${personId} | case=${caseId ?? "null"} | conf=${confidence}`
            );

            // ─────────────────────────────
            // 3️⃣ Event-based cooldown (camera + person)
            // ─────────────────────────────
            const eventKey = `${ws.cameraId}:${personId}`;
            const lastEvent = lastEventMap.get(eventKey) || 0;

            if (Date.now() - lastEvent < EVENT_COOLDOWN_MS) {
              continue;
            }

            lastEventMap.set(eventKey, Date.now());

            // ─────────────────────────────
            // 4️⃣ Persist CCTV log
            // ─────────────────────────────
            const log = await prisma.cctv_logs.create({
              data: {
                camera_id: ws.cameraId,
                detected_person_id: personId,
                detection_status: status,
                confidence,
                bbox_x1: bbox[0],
                bbox_y1: bbox[1],
                bbox_x2: bbox[2],
                bbox_y2: bbox[3],
                model_name: "InceptionResnetV1",
                model_version: "vggface2",
              },
            });

            // ─────────────────────────────
            // 5️⃣ Create alert only for CONFIRMED + valid case
            // ─────────────────────────────
            if (status === "CONFIRMED" && caseId) {
              await prisma.alerts.create({
                data: {
                  alert_type: "CCTV_MATCH",
                  status: "OPEN",
                  case_id: caseId,
                  person_id: personId,
                  cctv_log_id: log.id,
                  camera_id: ws.cameraId,
                  confidence,
                  message: `Confirmed face match detected on camera ${ws.cameraCode}`,
                },
              });

              console.log("🚨 ALERT CREATED");
            }
          }
        } catch (err) {
          if (err.response) {
            console.error("ENGINE ERROR:", err.response.data);
          } else {
            console.error("WS processing error:", err.message);
          }
        }
      });

      ws.on("close", () => {
        console.log(`❌ Camera disconnected: ${ws.cameraCode}`);
      });

      ws.on("error", (err) => {
        console.error(`⚠️ WS error (${ws.cameraCode}):`, err.message);
      });
    } catch (err) {
      console.error("WS connection error:", err);
      ws.close(1011, "Internal server error");
    }
  });
};

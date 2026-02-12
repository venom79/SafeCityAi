import WebSocket from "ws";
import fs from "fs";

const CAMERA_CODE = "CAM_TEST_001";
const WS_URL = `ws://localhost:8080/ws/camera?camera_code=${CAMERA_CODE}`;

const imageBase64 = fs
  .readFileSync("./uploads/person-photos/person5.png")
  .toString("base64");

const ws = new WebSocket(WS_URL);

let frameCounter = 0; // ✅ frame sequence

ws.on("open", () => {
  console.log("📷 Camera connected");

  setInterval(() => {
    frameCounter += 1;

    const payload = {
      frame_id: frameCounter,        // ✅ INTEGER
      image_base64: imageBase64,
      image_type: "PHOTO",
    };

    ws.send(JSON.stringify(payload));
    console.log(`📤 Frame sent (#${frameCounter})`);
  }, 2000);
});

ws.on("close", () => {
  console.log("❌ Camera disconnected");
});

ws.on("error", (err) => {
  console.error("WS error:", err.message);
});

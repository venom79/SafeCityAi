import "./config/env.js";
import http from "http";
import app from "./app.js";
import { initCameraWebSocket } from "./ws/camera.ws.js";

const PORT = process.env.PORT || 8080;

// 1️⃣ Create raw HTTP server
const server = http.createServer(app);

// 2️⃣ Attach WebSocket layer
initCameraWebSocket(server);

// 3️⃣ Start listening
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`WS:  ws://localhost:${PORT}/ws/camera`);
});

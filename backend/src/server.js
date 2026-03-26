import "./config/env.js";
import http from "http";
import app from "./app.js";
import { initWebSocket } from "./websocket/server.js"
import { startAllCameras } from "./services/cameraStartup.service.js"

// telegram bot import
import "./services/telegramBot.js" 

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

initWebSocket(server)

server.listen(PORT, async () => {

  console.log(`Server running on port ${PORT}`)
  console.log(`URL: http://localhost:${PORT}`)
  console.log(`WS: ws://localhost:${PORT}`)

  // Start camera ingestion automatically
  await startAllCameras()

})
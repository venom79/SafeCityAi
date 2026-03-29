import { WebSocketServer } from "ws"

let wss

export const initWebSocket = (server) => {

  wss = new WebSocketServer({ server })

  wss.on("connection", (ws) => {
    console.log("Client connected to CCTV logs")

    ws.on("close", () => {
      console.log("Client disconnected")
    })
  })

}
export const broadcastLog = (log) => {

  console.log("Broadcasting log:", log.id)

  if (!wss) {
    console.log("WebSocket server not initialized")
    return
  }

  console.log("Connected clients:", wss.clients.size)

  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: "NEW_DETECTION",
        payload: log
      }))
    }
  })

}

// export const broadcastLog = (log) => {

//   if (!wss) return

//   wss.clients.forEach(client => {
//     if (client.readyState === 1) {
//       client.send(JSON.stringify({
//         type: "NEW_DETECTION",
//         payload: log
//       }))
//     }
//   })

// }
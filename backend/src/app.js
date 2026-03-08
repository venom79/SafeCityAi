import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import caseRoutes from "./routes/case.routes.js";
import casePersonRoutes from "./routes/casePerson.routes.js";
import faceSearchRoutes from "./routes/faceSearch.routes.js";
import recognitionRoutes from "./routes/recognition.routes.js";
import testRoutes from "./routes/test.routes.js";
import { initCameraWebSocket } from "./ws/camera.ws.js"
import { fileURLToPath } from "url";
import path from "path";

const app = express();

// Needed for ES modules (__dirname replacement)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/snapshots", express.static("snapshots"))

app.get("/",(req,res)=>{
    res.send("Hello world")
})
app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use("/cases",caseRoutes);
app.use("/case-persons", casePersonRoutes);
app.use("/face-search", faceSearchRoutes);
app.use("/recognitions", recognitionRoutes);
export default app;

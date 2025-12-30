import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hello world")
})
app.use("/auth", authRoutes);
app.use("/test", testRoutes);

export default app;

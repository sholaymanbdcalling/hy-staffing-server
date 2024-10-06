import express from "express";
const app = new express();
import router from "./src/router/api.js";

//middlewares
import cors from "cors";
import hpp from "hpp";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json({ extended: true , limit: '5mb'}));
app.use(express.urlencoded({ extended: true , limit: '5mb'}));
app.use(hpp());
app.use(helmet());
app.use(mongoSanitize());
app.use(limiter);
app.use(cookieParser());

//route connect
app.use("/api/v1", router);

//404 route
app.all("*", (req, res) => {
  res.status(404).json({ status: "404 error", message: "not found" });
});

export default app;

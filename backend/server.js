import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; 

import { logger } from "./utils/logger.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import teachersRoutes from "./routes/teachersRoutes.js";
import coursesRoutes from "./routes/coursesRoutes.js";
import artistRoutes from "./routes/artistRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

const app = express();
app.disable("x-powered-by");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "uploads");


const setCorpHeader = (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
};


const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
    helmet.contentSecurityPolicy({  
        directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'","data:","blob:", process.env.FRONTEND_URL, "https://api.sadhanakalakendra.com.np",],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        },
    })
);


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  })
);

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});


app.use(express.json({ limit: "1mb" }));
app.use(cookieParser()); 
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    setHeaders: (res) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);


app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.use("/api/about", aboutRoutes);
app.use("/api/teachers", teachersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/register", registerRoutes);
app.use("/api/admin", limiter, adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  res.status(statusCode).json({ message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
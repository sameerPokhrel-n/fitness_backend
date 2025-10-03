import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron"
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import exerciseRoutes from "./routes/exercise.routes";
import passport from "./services/passport.service";
import { errorHandler } from "./middlewares/error.middleware";
import prisma from "./prisma";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ 
  origin:'http://127.0.0.1:3000',
      credentials: true,
      optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    }));
app.use(express.json());
app.use(cookieParser());

// initialize passport (no session)
app.use(passport.initialize());

// health
app.get("/health", (req, res) => res.json({ success: true,
    message: 'Server is healthy',
    data: {
      method: req.method,
      url: req.originalUrl,
    } }));

// routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/exercises", exerciseRoutes);

// error handler
app.use(errorHandler);

// Scheduled cleanup job: run every day at midnight 
cron.schedule("0 0 * * *", 
  async () => { 
      try 
      { 
        await prisma.refreshToken.deleteMany({ where: { revoked: true } }); 
        console.log("✅ Expired/revoked refresh tokens cleaned up"); 
      } 
        catch (err) { 
          console.error("❌ Token cleanup failed", err); 
        } 
        });

// start
app.listen(PORT, () => {
  app.get("/", (req, res) =>    
    res.json({ 200:"Fitness App Backend " })
)
console.log(`Server listening on ${PORT}`)
});

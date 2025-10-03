import { Router } from "express";
import * as userCtrl from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/me", requireAuth, userCtrl.getProfile);
router.put("/me", requireAuth, userCtrl.updateProfile);

export default router;

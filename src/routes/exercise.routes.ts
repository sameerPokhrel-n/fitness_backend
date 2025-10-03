import { Router } from "express";
import * as exCtrl from "../controllers/exercise.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", requireAuth, exCtrl.createExercise);
router.get("/", exCtrl.listExercises);
router.get("/:id", exCtrl.getExercise);
router.put("/:id", requireAuth, exCtrl.updateExercise);
router.delete("/:id", requireAuth, exCtrl.deleteExercise);

export default router;

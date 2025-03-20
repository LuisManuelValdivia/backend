import { Router } from "express";
import {
  getRealtimeData,
  getHistoryData,
  abrirCortina,
  cerrarCortina,
  setModoManual,
  setModoAutomatico
} from "../controllers/cortinaController";

const router = Router();

router.get("/realtime", getRealtimeData);
router.get("/history", getHistoryData);

router.post("/abrir", abrirCortina);
router.post("/cerrar", cerrarCortina);
router.post("/modoManual", setModoManual);
router.post("/modoAutomatico", setModoAutomatico);

export default router;


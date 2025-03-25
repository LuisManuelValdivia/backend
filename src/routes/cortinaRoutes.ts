// backend/src/routes/cortinaRoutes.ts
import { Router } from "express";
import {
  getCortinaData,
  getHistoryData,
  abrirCortina,
  cerrarCortina,
  setModoManual,
  setModoAutomatico
} from "../controllers/cortinaController";

const router = Router();

// Endpoint para obtener la data en tiempo real del dispositivo, filtrada por deviceId (por query)
router.get("/data", getCortinaData);

// Endpoint para obtener el historial de eventos (con paginación)
router.get("/historial", getHistoryData);

// Endpoints para enviar comandos a la cortina vía MQTT
router.post("/abrir", abrirCortina);
router.post("/cerrar", cerrarCortina);
router.post("/modoManual", setModoManual);
router.post("/modoAutomatico", setModoAutomatico);

export default router;

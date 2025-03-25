// backend/src/controllers/cortinaController.ts
import { Request, Response } from "express";
import CortinaData from "../models/cortinaDataModel";
import CortinaHistorial from "../models/cortinaHistorialModel";
import mqttClient from "../config/mqttClient";

/**
 * Obtener datos en tiempo real (última lectura) sin requerir deviceId.
 */
export const getCortinaData = async (req: Request, res: Response) => {
  try {
    const data = await CortinaData.findOne().sort({ timestamp: -1 });
    if (!data) {
      res.status(404).json({ error: "No hay datos disponibles." });
      return;
    }
    res.json(data);
  } catch (error) {
    console.error("Error en getCortinaData:", error);
    res.status(500).json({ error: "Error al obtener datos en tiempo real." });
  }
};

/**
 * Obtener historial de eventos con paginación sin requerir deviceId.
 * Se obtiene el historial global de movimientos.
 */
export const getHistoryData = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const docs = await CortinaHistorial.find()
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limitNum);
    const totalDocs = await CortinaHistorial.countDocuments();
    const totalPages = Math.ceil(totalDocs / limitNum);
    res.json({
      docs,
      page: pageNum,
      totalPages,
      totalDocs
    });
  } catch (error) {
    console.error("Error en getHistoryData:", error);
    res.status(500).json({ error: "Error al obtener historial de datos." });
  }
};

/**
 * Enviar comando "abrir" a la cortina.
 */
export const abrirCortina = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "abrir", (err) => {
    if (err) {
      console.error("Error publicando 'abrir':", err);
      return res.status(500).json({ error: "Error al publicar comando 'abrir'." });
    }
    console.log("Comando 'abrir' publicado");
    res.json({ success: true, message: "Comando 'abrir' enviado a la cortina." });
  });
};

/**
 * Enviar comando "cerrar" a la cortina.
 */
export const cerrarCortina = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "cerrar", (err) => {
    if (err) {
      console.error("Error publicando 'cerrar':", err);
      return res.status(500).json({ error: "Error al publicar comando 'cerrar'." });
    }
    console.log("Comando 'cerrar' publicado");
    res.json({ success: true, message: "Comando 'cerrar' enviado a la cortina." });
  });
};

/**
 * Enviar comando "modoManual" a la cortina.
 */
export const setModoManual = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "modoManual", (err) => {
    if (err) {
      console.error("Error publicando 'modoManual':", err);
      return res.status(500).json({ error: "Error al publicar comando 'modoManual'." });
    }
    console.log("Comando 'modoManual' publicado");
    res.json({ success: true, message: "Modo manual activado." });
  });
};

/**
 * Enviar comando "modoAutomatico" a la cortina.
 */
export const setModoAutomatico = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "modoAutomatico", (err) => {
    if (err) {
      console.error("Error publicando 'modoAutomatico':", err);
      return res.status(500).json({ error: "Error al publicar comando 'modoAutomatico'." });
    }
    console.log("Comando 'modoAutomatico' publicado");
    res.json({ success: true, message: "Modo automático activado." });
  });
};

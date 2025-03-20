import { Request, Response } from "express";
import CortinaData from "../models/cortinaModel";
import mqttClient from "../config/mqttClient";

// Obtener la última lectura
export const getRealtimeData = async (req: Request, res: Response) => {
  try {
    const latestData = await CortinaData.findOne().sort({ timestamp: -1 });
    if (!latestData) {
      return res.status(404).json({ error: "No hay datos de la cortina aún." });
    }
    return res.json(latestData);
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener datos en tiempo real." });
  }
};

// Obtener historial (ej. últimos 50)
export const getHistoryData = async (req: Request, res: Response) => {
  try {
    const history = await CortinaData.find().sort({ timestamp: -1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historial de datos." });
  }
};

// Enviar comando "abrir"
export const abrirCortina = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "abrir", (err) => {
    if (err) {
      console.error("❌ Error publicando 'abrir' en MQTT:", err);
      return res.status(500).json({ error: "Error al publicar comando 'abrir'." });
    }
    console.log("📡 Comando abrir publicado");
    res.json({ success: true, message: "Comando abrir enviado a la cortina." });
  });
};

// Enviar comando "cerrar"
export const cerrarCortina = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "cerrar", (err) => {
    if (err) {
      console.error("❌ Error publicando 'cerrar' en MQTT:", err);
      return res.status(500).json({ error: "Error al publicar comando 'cerrar'." });
    }
    console.log("📡 Comando cerrar publicado");
    res.json({ success: true, message: "Comando cerrar enviado a la cortina." });
  });
};

// Enviar comando "modoManual"
export const setModoManual = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "modoManual", (err) => {
    if (err) {
      console.error("❌ Error publicando 'modoManual' en MQTT:", err);
      return res.status(500).json({ error: "Error al publicar comando 'modoManual'." });
    }
    console.log("📡 Comando modoManual publicado");
    res.json({ success: true, message: "Modo manual activado." });
  });
};

// Enviar comando "modoAutomatico"
export const setModoAutomatico = (req: Request, res: Response) => {
  mqttClient.publish("esp32/cortina/cmd", "modoAutomatico", (err) => {
    if (err) {
      console.error("❌ Error publicando 'modoAutomatico' en MQTT:", err);
      return res.status(500).json({ error: "Error al publicar comando 'modoAutomatico'." });
    }
    console.log("📡 Comando modoAutomatico publicado");
    res.json({ success: true, message: "Modo automático activado." });
  });
};

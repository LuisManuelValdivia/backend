// backend/src/controllers/cortinaDataController.ts
import { Request, Response } from 'express';
import CortinaData from '../models/cortinaDataModel';

export const getCortinaData = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;
    if (!deviceId) {
      return res.status(400).json({ message: 'Falta deviceId' });
    }
    const data = await CortinaData.findOne({ deviceId });
    if (!data) {
      return res.status(404).json({ message: 'No se encontró data para ese deviceId' });
    }
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener cortina data' });
  }
};
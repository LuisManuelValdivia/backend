// backend/src/controllers/cortinaHistorialController.ts
import { Request, Response } from 'express';
import CortinaHistorial from '../models/cortinaHistorialModel';

export const getCortinaHistorial = async (req: Request, res: Response) => {
  try {
    const { deviceId, page = 1, limit = 10 } = req.query;
    if (!deviceId) {
      return res.status(400).json({ message: 'Falta deviceId' });
    }

    // Convertir a número
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const query = { deviceId: deviceId };
    const options = {
      page: pageNum,
      limit: limitNum,
      sort: { fecha: -1 } // más reciente primero
    };

    // Si usas mongoose-paginate, por ejemplo:
    // const result = await CortinaHistorial.paginate(query, options);

    // O manual con skip/limit
    const skip = (pageNum - 1) * limitNum;
    const docs = await CortinaHistorial.find(query)
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalDocs = await CortinaHistorial.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limitNum);

    return res.json({
      docs,
      page: pageNum,
      totalPages,
      totalDocs
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener historial' });
  }
};
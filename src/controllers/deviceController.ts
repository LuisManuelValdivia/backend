// backend/src/controllers/deviceController.ts
import { Request, Response } from 'express';
import Device from '../models/deviceModel';

export const getDevices = async (req: Request, res: Response) => {
  try {
    const devices = await Device.find();
    res.json(devices);
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener dispositivos' });
    return 
  }
};

export const registerDevice = async (req: Request, res: Response) => {
  try {
    const { mac, nombre } = req.body;

    // Supongamos que el nombre del usuario está en la sesión
    // (o en req.session.user?.nombre)
    const user = req.session?.user;
    if (!user) {
      res.status(401).json({ message: 'No estás logeado' });
      return 
    }

    const userName = (user as { rol: string; nombre: string }).nombre; // Ajusta al campo real que uses

    if (!mac || !nombre) {
      res.status(400).json({ message: 'MAC y Nombre son obligatorios' });
      return 
    }

    // Verifica si la MAC ya está en uso
    const existing = await Device.findOne({ mac });
    if (existing) {
      res.status(400).json({ message: 'Este dispositivo ya existe' });
      return 
    }

    // Creamos el nuevo dispositivo con userName
    const newDevice = new Device({
      mac,
      nombre,
      userName
    });

    await newDevice.save();
    res.status(201).json(newDevice);
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear dispositivo' });
    return 
  }
};
// backend/src/controllers/companyController.ts
import { Request, Response } from 'express';
import Company from '../models/companyModel'; // tu modelo de company

/** Obtener la info de la empresa por ID */
export const obtenerCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Buscar el documento con ese _id en la colección "company"
    const company = await Company.findById(id);
    if (!company) {
      res.status(404).json({ message: 'Información de empresa no encontrada.' });
      return 
    }
    res.json(company);
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la información de empresa.' });
    return 
  }
};

/** Actualizar la info de la empresa (campos opcionales) */
export const actualizarCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      ubicacion,
      mision,
      vision,
      telefono,
      correo,
      preguntasFrecuentes,
      terminosCondiciones,
      politicasPrivacidad
    } = req.body;

    const company = await Company.findById(id);
    if (!company) {
      res.status(404).json({ message: 'Información de empresa no encontrada.' });
      return 
    }

    // Actualizar campos solo si vienen en el body
    if (titulo !== undefined) company.titulo = titulo;
    if (ubicacion !== undefined) company.ubicacion = ubicacion;
    if (mision !== undefined) company.mision = mision;
    if (vision !== undefined) company.vision = vision;
    if (telefono !== undefined) company.telefono = telefono;
    if (correo !== undefined) company.correo = correo;
    if (preguntasFrecuentes !== undefined) company.preguntasFrecuentes = preguntasFrecuentes;
    if (terminosCondiciones !== undefined) company.terminosCondiciones = terminosCondiciones;
    if (politicasPrivacidad !== undefined) company.politicasPrivacidad = politicasPrivacidad;

    await company.save();
    res.json({ message: 'Información de empresa actualizada con éxito.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la información de empresa.' });
    return 
  }
};

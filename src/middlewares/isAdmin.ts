// middlewares/isAdmin.ts
import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Asumiendo que usas sesiones
  if (!req.session.user) {
    return res.status(401).json({ message: 'No está autenticado.' });
  }
  if (req.session.user.rol !== 'admin') {
    return res.status(403).json({ message: 'No tiene permisos de administrador.' });
  }
  next();
};

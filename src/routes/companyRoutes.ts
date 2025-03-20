import { Router } from 'express';
import { obtenerCompany, actualizarCompany } from '../controllers/companyController';

const router = Router();

// GET /api/company/:id
router.get('/:id', obtenerCompany);

// PUT /api/company/:id
router.put('/:id', actualizarCompany);

export default router;

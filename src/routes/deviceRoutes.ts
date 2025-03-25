// backend/src/routes/deviceRoutes.ts
import { Router } from 'express';
import { getDevices, registerDevice } from '../controllers/deviceController';

const router = Router();

router.get('/', getDevices);        // GET /api/devices
router.post('/', registerDevice);     // POST /api/devices

export default router;

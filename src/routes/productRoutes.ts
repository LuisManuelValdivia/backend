// backend/src/routes/productRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import {
  crearProducto,
  obtenerProductos,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
  subirImagen
} from '../controllers/productController';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // carpeta temporal

router.post('/', crearProducto);
router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

// Endpoint para subir imagen
router.post('/upload-image', upload.single('archivo'), subirImagen);

export default router;

import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  recoverPassword, 
  getUserQuestion, 
  logoutUser, 
  checkAuth, 
  updateProfile,
  listarUsuarios,      // Agregado
  eliminarUsuario,      // Agregado
  actualizarUsuario,       // Nueva función a crear
  obtenerUsuario,
  getMyDevice
} from '../controllers/userController';

const router = Router();

import { Request, Response, NextFunction } from 'express';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/recover-password', recoverPassword);

// GET /api/users/question?correo=xxx
router.get('/question', getUserQuestion);

router.post('/logout', logoutUser);
router.get('/check-auth', checkAuth);
router.put('/update-profile', updateProfile);

// NUEVAS RUTAS
router.get('/', listarUsuarios);     // Para listar usuarios (con búsqueda opcional)
router.delete('/:id', eliminarUsuario); // Para eliminar un usuario por ID
router.put('/:id', actualizarUsuario);     // Actualizar usuario por ID
router.get('/:id', obtenerUsuario);    // Obtener usuario por ID

// Registrar dispositivo al usuario
//router.get('/my-device', getMyDevice); // Obtener dispositivo del usuario

export default router;

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';
import Device from "../models/deviceModel";
import { Interface } from 'readline';
import { Isession } from '../models/sessionModel';

declare module 'express-session' {
  interface SessionData {
    user: {
      _id: string;
      nombre: string;
      correo: string;
      rol: string;
      deviceId: string | null;
    };
  }
}



// Registro
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, contraseña, telefono, preguntaSecreta, respuestaSecreta } = req.body;

    // Verificar si el correo ya está en uso
    const userExists = await User.findOne({ correo });
    if (userExists) {
      res.status(400).json({ message: 'El correo ya está registrado.' });
      return 
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(contraseña, salt);

    // Hashear la respuesta secreta (opcional) para mayor seguridad
    const hashedAnswer = await bcrypt.hash(respuestaSecreta, salt);

    const newUser = new User({
      nombre,
      correo,
      contraseña: hashedPass,
      telefono,
      preguntaSecreta, // si no deseas guardarla en texto plano, también se puede hashear
      respuestaSecreta: hashedAnswer
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado con éxito.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar usuario.' });
    return 
  }
};

// Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { correo, contraseña } = req.body;

    const user = await User.findOne({ correo });
    if (!user) {
      res.status(400).json({ message: 'Usuario no encontrado.' });
      return 
    }

    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) {
      res.status(400).json({ message: 'Contraseña incorrecta.' });
      return 
    }

    // Obtener el dispositivo vinculado, si existe
    const device = await Device.findOne({ user: user._id });

    // Guardar info de sesión
    req.session.user = {
      _id: user._id as string,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol, // o lo que necesites
      deviceId: device ? device.mac : null  // Incluir deviceId en la sesión
    };

    res.json({
      message: 'Login exitoso.',
      user: {
        userId: user._id,
        nombre: user.nombre,
        rol: user.rol,
        deviceId: device ? device.mac : null  // Enviar deviceId al frontend
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión.' });
    return 
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al cerrar sesión.' });
      return 
    }
    res.clearCookie('connect.sid'); // 'connect.sid' es el nombre por defecto
    res.json({ message: 'Sesión cerrada con éxito.' });
    return 
  });
};

export const checkAuth = async (req: Request, res: Response) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user
    });
    return 
  } else {
    res.json({ loggedIn: false });
  }
};

/** Actualizar perfil (todos los campos opcionales) */
export const updateProfile = async (req: Request, res: Response) => {
  if (!req.session.user) {
    res.status(401).json({ message: 'No está autorizado.' });
    return 
  }

  try {
    const { nombre, correo, password, telefono, preguntaSecreta, respuestaSecreta } = req.body;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return 
    }

    // Actualizar correo, si se proporciona, con validación
    if (correo !== undefined) {
      if (!correo.trim()) {
        res.status(400).json({ message: 'El correo no puede estar vacío.' });
        return 
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        res.status(400).json({ message: 'El formato del correo no es válido.' });
        return 
      }
      user.correo = correo;
    }

    // Actualizar nombre (opcional)
    if (nombre !== undefined && nombre.trim()) {
      user.nombre = nombre;
    }
    // Actualizar teléfono (opcional)
    if (telefono !== undefined && telefono.trim()) {
      user.telefono = telefono;
    }
    // Actualizar pregunta secreta (opcional)
    if (preguntaSecreta !== undefined && preguntaSecreta.trim()) {
      user.preguntaSecreta = preguntaSecreta;
    }
    // Actualizar respuesta secreta (opcional)
    if (respuestaSecreta !== undefined && respuestaSecreta.trim()) {
      user.respuestaSecreta = respuestaSecreta;
    }
    // Actualizar contraseña (opcional)
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      user.contraseña = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'Perfil actualizado correctamente.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar perfil.' });
    return 
  }
};

/** Recuperación de Contraseña (basado en pregunta y respuesta secreta) */
export const recoverPassword = async (req: Request, res: Response) => {
  try {
    const { correo, preguntaSecreta, respuestaSecreta, nuevaContraseña } = req.body;

    const user = await User.findOne({ correo, preguntaSecreta });
    if (!user) {
      res.status(400).json({ message: 'Datos incorrectos.' });
      return 
    }

    const isCorrectAnswer = await bcrypt.compare(respuestaSecreta, user.respuestaSecreta);
    if (!isCorrectAnswer) {
      res.status(400).json({ message: 'Respuesta secreta incorrecta.' });
      return 
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(nuevaContraseña, salt);

    user.contraseña = hashedPass;
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al recuperar contraseña.' });
    return 
  }
};

/** Obtener la pregunta secreta del usuario */
export const getUserQuestion = async (req: Request, res: Response) => {
  try {
    const { correo } = req.query;
    if (!correo) {
      res.status(400).json({ message: 'Se requiere un correo.' });
      return 
    }

    const user = await User.findOne({ correo });
    if (!user) {
      res.status(404).json({ message: 'No se encontró un usuario con ese correo.' });
      return 
    }

    res.json({ preguntaSecreta: user.preguntaSecreta });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la pregunta secreta.' });
    return 
  }
};

/** Listar usuarios (con búsqueda) */
export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && typeof search === 'string') {
      query = {
        nombre: { $regex: search, $options: 'i' }
      };
    }
    // Retornamos solo los campos necesarios para el panel: nombre, correo, teléfono y rol.
    const usuarios = await User.find(query, { nombre: 1, correo: 1, telefono: 1, rol: 1 });
    res.json(usuarios);
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios.' });
    return 
  }
};

/** Eliminar usuario */
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByIdAndDelete(id);
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return 
    }
    res.json({ message: 'Usuario eliminado con éxito.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar usuario.' });
    return 
  }
};

/** Actualizar usuario (para uso en el panel de administración, vía ID) */
export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, correo, password, telefono, preguntaSecreta, respuestaSecreta, rol } = req.body;
    
    const usuario = await User.findById(id);
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return 
    }
    
    if (nombre !== undefined) usuario.nombre = nombre;
    if (correo !== undefined) {
      if (!correo.trim()) {
        res.status(400).json({ message: 'El correo no puede estar vacío.' });
        return 
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        res.status(400).json({ message: 'El formato del correo no es válido.' });
        return 
      }
      usuario.correo = correo;
    }
    if (telefono !== undefined) usuario.telefono = telefono;
    if (preguntaSecreta !== undefined) usuario.preguntaSecreta = preguntaSecreta;
    if (respuestaSecreta !== undefined) usuario.respuestaSecreta = respuestaSecreta;
    if (rol !== undefined) usuario.rol = rol;
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      usuario.contraseña = await bcrypt.hash(password, salt);
    }
    
    await usuario.save();
    res.json({ message: 'Usuario actualizado con éxito.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario.' });
    return 
  }
};

/** Obtener usuario por ID */
export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await User.findById(id);
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return 
    }
    res.json(usuario);
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuario.' });
    return 
  }
};

// Ejemplo en userController.ts
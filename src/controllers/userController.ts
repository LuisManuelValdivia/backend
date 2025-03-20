import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/userModel';

// Registro
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { nombre, correo, contraseña, telefono, preguntaSecreta, respuestaSecreta } = req.body;

    // Verificar si el correo ya está en uso
    const userExists = await User.findOne({ correo });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
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
    return res.status(201).json({ message: 'Usuario registrado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al registrar usuario.' });
  }
};

// Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { correo, contraseña } = req.body;

    const user = await User.findOne({ correo });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta.' });
    }

    // Guardar info de sesión
    req.session.user = {
      _id: user._id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol // o lo que necesites
    };

    return res.json({
      message: 'Login exitoso.',
      user: {
        userId: user._id,
        nombre: user.nombre,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al iniciar sesión.' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al cerrar sesión.' });
    }
    res.clearCookie('connect.sid'); // 'connect.sid' es el nombre por defecto
    return res.json({ message: 'Sesión cerrada con éxito.' });
  });
};

export const checkAuth = async (req: Request, res: Response) => {
  if (req.session.user) {
    return res.json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    return res.json({ loggedIn: false });
  }
};

/** Actualizar perfil (todos los campos opcionales) */
export const updateProfile = async (req: Request, res: Response) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'No está autorizado.' });
  }

  try {
    const { nombre, correo, password, telefono, preguntaSecreta, respuestaSecreta } = req.body;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualizar correo, si se proporciona, con validación
    if (correo !== undefined) {
      if (!correo.trim()) {
        return res.status(400).json({ message: 'El correo no puede estar vacío.' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({ message: 'El formato del correo no es válido.' });
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
    return res.json({ message: 'Perfil actualizado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar perfil.' });
  }
};

/** Recuperación de Contraseña (basado en pregunta y respuesta secreta) */
export const recoverPassword = async (req: Request, res: Response) => {
  try {
    const { correo, preguntaSecreta, respuestaSecreta, nuevaContraseña } = req.body;

    const user = await User.findOne({ correo, preguntaSecreta });
    if (!user) {
      return res.status(400).json({ message: 'Datos incorrectos.' });
    }

    const isCorrectAnswer = await bcrypt.compare(respuestaSecreta, user.respuestaSecreta);
    if (!isCorrectAnswer) {
      return res.status(400).json({ message: 'Respuesta secreta incorrecta.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(nuevaContraseña, salt);

    user.contraseña = hashedPass;
    await user.save();

    return res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al recuperar contraseña.' });
  }
};

/** Obtener la pregunta secreta del usuario */
export const getUserQuestion = async (req: Request, res: Response) => {
  try {
    const { correo } = req.query;
    if (!correo) {
      return res.status(400).json({ message: 'Se requiere un correo.' });
    }

    const user = await User.findOne({ correo });
    if (!user) {
      return res.status(404).json({ message: 'No se encontró un usuario con ese correo.' });
    }

    return res.json({ preguntaSecreta: user.preguntaSecreta });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener la pregunta secreta.' });
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
    return res.json(usuarios);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
};

/** Eliminar usuario */
export const eliminarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await User.findByIdAndDelete(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    return res.json({ message: 'Usuario eliminado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar usuario.' });
  }
};

/** Actualizar usuario (para uso en el panel de administración, vía ID) */
export const actualizarUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, correo, password, telefono, preguntaSecreta, respuestaSecreta, rol } = req.body;
    
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    
    if (nombre !== undefined) usuario.nombre = nombre;
    if (correo !== undefined) {
      if (!correo.trim()) {
        return res.status(400).json({ message: 'El correo no puede estar vacío.' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({ message: 'El formato del correo no es válido.' });
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
    return res.json({ message: 'Usuario actualizado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar usuario.' });
  }
};

/** Obtener usuario por ID */
export const obtenerUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    return res.json(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener usuario.' });
  }
};

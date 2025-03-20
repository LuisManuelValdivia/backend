// backend/src/controllers/productController.ts
import { Request, Response } from 'express';
import Product from '../models/productModel';
import cloudinary from '../config/cloudinary';

/** Crear producto */
export const crearProducto = async (req: Request, res: Response) => {
  try {
    const {
      codigo,
      nombre,
      precio,
      descripcion,
      stock,
      proveedor,
      imagenes
    } = req.body;

    // Validar en el backend
    if (!codigo?.trim()) {
      return res.status(400).json({ message: 'Código vacío.' });
    }
    if (Number(precio) < 0) {
      return res.status(400).json({ message: 'El precio no puede ser negativo.' });
    }
    if (Number(stock) < 0) {
      return res.status(400).json({ message: 'El stock no puede ser negativo.' });
    }
    if (!proveedor?.trim()) {
      return res.status(400).json({ message: 'Proveedor vacío.' });
    }
    if (!imagenes || imagenes.length === 0) {
      return res.status(400).json({ message: 'Debe incluir al menos una imagen.' });
    }

    const newProd = new Product({
      codigo,
      nombre,
      precio,
      descripcion,
      stock,
      proveedor,
      imagenes
    });

    await newProd.save();
    return res.status(201).json({ message: 'Producto creado con éxito' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear producto.' });
  }
};

/** Listar productos (con búsqueda) */
export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && typeof search === 'string') {
      // Buscar por nombre o código (case-insensitive)
      query = {
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { codigo: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const productos = await Product.find(query);
    return res.json(productos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener productos.' });
  }
};

/** Obtener producto por ID */
export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    return res.json(prod);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener producto.' });
  }
};

/** Actualizar producto */
export const actualizarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      codigo,
      nombre,
      precio,
      descripcion,
      stock,
      proveedor,
      imagenes
    } = req.body;

    const prod = await Product.findById(id);
    if (!prod) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    // Actualizar campos si vienen en el body
    if (codigo !== undefined) prod.codigo = codigo;
    if (nombre !== undefined) prod.nombre = nombre;
    if (precio !== undefined) prod.precio = precio;
    if (descripcion !== undefined) prod.descripcion = descripcion;
    if (stock !== undefined) prod.stock = stock;
    if (proveedor !== undefined) prod.proveedor = proveedor;
    if (imagenes !== undefined) prod.imagenes = imagenes;

    await prod.save();
    return res.json({ message: 'Producto actualizado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar producto.' });
  }
};

/** Eliminar producto */
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prod = await Product.findByIdAndDelete(id);
    if (!prod) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    return res.json({ message: 'Producto eliminado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar producto.' });
  }
};

/** Subir Imagen a Cloudinary (si quieres manejar la subida desde el Backend) */
export const subirImagen = async (req: Request, res: Response) => {
  try {
    // Asume que usas Multer y tu archivo vendrá en `req.file`
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ningún archivo.' });
    }

    const filePath = req.file.path; // Multer lo habrá guardado localmente
    // Sube a Cloudinary
    const uploadResp = await cloudinary.uploader.upload(filePath);
    // Retornamos la URL pública
    return res.json({ secure_url: uploadResp.secure_url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al subir imagen a Cloudinary' });
  }
};

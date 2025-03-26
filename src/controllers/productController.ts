// backend/src/controllers/productController.ts
import { Request, Response } from 'express';
//import { MulterRequest } from '../types'; // Adjust the path as necessary
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
      categoria,
      imagenes
    } = req.body;

    if (!codigo?.trim()) {
      res.status(400).json({ message: 'Código vacío.' });
      return 
    }
    if (Number(precio) < 0) {
      res.status(400).json({ message: 'El precio no puede ser negativo.' });
      return 
    }
    if (Number(stock) < 0) {
      res.status(400).json({ message: 'El stock no puede ser negativo.' });
      return 
    }
    if (!proveedor?.trim()) {
      res.status(400).json({ message: 'Proveedor vacío.' });
      return 
    }
    if (!categoria?.trim()) {
      res.status(400).json({ message: 'Categoría vacía.' });
      return 
    }
    if (!imagenes || imagenes.length === 0) {
      res.status(400).json({ message: 'Debe incluir al menos una imagen.' });
      return 
    }

    const newProd = new Product({
      codigo,
      nombre,
      precio,
      descripcion,
      stock,
      proveedor,
      categoria,
      imagenes
    });

    await newProd.save();
    res.status(201).json({ message: 'Producto creado con éxito' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear producto.' });
    return 
  }
};

/** Listar productos (con búsqueda, categoría y paginación) */
export const obtenerProductos = async (req: Request, res: Response) => {
  try {
    const { search, category, page, limit } = req.query;

    // Manejo de paginación
    const pageNumber = Number(page) || 1;
    const pageLimit = Number(limit) || 6; // 6 por defecto

    let query: any = {};

    // Filtro por búsqueda
    if (search && typeof search === 'string') {
      query.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por categoría
    if (category && typeof category === 'string' && category.trim() !== '') {
      query.categoria = category;
    }

    // Calcular paginación
    const skip = (pageNumber - 1) * pageLimit;

    // Obtener productos filtrados con paginación
    const productos = await Product.find(query)
      .skip(skip)
      .limit(pageLimit);

    // Opcional: contar el total para calcular páginas
    const total = await Product.countDocuments(query);

    res.json({
      products: productos,
      currentPage: pageNumber,
      totalPages: Math.ceil(total / pageLimit)
    });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos.' });
    return 
  }
};

/** Obtener producto por ID */
export const obtenerProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) {
      res.status(404).json({ message: 'Producto no encontrado.' });
      return 
    }
    res.json(prod);
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener producto.' });
    return 
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
      categoria,
      imagenes
    } = req.body;

    const prod = await Product.findById(id);
    if (!prod) {
      res.status(404).json({ message: 'Producto no encontrado.' });
      return 
    }

    if (codigo !== undefined) prod.codigo = codigo;
    if (nombre !== undefined) prod.nombre = nombre;
    if (precio !== undefined) prod.precio = precio;
    if (descripcion !== undefined) prod.descripcion = descripcion;
    if (stock !== undefined) prod.stock = stock;
    if (proveedor !== undefined) prod.proveedor = proveedor;
    if (categoria !== undefined) prod.categoria = categoria;
    if (imagenes !== undefined) prod.imagenes = imagenes;

    await prod.save();
    res.json({ message: 'Producto actualizado con éxito.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto.' });
    return 
  }
};

/** Eliminar producto */
export const eliminarProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prod = await Product.findByIdAndDelete(id);
    if (!prod) {
      res.status(404).json({ message: 'Producto no encontrado.' });
      return 
    }
    res.json({ message: 'Producto eliminado con éxito.' });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto.' });
    return 
  }
};

/** Subir Imagen a Cloudinary (si quieres manejar la subida desde el Backend) */
export const subirImagen = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No se envió ningún archivo.' });
      return 
    }
    const filePath = req.file.path;
    const uploadResp = await cloudinary.uploader.upload(filePath);
    res.json({ secure_url: uploadResp.secure_url });
    return 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al subir imagen a Cloudinary' });
    return 
  }
};

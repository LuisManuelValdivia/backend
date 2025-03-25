// backend/src/models/productModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  codigo: string;
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  proveedor: string;
  categoria: string; // Se añade categoría
  imagenes: string[]; // array de URLs
}

const productSchema = new Schema({
  codigo: { type: String, required: true },
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  stock: { type: Number, required: true },
  proveedor: { type: String, required: true },
  categoria: { type: String, required: true },
  imagenes: { type: [String], required: true }
}, {
  timestamps: true
});

export default mongoose.model<IProduct>('Product', productSchema);
  
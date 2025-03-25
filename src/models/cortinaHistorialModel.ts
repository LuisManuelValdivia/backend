// backend/src/models/cortinaHistorialModel.ts
import { Schema, model } from 'mongoose';

const cortinaHistorialSchema = new Schema({
  deviceId: { type: String, required: true },
  modo: { type: String, required: true },     // "Manual" o "Automático"
  estado: { type: String, required: true },   // "Abierto" o "Cerrado"
  metodo: { type: String, required: true },   // "boton", "luz", "sonido", "comando"
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

export default model('CortinaHistorial', cortinaHistorialSchema, 'cortinahistorial');
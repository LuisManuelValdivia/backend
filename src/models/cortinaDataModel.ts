// backend/src/models/cortinaDataModel.ts
import { Schema, model } from 'mongoose';

const cortinaDataSchema = new Schema({
  deviceId: { type: String, required: true, unique: true },
  modoAutomatico: { type: Boolean, default: false },
  cortinaAbierta: { type: Boolean, default: false },
  ldrValue: { type: Number, default: 0 },
  soundValue: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now } // para saber la última actualización
});

export default model('CortinaData', cortinaDataSchema, 'cortinadatas');
// backend/src/models/companyModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  titulo?: string;
  ubicacion?: string;
  mision?: string;
  vision?: string;
  telefono?: string;
  correo?: string;
  preguntasFrecuentes?: string;
  terminosCondiciones?: string;
  politicasPrivacidad?: string;
}

const companySchema = new Schema({
  titulo: { type: String },
  ubicacion: { type: String },
  mision: { type: String },
  vision: { type: String },
  telefono: { type: String },
  correo: { type: String },
  preguntasFrecuentes: { type: String },
  terminosCondiciones: { type: String },
  politicasPrivacidad: { type: String }
}, {
  timestamps: true
});

export default mongoose.model<ICompany>('Company', companySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  nombre: string;
  correo: string;
  contraseña: string; // Hasheada con bcrypt
  telefono: string;
  preguntaSecreta: string;
  respuestaSecreta: string;
  rol: string; // 'usuario' o 'admin'
}

const userSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    telefono: { type: String, required: true },
    preguntaSecreta: { type: String, required: true },
    respuestaSecreta: { type: String, required: true },
    rol: { type: String, default: 'usuario' } // Valor por defecto
  },
  {
    timestamps: true // guarda fecha de creación y actualización
  }
);

export default mongoose.model<IUser>('User', userSchema);

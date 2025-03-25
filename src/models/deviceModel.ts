// backend/src/models/deviceModel.ts
import { Schema, model } from 'mongoose';

const deviceSchema = new Schema({
  mac: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Por defecto, Mongoose usará la colección "devices"
export default model('Device', deviceSchema);
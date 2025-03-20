// backend/src/config/db.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Carga las variables del .env

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || '';
    if (!MONGO_URI) {
      throw new Error('No se encontró la variable MONGO_URI en el archivo .env');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB Atlas correctamente.');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error);
    process.exit(1); // Detiene la app
  }
};

export default connectDB;


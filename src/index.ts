import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import companyRoutes from './routes/companyRoutes';

import cortinaRoutes from './routes/cortinaRoutes';
import deviceRoutes from './routes/deviceRoutes';

import mqttClient from "./config/mqttClient"; // para inicializar

// Cargar las variables de entorno desde .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Conectar a MongoDB Atlas
connectDB(); // dentro usa process.env.MONGO_URI

// Habilitar CORS incluyendo credenciales (cookies)
app.use(
  cors({
    origin: 'http://localhost:3000', // tu frontend
    credentials: true
  })
);

app.use(express.json());

// Para la sesión, usamos el SECRET_KEY definido en .env o uno por defecto
const SECRET_KEY = process.env.SECRET_KEY || 'algunoSecreto';

// Configurar sesión
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      // Usa también la misma variable de entorno para las sesiones
      mongoUrl: process.env.MONGO_URI, 
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 día
      httpOnly: true
      // sameSite: 'none', // a veces necesario si usas HTTPS
      // secure: true      // si tuvieras HTTPS, se activa
    }
  })
);

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Rutas de productos
app.use('/api/products', productRoutes);

app.use('/api/company', companyRoutes);

// Rutas
//app.use("/api/cortina", cortinaRoutes);

app.use('/api/cortina', cortinaRoutes);
//app.use('/api/users', userRoutes); // etc...
app.use('/api/devices', deviceRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

import mongoose from "mongoose";

export interface Isession {
  // existing properties
  user?: {
    _id: string;
    nombre: string;
    correo: string;
    rol: string;
    deviceId: string;
  };
}

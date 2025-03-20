import mongoose from "mongoose";

const CortinaDataSchema = new mongoose.Schema({
  modoAutomatico: { type: Boolean, required: true },
  cortinaAbierta: { type: Boolean, required: true },
  ldrValue:       { type: Number,  required: true },
  soundValue:     { type: Number,  required: true },
  timestamp:      { type: Date,    default: Date.now }
});

const CortinaData = mongoose.model("CortinaData", CortinaDataSchema);
export default CortinaData;

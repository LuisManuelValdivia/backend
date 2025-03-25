// backend/src/models/iotModel.ts
import mongoose from "mongoose";

const IoTDataSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
  modoAutomatico: { type: Boolean, required: true },
  cortinaAbierta: { type: Boolean, required: true },
  ldrValue: { type: Number, required: true },
  soundValue: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const IoTData = mongoose.model("IoTData", IoTDataSchema);
export default IoTData;

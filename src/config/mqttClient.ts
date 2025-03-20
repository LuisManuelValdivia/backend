import mqtt from "mqtt";
import CortinaData from "../models/cortinaModel"; // Ajusta la ruta

const mqttClient = mqtt.connect("mqtts://l2f52680.ala.us-east-1.emqxsl.com", {
  port: 8883,
  username: "esp32",
  password: "12345678",
});

mqttClient.on("connect", () => {
  console.log("✅ Conectado al broker MQTT");
  // Suscribirse al tópico de datos
  mqttClient.subscribe("esp32/cortina/data", (err) => {
    if (err) {
      console.error("Error al suscribirse a esp32/cortina/data:", err);
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  if (topic === "esp32/cortina/data") {
    try {
      const data = JSON.parse(message.toString());
      // Guardar en MongoDB
      const newData = new CortinaData({
        modoAutomatico:  data.modoAutomatico,
        cortinaAbierta:  data.cortinaAbierta,
        ldrValue:        data.ldrValue,
        soundValue:      data.soundValue,
      });
      await newData.save();
      console.log("📡 Cortina data guardada:", newData);
    } catch (error) {
      console.error("❌ Error procesando datos de la cortina:", error);
    }
  }
});

export default mqttClient;

// backend/src/mqttClient.ts
import mqtt from "mqtt";
import CortinaData from "../models/cortinaDataModel";
import CortinaHistorial from "../models/cortinaHistorialModel";

const mqttClient = mqtt.connect("mqtts://l2f52680.ala.us-east-1.emqxsl.com", {
  port: 8883,
  username: "esp32",
  password: "12345678",
});

mqttClient.on("connect", () => {
  console.log("✅ Conectado al broker MQTT");
  mqttClient.subscribe("esp32/cortina/data", (err) => {
    if (err) {
      console.error("Error al suscribirse a esp32/cortina/data:", err);
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  if (topic === "esp32/cortina/data") {
    try {
      // Parseamos la data entrante
      const data = JSON.parse(message.toString());
      // Se asume que la placa envía algo como:
      // { deviceId, modoAutomatico, cortinaAbierta, ldrValue, soundValue }

      const {
        deviceId,
        modoAutomatico,
        cortinaAbierta,
        ldrValue,
        soundValue
      } = data;

      // Validar deviceId
      if (!deviceId) {
        // Si no viene deviceId, no sabemos a qué dispositivo pertenece
        return;
      }

      // 1. Obtener datos anteriores
      const oldData = await CortinaData.findOne({ deviceId });

      // Variables para detectar cambios
      let cambioDeEstado = false;
      let cambioDeModo   = false;
      let oldSoundValue  = 0;

      if (oldData) {
        cambioDeEstado = (oldData.cortinaAbierta !== cortinaAbierta);
        cambioDeModo   = (oldData.modoAutomatico !== modoAutomatico);
        oldSoundValue  = oldData.soundValue || 0;
      } else {
        // Si no hay datos previos, consideramos que es la primera vez.
        // Marcamos ambos como cambios para registrar un estado inicial.
        cambioDeEstado = true;
        cambioDeModo   = true;
      }

      // 2. Actualizar (o crear) el documento en cortinaData
      //    Se hace DESPUÉS de leer oldData para no perder la comparación
      const updated = await CortinaData.findOneAndUpdate(
        { deviceId },
        {
          modoAutomatico,
          cortinaAbierta,
          ldrValue,
          soundValue,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log("📡 Cortina data actualizada:", updated);

      // 3. Determinar si creamos un registro en historial
      if (cambioDeEstado || cambioDeModo) {
        let metodo = "desconocido";

        // 3a. Si cambió el estado (abrir/cerrar)
        if (cambioDeEstado) {
          // Si estamos en modo automático => "luz"
          if (modoAutomatico) {
            metodo = "luz";
          } else {
            // Modo manual => ver si soundValue cambió de 0 a 1 => "sonido"
            if (oldSoundValue === 0 && soundValue === 1) {
              metodo = "sonido";
            } else {
              metodo = "boton";
            }
          }
        }
        // 3b. Si NO cambió el estado, pero SÍ cambió el modo => "boton"
        else if (cambioDeModo) {
          metodo = "boton";
        }

        // 4. Insertar un registro en cortinaHistorial
        await CortinaHistorial.create({
          deviceId,
          modo: modoAutomatico ? "Automático" : "Manual",
          estado: cortinaAbierta ? "Abierto" : "Cerrado",
          metodo,
          fecha: new Date()
        });
        console.log("📝 Evento guardado en historial con método:", metodo);
      }

    } catch (error) {
      console.error("❌ Error procesando datos de la cortina:", error);
    }
  }
});

export default mqttClient;

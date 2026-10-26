import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";

export const configGiroscopio = {
  touchmove: true,
  roll: true,
  moveMode: "smooth",
};

export function esMovil() {
  return window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0;
}

export async function pedirPermisoMovimiento() {
  if (!esMovil() || !window.isSecureContext) return;
  const api = window.DeviceOrientationEvent;
  if (api && typeof api.requestPermission === "function") {
    try {
      await api.requestPermission();
    } catch {
      /* el usuario canceló o el navegador no lo permite */
    }
  }
}

export async function activarGiroscopioMovil(visor) {
  if (!esMovil()) {
    ocultarAvisoGiroscopio();
    return;
  }

  const gyro = visor.getPlugin(GyroscopePlugin);
  if (!gyro) return;

  if (!window.isSecureContext) {
    mostrarAvisoGiroscopio(
      `El giroscopio solo funciona en HTTPS. En el Mac corre python3 servidor-https.py y abre https://${location.hostname}:8443${location.pathname}${location.search}`,
    );
    return;
  }

  if (gyro.isEnabled()) {
    ocultarAvisoGiroscopio();
    return;
  }

  const soportado = await gyro.isSupported();
  if (!soportado) {
    mostrarAvisoGiroscopio("Este celular no reporta giroscopio.");
    return;
  }

  try {
    await gyro.start();
    ocultarAvisoGiroscopio();
  } catch {
    mostrarAvisoGiroscopio("Toca aquí y mueve el celular para mirar", async () => {
      await pedirPermisoMovimiento();
      try {
        await gyro.start();
      } catch {
        /* permiso denegado */
      }
      ocultarAvisoGiroscopio();
    });
  }
}

export function ocultarAvisoGiroscopio() {
  document.getElementById("va-giroscopio-aviso")?.remove();
}

function mostrarAvisoGiroscopio(texto, alClic) {
  let aviso = document.getElementById("va-giroscopio-aviso");
  if (!aviso) {
    aviso = document.createElement(alClic ? "button" : "p");
    aviso.id = "va-giroscopio-aviso";
    aviso.className = "va-giroscopio-aviso";
    document.body.appendChild(aviso);
  }
  if (alClic) {
    aviso.type = "button";
    aviso.onclick = alClic;
  }
  aviso.textContent = texto;
}

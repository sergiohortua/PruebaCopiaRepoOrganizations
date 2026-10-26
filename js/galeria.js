import { Viewer } from "@photo-sphere-viewer/core";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import { ambientes, textosVisor } from "./ambientes.js";
import { activarGiroscopioMovil, configGiroscopio, pedirPermisoMovimiento, ocultarAvisoGiroscopio } from "./giroscopio.js";

const lista = document.getElementById("lista-galeria");
const modal = document.getElementById("visor-modal");
const titulo = document.getElementById("visor-titulo");
const contenedor = document.getElementById("visor");
const botonCerrar = document.getElementById("visor-cerrar");

let visor = null;
let ultimoFoco = null;

function pintarTarjetas() {
  const fragmento = document.createDocumentFragment();

  for (const ambiente of ambientes) {
    const tarjeta = document.createElement("button");
    tarjeta.type = "button";
    tarjeta.className = "va-tarjeta";
    tarjeta.dataset.id = ambiente.id;
    tarjeta.setAttribute("aria-label", `Ver ${ambiente.titulo} en 360`);
    tarjeta.innerHTML = `
      <img src="${ambiente.miniatura}" alt="" width="480" height="270">
      <div class="va-tarjeta-cuerpo">
        <h3>${ambiente.titulo}</h3>
        <p>${ambiente.descripcion}</p>
      </div>
    `;
    tarjeta.addEventListener("click", () => abrirVisor(ambiente.id));
    fragmento.appendChild(tarjeta);
  }

  lista.replaceChildren(fragmento);
}

function abrirVisor(id) {
  const ambiente = ambientes.find((item) => item.id === id);
  if (!ambiente) return;

  ultimoFoco = document.activeElement;
  titulo.textContent = ambiente.titulo;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  botonCerrar.focus();
  pedirPermisoMovimiento();

  if (visor) {
    visor.setPanorama(ambiente.imagen, { caption: ambiente.titulo });
    activarGiroscopioMovil(visor);
    return;
  }

  visor = new Viewer({
    container: contenedor,
    panorama: ambiente.imagen,
    caption: ambiente.titulo,
    loadingTxt: "Cargando imagen 360…",
    navbar: ["zoom", "move", "caption", "gyroscope", "fullscreen"],
    lang: textosVisor,
    plugins: [GyroscopePlugin.withConfig(configGiroscopio)],
  });
  visor.addEventListener("ready", () => activarGiroscopioMovil(visor), { once: true });
}

function cerrarVisor() {
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.style.overflow = "";
  ocultarAvisoGiroscopio();
  if (visor) {
    visor.destroy();
    visor = null;
  }
  if (ultimoFoco && typeof ultimoFoco.focus === "function") {
    ultimoFoco.focus();
  }
}

botonCerrar.addEventListener("click", cerrarVisor);

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") cerrarVisor();
});

pintarTarjetas();

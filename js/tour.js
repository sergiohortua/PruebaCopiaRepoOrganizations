import { Viewer } from "@photo-sphere-viewer/core";
import { GalleryPlugin } from "@photo-sphere-viewer/gallery-plugin";
import { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import { nodosTour, textosVisor } from "./ambientes.js";
import { activarGiroscopioMovil, configGiroscopio } from "./giroscopio.js";

const params = new URLSearchParams(window.location.search);
const nombreAmbiente = document.getElementById("nombre-ambiente");
const inicio = params.get("inicio") || "sala-cocina";
const depurar = params.has("debug");
const existe = nodosTour.some((nodo) => nodo.id === inicio);
const TAMANO_FLECHA = { width: 18, height: 18 };

function aGrados(radianes) {
  let grados = (radianes * 180) / Math.PI;
  grados = ((((grados + 180) % 360) + 360) % 360) - 180;
  return Math.round(grados * 10) / 10;
}

function snippetPosicion(yaw, pitch) {
  return `{ yaw: "${yaw}deg", pitch: "${pitch}deg" }`;
}

function activarCalibracion(visor, tour) {
  window.visor = visor;
  window.tour = tour;

  /* Descomentar para ver el panel de calibración */
  const panel = document.createElement("aside");
  panel.className = "va-calibrar";
  panel.innerHTML = `
    <p class="va-calibrar-titulo">Calibrar flechas</p>
    <p>Nodo: <strong data-nodo>—</strong></p>
    <p>Clic: <code data-clic>haz clic en la puerta</code></p>
    <p>Vista: <code data-vista>—</code></p>
    <button type="button" data-copiar>Copiar posición</button>
    <p class="va-calibrar-ayuda">Pega yaw y pitch en js/ambientes.js. El tamaño se cambia en TAMANO_FLECHA (js/tour.js). En consola: visor.getPosition()</p>
  `;
  //document.body.appendChild(panel);

  const nodoEl = panel.querySelector("[data-nodo]");
  const clicEl = panel.querySelector("[data-clic]");
  const vistaEl = panel.querySelector("[data-vista]");
  const copiar = panel.querySelector("[data-copiar]");
  let ultima = null;

  function pintarNodo() {
    const nodo = tour.getCurrentNode();
    nodoEl.textContent = nodo ? nodo.id : "—";
  }

  function pintarVista() {
    const { yaw, pitch } = visor.getPosition();
    vistaEl.textContent = snippetPosicion(aGrados(yaw), aGrados(pitch));
  }

  visor.addEventListener("position-updated", pintarVista);
  visor.addEventListener("click", ({ data }) => {
    if (!data) return;
    const yaw = aGrados(data.yaw);
    const pitch = aGrados(data.pitch);
    ultima = { yaw, pitch };
    const snippet = snippetPosicion(yaw, pitch);
    clicEl.textContent = snippet;
    console.log(`[calibrar] ${nodoEl.textContent} ${snippet}`);
  });
  tour.addEventListener("node-changed", pintarNodo);

  copiar.addEventListener("click", async () => {
    if (!ultima) return;
    await navigator.clipboard.writeText(snippetPosicion(ultima.yaw, ultima.pitch));
    copiar.textContent = "Copiado";
    setTimeout(() => {
      copiar.textContent = "Copiar posición";
    }, 1200);
  });

  pintarNodo();
  pintarVista();
}

const visor = new Viewer({
  container: "tour",
  loadingTxt: "Cargando recorrido…",
  canvasBackground: "#111",
  navbar: ["zoom", "move", "caption", "gallery", "gyroscope", "fullscreen"],
  lang: textosVisor,
  plugins: [
    GyroscopePlugin.withConfig(configGiroscopio),
    GalleryPlugin.withConfig({
      visibleOnLoad: false,
      hideOnClick: true,
    }),
    VirtualTourPlugin.withConfig({
      dataMode: "client",
      positionMode: "manual",
      renderMode: "2d",
      arrowStyle: {
        size: TAMANO_FLECHA,
        className: "va-flecha",
      },
      startNodeId: existe ? inicio : "sala-cocina",
      preload: true,
      transitionOptions: {
        showLoader: true,
        speed: "20rpm",
        effect: "fade",
        rotation: true,
      },
      nodes: nodosTour,
    }),
  ],
});

const tour = visor.getPlugin(VirtualTourPlugin);

tour.addEventListener("node-changed", ({ node }) => {
  nombreAmbiente.textContent = node.name;
});

visor.addEventListener("ready", () => {
  const actual = tour.getCurrentNode();
  if (actual) {
    nombreAmbiente.textContent = actual.name;
  }
  if (depurar) {
    activarCalibracion(visor, tour);
  }
  activarGiroscopioMovil(visor);
});

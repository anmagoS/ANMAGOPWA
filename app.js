// === Obtener parámetros desde URL ===
function getParametrosDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    tipo: params.get("tipo")?.trim(),
    subtipo: params.get("subtipo")?.trim(),
    categoria: params.get("categoria")?.trim()
  };
}

// === Cargar catálogo global ===
async function cargarCatalogoGlobal() {
  try {
    const url = "https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json";
    const res = await fetch(url);
    const productos = await res.json();
    window.catalogoGlobal = productos;
  } catch (err) {
    console.error("❌ Error al cargar catálogo:", err);
  }
}
// === Cargar accesos globales ===
async function cargarAccesosGlobal() {
  try {
    const url = "https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/accesos.json";
    const res = await fetch(url);
    const accesos = await res.json();
    window.accesosGlobal = accesos;
  } catch (err) {
    console.error("❌ Error al cargar accesos:", err);
  }
}

// === Mostrar temporizador de promociones ===
// === Mostrar temporizador de promociones alineado con ciclos de 3 horas ===
function mostrarTemporizadorPromos() {
  const contenedor = document.getElementById("temporizador-promos");
  if (!contenedor) return;

  setInterval(() => {
    const ahora = new Date();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();
    const horas = ahora.getHours();

    // Calcular siguiente corte de 3 horas
    const siguienteCorte = Math.ceil(horas / 6) * 6;
    const siguienteFecha = new Date(ahora);
    siguienteFecha.setHours(siguienteCorte, 0, 0, 0);

    const restante = siguienteFecha - ahora;

    const horasRestantes = Math.floor(restante / (1000 * 60 * 60));
    const minutosRestantes = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
    const segundosRestantes = Math.floor((restante % (1000 * 60)) / 1000);

    contenedor.textContent = `⏰ Cambia en ${horasRestantes}h ${minutosRestantes}m ${segundosRestantes}s`;
  }, 1000);
}


// === Renderizar menú lateral desde catálogo ===
function renderizarMenuLateral(catalogo) {
  const menu = document.getElementById("menu-categorias");
  if (!menu) return;

  const mapa = {};
  catalogo.forEach(p => {
    if (!p.tipo || !p.subtipo || !p.categoria) return;
    if (!mapa[p.tipo]) mapa[p.tipo] = {};
    if (!mapa[p.tipo][p.subtipo]) mapa[p.tipo][p.subtipo] = new Set();
    mapa[p.tipo][p.subtipo].add(p.categoria);
  });

  Object.entries(mapa).forEach(([tipo, subtipos]) => {
    const bloqueTipo = document.createElement("details");
    bloqueTipo.innerHTML = `<summary class="fw-bold">${tipo}</summary>`;

    Object.entries(subtipos).forEach(([subtipo, categorias]) => {
      const bloqueSubtipo = document.createElement("details");
      bloqueSubtipo.innerHTML = `<summary>${subtipo}</summary>`;

      categorias.forEach(categoria => {
        const link = document.createElement("a");
        link.className = "nav-link ps-3";
        link.textContent = categoria;
        link.href = `PRODUCTOS.HTML?tipo=${encodeURIComponent(tipo)}&subtipo=${encodeURIComponent(subtipo)}&categoria=${encodeURIComponent(categoria)}`;
        bloqueSubtipo.appendChild(link);
      });

      bloqueTipo.appendChild(bloqueSubtipo);
    });

    menu.appendChild(bloqueTipo);
  });
}

// === Renderizar carrusel de promociones con rotación automática cada 3 horas ===
function renderCarruselPromosDesdePromos() {
  const contenedor = document.getElementById("carousel-promos-contenido");
  if (!contenedor || !Array.isArray(promocionesGlobal)) return;

  const cantidadPorCiclo = 4;
  const ciclosPorDia = 4;
  const indiceActual = obtenerIndicePromocional(cantidadPorCiclo, ciclosPorDia);
  const bloqueCarrusel = promocionesGlobal.slice(indiceActual, indiceActual + cantidadPorCiclo);

  contenedor.innerHTML = "";

  bloqueCarrusel.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = `carousel-item ${index === 0 ? "active" : ""}`;
    item.innerHTML = `
      <div class="d-flex justify-content-center">
        <div class="card" style="width: 18rem;">
          <img src="${p.imagen}" class="card-img-top" alt="${p.producto}">
          <div class="card-body text-center">
            <h5 class="card-title">${p.producto}</h5>
            <p class="card-text">
              <s class="text-muted me-2">$${p.precio.toLocaleString("es-CO")}</s>
              <span class="text-success fw-bold">$${(p.precio * 0.9).toLocaleString("es-CO")}</span>
            </p>
            <a href="producto.html?id=${p.id}" class="boton-comprar">Ver producto</a>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(item);
  });
}
function renderPromocionesPorCiclo(productos) {
  const contenedor = document.getElementById("contenedor-promos");
  if (!contenedor) return;

  const promociones = productos.filter(p => {
    const promo = typeof p.promo === "string" ? p.promo.toLowerCase().trim() : p.promo;
    return promo === true || promo === "true" || promo === "sí" || promo === "activo";
  });

  const cantidadPorCiclo = 4;
  const ciclosPorDia = 4; // 24 / 6
  const ahora = new Date();
  const inicio = new Date("2025-11-08T00:00:00");
  const diferenciaHoras = Math.floor((ahora - inicio) / (1000 * 60 * 60));
  const cicloActual = diferenciaHoras % (ciclosPorDia * 365);
  const indiceActual = (cicloActual * cantidadPorCiclo) % promociones.length;

  const bloque = promociones.slice(indiceActual, indiceActual + cantidadPorCiclo);
  contenedor.innerHTML = "";

  bloque.forEach(p => {
    const precioOriginal = Number(p.precio) || 0;
    const precioDescuento = Math.round(precioOriginal * 0.9);

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <a href="producto.html?id=${p.id}">
        <div class="imagen-producto">
          <img src="${p.imagen}" alt="${p.producto}">
          <span class="etiqueta-promo">🔥 10%</span>
        </div>
      </a>
      <div class="nombre-producto">${p.producto}</div>
      <div class="nombre-producto">${p.material || ""}</div>
      <div class="nombre-producto">${p.tallas || ""}</div>
      <div class="precio-producto">
        <s>$${precioOriginal.toLocaleString("es-CO")} COP</s>
        <span class="text-success fw-bold">$${precioDescuento.toLocaleString("es-CO")} COP</span>
      </div>
      <a href="producto.html?id=${p.id}" class="boton-comprar">Ver más</a>
    `;
    contenedor.appendChild(tarjeta);
  });
}
  // 🔁 Calcular índice dinámico según ciclo de 3 horas
  const cantidadPorCiclo = 4;
  const ciclosPorDia = 4; // 24 / 3
  const ahora = new Date();
  const inicio = new Date("2025-11-08T00:00:00"); // fecha base institucional
  const diferenciaHoras = Math.floor((ahora - inicio) / (1000 * 60 * 60));
  const cicloActual = diferenciaHoras % (ciclosPorDia * 365); // rotación para 1 año
  const indiceActual = (cicloActual * cantidadPorCiclo) % promociones.length;

  const bloqueCarrusel = promociones.slice(indiceActual, indiceActual + cantidadPorCiclo);
  contenedor.innerHTML = "";

  bloqueCarrusel.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = `carousel-item ${index === 0 ? "active" : ""}`;
    item.innerHTML = `
      <div class="d-flex justify-content-center">
        <div class="card" style="width: 18rem;">
          <img src="${p.imagen}" class="card-img-top" alt="${p.producto}">
          <div class="card-body text-center">
            <h5 class="card-title">${p.producto}</h5>
            <p class="card-text">
              <s class="text-muted me-2">$${p.precio.toLocaleString("es-CO")}</s>
              <span class="text-success fw-bold">$${(p.precio * 0.9).toLocaleString("es-CO")}</span>
            </p>
            <a href="producto.html?id=${p.id}" class="boton-comprar">Ver producto</a>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(item);
  });
}

// === Inicialización principal ===
document.addEventListener("DOMContentLoaded", async () => {
  const { tipo, subtipo, categoria } = getParametrosDesdeURL();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("✅ Service Worker registrado"))
      .catch(err => console.error("❌ Error al registrar SW:", err));
  }

  await cargarCatalogoGlobal();
  await cargarAccesosGlobal();
  window.catalogo = window.catalogoGlobal || [];
// ✅ Mostrar botón de instalación PWA si no está instalado
const esPWAInstalado = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

if (!esPWAInstalado) {
  const contenedor = document.getElementById("instalar-container");
  if (contenedor) contenedor.classList.remove("d-none");
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const boton = document.getElementById("boton-instalar");
  boton?.addEventListener("click", async () => {
    deferredPrompt.prompt();
    const resultado = await deferredPrompt.userChoice;
    console.log("📲 Resultado instalación:", resultado.outcome);
    deferredPrompt = null;
    document.getElementById("instalar-container")?.classList.add("d-none");
  });
});
  // ✅ Cargar encabezado
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer.querySelector(".header")) {
    const header = await fetch("HEADER.HTML").then(res => res.text());
    headerContainer.insertAdjacentHTML("afterbegin", header);
    await new Promise(resolve => requestAnimationFrame(resolve));
  }

  // ✅ Ahora que el header está listo, renderizar menú lateral
  if (Array.isArray(window.catalogoGlobal) && window.catalogoGlobal.length > 0) {
    renderizarMenuLateral(window.catalogoGlobal);
    renderCarruselPromosDesdePromos(window.catalogoGlobal);
    renderPromocionesPorCiclo(window.catalogoGlobal);
  
  }

  // ✅ Activar buscador si existe
  if (typeof activarBuscadorGlobal === "function") {
    activarBuscadorGlobal();
  }

  // ✅ Activar botón flotante del carrito
  const carritoBtn = document.querySelector(".btn_shopping");
  carritoBtn?.addEventListener("click", e => {
    e.preventDefault();
    const offcanvas = document.getElementById("offcanvasCarrito");
    if (offcanvas) {
      const instancia = bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
      instancia.show();
    }
  });

  // ✅ Mostrar temporizador
  mostrarTemporizadorPromos();

  // ✅ Cargar pie de página
  const footer = await fetch("footer.html").then(res => res.text());
  document.getElementById("footer-container").innerHTML = footer;

  // ✅ Activar menú lateral si existe
  const toggle = document.getElementById("toggle-categorias");
  const menu = document.getElementById("menu-categorias");
  toggle?.addEventListener("click", () => {
    menu.style.display = menu.style.display === "none" ? "flex" : "none";
  });

  // ✅ Renderizar productos si aplica
  if (document.getElementById("contenido-productos")) {
    const rutaActual = window.location.pathname;
    const accesosRuta = window.accesosGlobal?.filter(a => a.ruta === rutaActual) || [];
    const idsRuta = accesosRuta.map(a => a.id_producto);
    const productosFiltrados = window.catalogoGlobal.filter(p => idsRuta.includes(p.id));
       renderizarProductos(productosFiltrados.length ? productosFiltrados : window.catalogoGlobal);
  }

  // ✅ Actualizar contador del carrito si la función está disponible
  if (typeof window.actualizarContadorCarrito === "function") {
    window.actualizarContadorCarrito();
  }

  // ✅ Renderizar contenido del carrito si la función está disponible y el catálogo está listo
  if (
    typeof window.renderizarCarrito === "function" &&
    Array.isArray(window.catalogoGlobal) &&
    window.catalogoGlobal.length > 0 &&
    document.getElementById("carrito-contenido")
  ) {
    window.renderizarCarrito();
  }
});

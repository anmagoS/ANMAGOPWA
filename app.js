// === Obtener parámetros desde URL ===
function getParametrosDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    tipo: params.get("tipo")?.trim(),
    subtipo: params.get("subtipo")?.trim(),
    categoria: params.get("categoria")?.trim()
  };
}
// === Función compartida para índice promocional ===
function obtenerIndicePromocional(cantidadPorCiclo = 4, ciclosPorDia = 4, totalPromos = 0) {
  const ahora = new Date();
  ahora.setMinutes(0, 0, 0); // elimina minutos, segundos y milisegundos

  const inicio = new Date(Date.UTC(2025, 10, 8, 0, 0, 0)); // noviembre = 10, UTC fijo

  const diferenciaHoras = Math.floor((ahora - inicio) / (1000 * 60 * 60));
  const cicloActual = diferenciaHoras % (ciclosPorDia * 365);
  const indice = cicloActual * cantidadPorCiclo;

  return totalPromos > 0 ? indice % totalPromos : 0;
}


// === Mostrar temporizador de promociones ===
function mostrarTemporizadorPromos() {
  const contenedor = document.getElementById("temporizador-promos");
  if (!contenedor) return;

  setInterval(() => {
    const ahora = new Date();
    const horas = ahora.getHours();
    const siguienteCorte = horas % 6 === 0 ? horas + 6 : Math.ceil(horas / 6) * 6;
    const siguienteFecha = new Date(ahora);
    siguienteFecha.setHours(siguienteCorte, 0, 0, 0);

    const restante = siguienteFecha - ahora;
    if (restante <= 0) {
      contenedor.textContent = "⏳ ¡Promociones actualizadas!";
      return;
    }

    const horasRestantes = Math.floor(restante / (1000 * 60 * 60));
    const minutosRestantes = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
    const segundosRestantes = Math.floor((restante % (1000 * 60)) / 1000);

    contenedor.textContent = `⏰ Cambia en ${horasRestantes}h ${minutosRestantes}m ${segundosRestantes}s`;
  }, 1000);
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
        link.href = "#";
        // ✅ USAR EL NUEVO SISTEMA DE NAVEGACIÓN
        link.onclick = (e) => {
          e.preventDefault();
          cargarProductos(tipo, subtipo, categoria);
        };
        bloqueSubtipo.appendChild(link);
      });

      bloqueTipo.appendChild(bloqueSubtipo);
    });

    menu.appendChild(bloqueTipo);
  });
}
// ✅ FUNCIÓN PARA CERRAR EL MENÚ LATERAL
function cerrarMenuLateral() {
  const menu = document.getElementById("menu-categorias");
  const toggle = document.getElementById("toggle-categorias");
  
  if (menu && window.innerWidth < 768) { // Solo en móvil
    menu.style.display = "none";
    
    // También cerrar todos los details abiertos
    const detailsAbiertos = menu.querySelectorAll('details[open]');
    detailsAbiertos.forEach(detail => {
      detail.removeAttribute('open');
    });
  }
}
// === Renderizar carrusel de promociones ===
function renderCarruselPromosDesdePromos() {
  const contenedor = document.getElementById("carousel-promos-contenido");
  if (!contenedor || !Array.isArray(window.promocionesGlobal)) return;

  const cantidadPorCiclo = 4;
  const ciclosPorDia = 4;
const totalPromos = window.promocionesGlobal.length;
const indiceActual = obtenerIndicePromocional(cantidadPorCiclo, ciclosPorDia, totalPromos);
 let bloqueCarrusel = window.promocionesGlobal.slice(indiceActual, indiceActual + cantidadPorCiclo);
  if (bloqueCarrusel.length < cantidadPorCiclo && totalPromos >= cantidadPorCiclo) {
    bloqueCarrusel = window.promocionesGlobal.slice(0, cantidadPorCiclo); // fallback si el índice se desborda
  }
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
            <a href="PRODUCTO.HTML?id=${p.id}" class="boton-comprar">Ver producto</a>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(item);
  });
}

// === Renderizar promociones por ciclo ===
function renderPromocionesPorCiclo() {
  const contenedor = document.getElementById("contenedor-promos");
  if (!contenedor || !Array.isArray(window.promocionesGlobal)) return;

  const cantidadPorCiclo = 4;
  const ciclosPorDia = 4;
  const totalPromos = window.promocionesGlobal.length;

  if (totalPromos === 0) {
    contenedor.innerHTML = `<div class="text-center text-muted">No hay promociones disponibles.</div>`;
    console.warn("⚠️ promocionesGlobal está vacío.");
    return;
  }

  const indiceActual = obtenerIndicePromocional(cantidadPorCiclo, ciclosPorDia, totalPromos);
  const bloque = window.promocionesGlobal.slice(indiceActual, indiceActual + cantidadPorCiclo);

  if (bloque.length === 0) {
    contenedor.innerHTML = `<div class="text-center text-muted">No hay promociones activas en este momento.</div>`;
    console.warn("⚠️ Bloque vacío. índiceActual:", indiceActual);
    return;
  }

  contenedor.innerHTML = "";
  contenedor.classList.toggle("bloque-incompleto", bloque.length < cantidadPorCiclo);
  console.log("🔁 Bloque activo:", bloque.map(p => p.id));

  bloque.forEach(p => {
    const precioOriginal = Number(p.precio) || 0;
    const precioDescuento = Math.round(precioOriginal * 0.9);

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <a href="PRODUCTO.HTML?id=${p.id}">
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
      <a href="PRODUCTO.HTML?id=${p.id}" class="boton-comprar">Ver más</a>
    `;
    contenedor.appendChild(tarjeta);
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

  // ✅ Filtrar promociones globales
  window.promocionesGlobal = window.catalogoGlobal.filter(p => {
    const promo = typeof p.promo === "string" ? p.promo.toLowerCase().trim() : p.promo;
    return promo === true || promo === "true" || promo === "sí" || promo === "activo";
  });

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

  // ✅ Renderizar menú lateral y promociones
  if (Array.isArray(window.catalogoGlobal) && window.catalogoGlobal.length > 0) {
    renderizarMenuLateral(window.catalogoGlobal);
    renderCarruselPromosDesdePromos();
    renderPromocionesPorCiclo();
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

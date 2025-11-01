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
async function mostrarTemporizadorPromos() {
  const contenedor = document.getElementById("temporizador-promos");
  if (!contenedor) return;

  let fin = null;

  try {
    const url = `https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/temporizador.json?nocache=${Date.now()}`;
    const res = await fetch(url);
    const { finPromo } = await res.json();
    fin = new Date(finPromo);
  } catch (err) {
    console.error("❌ Error al mostrar temporizador:", err);
    contenedor.textContent = "⏳ Temporizador no disponible";
    return;
  }

  // 🕒 Mostrar temporizador siempre, incluso si ya venció
  setInterval(() => {
    if (!fin) return;

    const ahora = new Date();
    const restante = fin - ahora;

    if (restante <= 0) {
      contenedor.textContent = "⏳ Promociones actualizadas";
      return;
    }

    const horas = Math.floor(restante / (1000 * 60 * 60));
    const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((restante % (1000 * 60)) / 1000);

    contenedor.textContent = `⏰ Cambia en ${horas}h ${minutos}m ${segundos}s`;
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

// === Renderizar carrusel de promociones ===
async function renderCarruselPromosDesdePromos(productos) {
  const contenedor = document.getElementById("carousel-promos-contenido");
  if (!contenedor) return;

  const url = `https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/temporizador.json?nocache=${Date.now()}`;
  const res = await fetch(url);
  const { indicePromoActual } = await res.json();

  const promociones = productos.filter(p => {
    const promo = typeof p.promo === "string" ? p.promo.toLowerCase().trim() : p.promo;
    return promo === true || promo === "true" || promo === "sí" || promo === "activo";
  });

  const bloqueCarrusel = promociones.slice(indicePromoActual, indicePromoActual + 4);
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

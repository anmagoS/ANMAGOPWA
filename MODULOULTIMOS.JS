// ✅ Carga los últimos 10 productos del catálogo
async function cargarUltimosProductos() {
  try {
    const url = `https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json`;
    const res = await fetch(url);
    const productos = await res.json();
    renderUltimosProductos(productos);
  } catch (error) {
    console.error("❌ Error al cargar últimos productos:", error);
  }
}
// 🎨 Renderiza los últimos 10 productos en el grid
function renderUltimosProductos(productos) {
  const contenedor = document.getElementById("grid-ultimos");
  if (!contenedor) return;

  const ultimos = productos.slice(-10).reverse();
  contenedor.innerHTML = "";

  ultimos.forEach(p => {
    if (!p.id || !p.producto || !p.imagen || !p.precio) return; // 🛡 validación mínima

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <a href="producto.html?id=${p.id}" class="imagen-producto">
        <img src="${p.imagen}" alt="${p.producto}" loading="lazy" width="140" height="152" decoding="async">
      </a>
      <div class="nombre-producto">${p.producto}</div>
      <div class="precio-producto">$${p.precio.toLocaleString("es-CO")}</div>
      <a class="boton-comprar" href="producto.html?id=${p.id}">Ver más</a>
    `;
    contenedor.appendChild(tarjeta);
  });

  console.log("✅ Últimos productos renderizados:", ultimos.length);
}

// 🚀 Inicialización automática al cargar
document.addEventListener("DOMContentLoaded", () => {
  cargarUltimosProductos();
});

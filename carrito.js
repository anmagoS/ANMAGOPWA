// ✅ Función para corregir el formato visual del enlace de imagen
function corregirFormatoImagen(url) {
  return url
    .replace(/producto(\d+)/, "producto_$1")
    .replace(/PRODUCTOSImages/, "PRODUCTOS_Images")
    .replace(/IMAGEN(\d+)/, "IMAGEN_$1");
}

// ✅ Carga inicial del carrito con corrección de enlaces
window.articulosCarrito = window.articulosCarrito || JSON.parse(localStorage.getItem("carritoAnmago")) || [];

window.articulosCarrito = window.articulosCarrito.map(p => {
  if (p.imagen) p.imagen = corregirFormatoImagen(p.imagen);
  return p;
});

async function cargarCatalogo() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json");
    catalogo = await res.json();
    console.log("✅ Catálogo cargado");
  } catch (error) {
    console.error("❌ Error al cargar catálogo:", error);
  }
}
function guardarCarrito() {
  try {
    localStorage.setItem("carritoAnmago", JSON.stringify(articulosCarrito));
    window.articulosCarrito = articulosCarrito;
  } catch (e) {
    console.error("❌ Error al guardar carrito:", e);
  }
}

function abrirCarrito() {
  const offcanvas = document.getElementById("offcanvasCarrito");
  if (offcanvas) bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
}
function cerrarCarrito() {
  const offcanvas = document.getElementById("offcanvasCarrito");
  if (offcanvas) bootstrap.Offcanvas.getOrCreateInstance(offcanvas).hide();
}
function actualizarSubtotal() {
  const subtotal = articulosCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const opciones = {
    minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  };
  const subtotalElement = document.getElementById("subtotal");
  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString("es-CO", opciones)}`;
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (contador) contador.textContent = articulosCarrito.length;
}

function actualizarEstadoBotonWhatsApp() {
  const btn = document.querySelector("button[onclick='generarPedidoWhatsApp()']");
  if (btn) btn.disabled = articulosCarrito.length === 0;
}

function renderizarCarrito() {
  const contenedor = document.getElementById("carrito-contenido");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  if (articulosCarrito.length === 0) {
    contenedor.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
    return;
  }

  articulosCarrito.forEach((producto, index) => {
    contenedor.insertAdjacentHTML("beforeend", `
      <div class="container mb-3">
        <div class="row align-items-center border-bottom py-2">
          <div class="col-3">
            <img class="img-fluid rounded" src="${producto.imagen}" alt="${producto.nombre}" />
          </div>
          <div class="col-6">
            <h6 class="mb-1 title-product">${producto.nombre}</h6>
            <p class="mb-0 detalles-product">Talla: ${producto.talla || "No especificada"}</p>
            <p class="mb-0 detalles-product">Cantidad: ${producto.cantidad}</p>
            <p class="mb-0 detalles-product">Precio: $${producto.precio.toLocaleString("es-CO")}</p>
          </div>
          <div class="col-3 text-end">
            <button class="boton-comprar" data-index="${index}" title="Eliminar">
              <i class="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      </div>
    `);
  });

  contenedor.insertAdjacentHTML("beforeend", `
    <div class="text-center mt-3">
      <button class="btn btn-success w-100" id="btn-comprar">Comprar</button>
    </div>
  `);

  document.querySelectorAll(".boton-comprar[data-index]").forEach(btn => {
    btn.addEventListener("click", e => {
      const index = parseInt(e.currentTarget.dataset.index);
      articulosCarrito.splice(index, 1);
      guardarCarrito();
      renderizarCarrito();
      actualizarSubtotal();
      actualizarContadorCarrito();
      actualizarEstadoBotonWhatsApp();
    });
  });

const btnComprar = document.getElementById("btn-comprar");
if (btnComprar) {
  btnComprar.addEventListener("click", () => {
    // Redirige al formulario externo
    window.location.href = "modalformulario.html"; // Ajusta el nombre si usas otro archivo
  });
}
}

function agregarAlCarrito(producto) {
  if (producto.precioDescuento) producto.precio = producto.precioDescuento;

  if (!producto.proveedor && producto.id && catalogo.length > 0) {
    const desdeCatalogo = catalogo.find(p => producto.id.includes(p.id));
    if (desdeCatalogo?.proveedor) producto.proveedor = desdeCatalogo.proveedor;
  }

  if (producto.imagen) {
    producto.imagen = corregirFormatoImagen(producto.imagen);
  }

  const existe = articulosCarrito.find(p => p.id === producto.id);
  if (existe) {
    existe.cantidad = (existe.cantidad || 1) + 1;
  } else {
    producto.cantidad = 1;
    articulosCarrito.push(producto);
  }

  guardarCarrito();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
  abrirCarrito();
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarCatalogo();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
});

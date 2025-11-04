let articulosCarrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
let catalogo = [];

async function cargarCatalogo() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json");
    catalogo = await res.json();
    console.log("✅ Catálogo cargado");
  } catch (error) {
    console.error("❌ Error al cargar catálogo:", error);
  }
}
async function cargarCiudades() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/ciudades.json");
    const ciudades = await res.json();
    const selectCiudad = document.getElementById("ciudadCliente");

    ciudades.forEach(({ departamento, ciudad }) => {
      const option = document.createElement("option");
      option.value = ciudad;
      option.textContent = `${ciudad} (${departamento})`;
      option.dataset.departamento = departamento;
      selectCiudad.appendChild(option);
    });

    console.log("✅ Ciudades cargadas");
  } catch (error) {
    console.error("❌ Error al cargar ciudades:", error);
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem("carritoAnmago", JSON.stringify(articulosCarrito));
  } catch (e) {
    console.error("❌ Error al guardar carrito:", e);
  }
}

function abrirCarrito() {
  const offcanvas = document.getElementById("offcanvasCarrito");
  if (offcanvas) bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
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
// ⬇️ Este bloque abre el formulario al hacer clic en "Comprar"
const btnComprar = document.getElementById("btn-comprar");
if (btnComprar) {
  btnComprar.addEventListener("click", () => {
    const modalFormulario = document.getElementById("modalFormularioCliente");
    if (modalFormulario) {
      const instanciaModal = bootstrap.Modal.getOrCreateInstance(modalFormulario);
      instanciaModal.show();
    } else {
      alert("⚠️ No se encontró el formulario del cliente.");
    }
  });
}
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
}

function agregarAlCarrito(producto) {
  if (producto.precioDescuento) producto.precio = producto.precioDescuento;

  if (!producto.proveedor && producto.id && catalogo.length > 0) {
    const desdeCatalogo = catalogo.find(p => producto.id.includes(p.id));
    if (desdeCatalogo?.proveedor) producto.proveedor = desdeCatalogo.proveedor;
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

function limpiarTextoTelegram(texto) {
  return texto.replace(/[*_`[\]()~>#+=|{}.!]/g, '').replace(/\n/g, ' ').trim();
}

async function generarPedidoWhatsApp() {
  try {
    const ciudad = document.getElementById("ciudadCliente")?.value.trim();
    const nombre = document.getElementById("nombreCliente")?.value.trim();
    const apellido = document.getElementById("apellidoCliente")?.value.trim();
    const telefono = document.getElementById("telefonoCliente")?.value.trim();
    const codigoPais = document.getElementById("codigoPais")?.value;
    const cedula = document.getElementById("cedulaCliente")?.value.trim();
    const tipoVia = document.getElementById("tipoVia")?.value;
    const numeroVia = document.getElementById("numeroVia")?.value.trim();
    const complementoVia = document.getElementById("complementoVia1")?.value.trim();
    const numeroAdicional1 = document.getElementById("numeroAdicional1")?.value.trim();
    const complementoVia2 = document.getElementById("complementoVia2")?.value.trim();
    const numeroAdicional2 = document.getElementById("numeroAdicional2")?.value.trim();
    const tipoUnidad = document.getElementById("tipoUnidad")?.value;
    const numeroApto = document.getElementById("numeroApto")?.value.trim();
    const barrio = document.getElementById("barrio")?.value.trim();
    const observaciones = document.getElementById("observacionesDireccion")?.value.trim();
    const email = document.getElementById("emailCliente")?.value.trim();

    const optionMatch = Array.from(document.querySelectorAll("#listaCiudades option"))
      .find(opt => opt.value === ciudad);
    const departamento = optionMatch?.dataset.departamento || "No definido";

    const camposObligatorios = [nombre, apellido, telefono, ciudad, tipoVia, numeroVia, barrio, cedula];
    const cedulaValida = /^\d+$/.test(cedula);
    const telefonoValido = /^\d{10}$/.test(telefono);

    if (camposObligatorios.some(c => !c) || !cedulaValida || !telefonoValido) {
      alert("Completa todos los campos obligatorios. Cédula numérica y teléfono de 10 dígitos.");
      return;
    }

    const direccion = [
      tipoVia, numeroVia, complementoVia, "N°", numeroAdicional1, complementoVia2,
      "-", numeroAdicional2,
      tipoUnidad === "Apartamento" ? `Apto ${numeroApto}` : tipoUnidad,
      barrio ? `Barrio ${barrio}` : null,
      ciudad,
      observaciones ? `📝 Observaciones: ${observaciones}` : null
    ].filter(Boolean).join(" ");

    const telefonoCompleto = `${codigoPais}${telefono}`;
    const total = articulosCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

    let mensajeWhatsApp = `🛍️ *¡Hola! Soy ${nombre} y quiero realizar el siguiente pedido:*\n\n`;
    let mensajeTelegram = `🕒 Pedido registrado el ${new Date().toLocaleString("es-CO")}\n`;
      mensajeTelegram += `👤 Nombre: ${nombre} ${apellido}\n📞 Teléfono: ${telefonoCompleto}\n🏠 Dirección: ${direccion}\n📍 Ciudad: ${ciudad} - ${departamento}\n📧 Email: ${email}\n\n`;
        articulosCarrito.forEach((producto, index) => {
      mensajeWhatsApp += `*${index + 1}.* ${producto.nombre}\n🖼️ Imagen: ${producto.imagen}\n📏 Talla: ${producto.talla || "No especificada"}\n💲 Precio: $${producto.precio.toLocaleString("es-CO")}\n🔢 Cantidad: ${producto.cantidad}\n\n`;
      mensajeTelegram += `🖼️ Imagen:\n${producto.imagen}\n📏 Talla: ${producto.talla || "No especificada"}\n🔢 Cantidad: ${producto.cantidad}\n🏬 Proveedor: ${limpiarTextoTelegram(producto.proveedor || "No definido")}\n\n`;
    });

    mensajeWhatsApp += `*🧾 Total del pedido:* $${total.toLocaleString("es-CO")}\n\n✅ *¡Gracias por tu atención!*`;

    const mensajeCodificado = encodeURIComponent(mensajeWhatsApp);
    const urlWhatsApp = `https://wa.me/573006498710?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, "_blank");

    await enviarPedidoTelegram(mensajeTelegram);

    articulosCarrito = [];
    guardarCarrito();
    renderizarCarrito();
    actualizarSubtotal();
    actualizarContadorCarrito();
    actualizarEstadoBotonWhatsApp();

    const modalFormulario = document.getElementById("modalFormularioCliente");
    if (modalFormulario) bootstrap.Modal.getOrCreateInstance(modalFormulario).hide();
  } catch (error) {
    console.error("❌ Error al generar pedido:", error);
    alert(`❌ Error al generar el pedido: ${error.message || error}`);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await cargarCatalogo();
  await cargarCiudades();
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();
});

let articulosCarrito = JSON.parse(localStorage.getItem("carritoAnmago")) || [];
let catalogo = [];

fetch("catalogo.json")
  .then(response => response.json())
  .then(data => {
    catalogo = data;
    console.log("✅ Catálogo cargado");
  })
  .catch(error => {
    console.error("❌ Error al cargar catálogo:", error);
  });

document.addEventListener("DOMContentLoaded", () => {
  const carritoContainer = document.getElementById("carrito-contenido");
  const offcanvasCarrito = document.getElementById("offcanvasCarrito");
  const btn_shopping = document.querySelector(".btn_shopping");
  const subtotalElement = document.getElementById("subtotal");
  const contadorCarrito = document.getElementById("contador-carrito");
  const closeButton = document.querySelector(".btn-close");
  const btnWhatsApp = document.querySelector("button[onclick='generarPedidoWhatsApp()']");
  const modalFormulario = new bootstrap.Modal(document.getElementById("modalFormularioCliente"));
  const formCliente = document.getElementById("formCliente");
  const btnEnviarPedido = document.getElementById("btnEnviarPedido");

  function limpiarTextoTelegram(texto) {
    return texto.replace(/[*_`[\]()~>#+=|{}.!]/g, '').replace(/\n/g, ' ').trim();
  }

  function agregarAlCarrito(producto) {
    if (producto.precioDescuento) {
      producto.precio = producto.precioDescuento;
    }

    if (!producto.proveedor && producto.id && catalogo.length > 0) {
      const desdeCatalogo = catalogo.find(p => p.id === producto.id);
      if (desdeCatalogo && desdeCatalogo.proveedor) {
        producto.proveedor = desdeCatalogo.proveedor;
      }
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

  function renderizarCarrito() {
    carritoContainer.innerHTML = "";

    if (articulosCarrito.length === 0) {
      carritoContainer.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
      return;
    }

    articulosCarrito.forEach((producto, index) => {
      const itemHTML = `
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
      `;
      carritoContainer.insertAdjacentHTML("beforeend", itemHTML);
    });

    agregarEventosBorrar();

    const botonComprarHTML = `
      <div class="text-center mt-3">
        <button class="btn btn-success w-100" id="btn-comprar">Comprar</button>
      </div>
    `;
    carritoContainer.insertAdjacentHTML("beforeend", botonComprarHTML);
  }

  function agregarEventosBorrar() {
    const botonesBorrar = document.querySelectorAll(".boton-comprar[data-index]");
    botonesBorrar.forEach((boton) => {
      boton.addEventListener("click", (e) => {
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

  function actualizarSubtotal() {
    const subtotal = articulosCarrito.reduce((total, producto) => total + producto.precio * producto.cantidad, 0);
    const opciones = {
      minimumFractionDigits: subtotal % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    };
    subtotalElement.textContent = `$${subtotal.toLocaleString("es-CO", opciones)}`;
  }

  function actualizarContadorCarrito() {
    contadorCarrito.textContent = articulosCarrito.length;
  }

  function generarPedidoWhatsApp() {
    const nombre = document.getElementById("nombreCliente").value.trim();
    const telefono = document.getElementById("telefonoCliente").value.trim();
    const direccion = document.getElementById("direccionCliente").value.trim();

    if (!nombre || !telefono || !direccion) return alert("Por favor completa todos los campos.");

    articulosCarrito.forEach((producto) => {
      if (!producto.proveedor && producto.id && catalogo.length > 0) {
        const desdeCatalogo = catalogo.find(p => p.id === producto.id);
        if (desdeCatalogo && desdeCatalogo.proveedor) {
          producto.proveedor = desdeCatalogo.proveedor;
        }
      }
    });

    let mensajeWhatsApp = `🛍️ *¡Hola! Soy ${nombre} y quiero realizar el siguiente pedido:*\n\n`;
    let mensajeTelegram = `🕒 Pedido registrado el ${new Date().toLocaleString("es-CO")}\n`;
    mensajeTelegram += `👤 Nombre: ${nombre}\n📞 Teléfono: ${telefono}\n🏠 Dirección: ${direccion}\n\n`;

    articulosCarrito.forEach((producto, index) => {
      mensajeWhatsApp += `*${index + 1}.* ${producto.nombre}\n🖼️ Imagen: ${producto.imagen}\n📏 Talla: ${producto.talla || "No especificada"}\n💲 Precio: $${producto.precio.toLocaleString("es-CO")}\n🔢 Cantidad: ${producto.cantidad}\n\n`;
      mensajeTelegram += `🖼️ Imagen:\n${producto.imagen}\n📏 Talla: ${producto.talla || "No especificada"}\n🔢 Cantidad: ${producto.cantidad}\n🏬 Proveedor: ${limpiarTextoTelegram(producto.proveedor || "No definido")}\n\n`;
    });

    const total = articulosCarrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    mensajeWhatsApp += `*🧾 Total del pedido:* $${total.toLocaleString("es-CO")}\n\n✅ *¡Gracias por tu atención!*`;

    const mensajeCodificado = encodeURIComponent(mensajeWhatsApp);
    const urlWhatsApp = `https://wa.me/573006498710?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, "_blank");

    enviarPedidoTelegram(mensajeTelegram);

    articulosCarrito = [];
    guardarCarrito();
    renderizarCarrito();
    actualizarSubtotal();
    actualizarContadorCarrito();
    actualizarEstadoBotonWhatsApp();
    modalFormulario.hide();
  }

  async function enviarPedidoTelegram(mensaje) {
    const token = "8320682242:AAG4h89_8WVmljeEvYHjzRxmnJDt-HoxcAY";
    const chatId = "-1003044241716";
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const payload = {
      chat_id: chatId,
      text: mensaje
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!data.ok) {
        console.error("❌ Telegram error:", data);
      } else {
        console.log("✅ Pedido enviado a Telegram");
      }
    } catch (error) {
      console.error("❌ Error de red al enviar a Telegram:", error);
    }
  }

  function abrirCarrito() {
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasCarrito);
    bsOffcanvas.show();
  }

    function cerrarCarrito() {
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasCarrito);
    bsOffcanvas.hide();
  }

  function actualizarEstadoBotonWhatsApp() {
    if (btnWhatsApp) btnWhatsApp.disabled = articulosCarrito.length === 0;
  }

  function guardarCarrito() {
    localStorage.setItem("carritoAnmago", JSON.stringify(articulosCarrito));
  }

  btn_shopping?.addEventListener("click", () => {
    const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasCarrito);
    bsOffcanvas.toggle();
    btn_shopping.classList.toggle("balanceo");
  });

  closeButton?.addEventListener("click", () => cerrarCarrito());

  // 🧩 Mostrar modal al hacer clic en "Comprar"
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "btn-comprar") {
      modalFormulario.show();
    }
  });

  // 🧠 Validar campos del formulario
  formCliente.addEventListener("input", () => {
    const nombre = document.getElementById("nombreCliente").value.trim();
    const telefono = document.getElementById("telefonoCliente").value.trim();
    const direccion = document.getElementById("direccionCliente").value.trim();
    btnEnviarPedido.disabled = !(nombre && telefono && direccion);
  });

  // 📦 Enviar pedido al hacer clic en el botón del modal
  btnEnviarPedido.addEventListener("click", generarPedidoWhatsApp);

  // 🔁 Inicializar interfaz
  renderizarCarrito();
  actualizarSubtotal();
  actualizarContadorCarrito();
  actualizarEstadoBotonWhatsApp();

  // 🔗 Exponer funciones globales si se necesitan
  window.agregarAlCarrito = agregarAlCarrito;
  window.generarPedidoWhatsApp = generarPedidoWhatsApp;
});

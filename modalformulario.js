// 🔗 Vincular carrito desde ventana principal si existe
if (window.opener && Array.isArray(window.opener.articulosCarrito)) {
  window.articulosCarrito = JSON.parse(JSON.stringify(window.opener.articulosCarrito));
}

// 🔍 Validación epistémica
function validarFormularioCliente() {
  const camposObligatorios = ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"];
  const todosLlenos = camposObligatorios.every(id => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== "";
  });

  const telefonoValido = /^3\d{9}$/.test(document.getElementById("telefonoCliente")?.value.trim());

  const btnEnviar = document.getElementById("btnEnviarPedido");
  if (btnEnviar) {
    btnEnviar.disabled = !(todosLlenos && telefonoValido);
  }
}

// 🧠 Construcción de nombre completo
function construirNombreCliente() {
  const nombre = document.getElementById("nombreCliente")?.value.trim();
  return nombre;
}

// 🧱 Construcción de dirección estructurada
function construirDireccionEstructurada() {
  const direccionBase = document.getElementById("DireccionCompleta")?.value.trim();
  const tipoUnidad = document.getElementById("tipoUnidad")?.value.trim();
  const numeroApto = document.getElementById("numeroApto")?.value.trim();
  const barrio = document.getElementById("barrio")?.value.trim();
  const puntoReferencia = document.getElementById("observacionDireccion")?.value.trim();

  let direccion = direccionBase || "";

  if (tipoUnidad) direccion += `, ${tipoUnidad}`;
  if (numeroApto) direccion += ` ${numeroApto}`;
  if (barrio) direccion += `, Barrio ${barrio}`;
  if (puntoReferencia) direccion += `,  ${puntoReferencia}`;

  return direccion.trim();
}

// 🧾 Generar texto para WhatsApp
function generarTextoWhatsApp() {
  const nombreCliente = construirNombreCliente();
  const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;

  if (!hayProductos) {
    return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero registrarme como cliente.\n\n✅ ¡Gracias por tu atención!`;
  }

  const productos = window.articulosCarrito.map((p, i) => {
    return `${i + 1}. ${p.nombre.toUpperCase()}\n🖼️ Imagen: ${p.imagen}\n📏 Talla: ${p.talla || "No especificada"}\n💲 Precio: $${p.precio.toLocaleString("es-CO")}\n🔢 Cantidad: ${p.cantidad}`;
  }).join("\n\n");

  const total = window.articulosCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total del pedido: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias por tu atención!`;
}

// 📤 Envío institucional a hoja
function enviarPedidoInstitucional() {
  try {
    const nombreCliente = construirNombreCliente();
    const telefono = document.getElementById("telefonoCliente")?.value.trim();
    const ciudad = document.getElementById("ciudadCliente")?.value.trim();
    const email = document.getElementById("emailCliente")?.value.trim();
    const direccion = construirDireccionEstructurada();
    const fecha = new Date().toLocaleString("es-CO", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });

    const mensajeReducido = `🕒 Registro de cliente el ${fecha}

👤 Nombre: ${nombreCliente}
📞 Teléfono: ${telefono}
🏠 Dirección: ${direccion}
🏙️ Ciudad: ${ciudad}
📧 Correo: ${email}`;

    const url = `https://script.google.com/macros/s/AKfycbyvtwBBOccqKnlSCLJRxm8SHZsGawIHykustOeaezCBJjQg57fxJfaHr1natX9ErtnV/exec?mensaje=${encodeURIComponent(mensajeReducido)}`;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    console.log("📤 GET enviado al Web App intermedio mediante iframe");
  } catch (error) {
    console.error("❌ Error al enviar al Web App intermedio:", error);
  }
}

// 📤 Envío a WhatsApp
function enviarPedidoWhatsApp() {
  const mensaje = generarTextoWhatsApp();
  const url = `https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

// 🚀 Conexión de eventos cuando el formulario ya está en el DOM
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCliente");
  if (!form) return;

  document.querySelectorAll("#formCliente input, #formCliente select, #formCliente textarea").forEach(el => {
    el.addEventListener("input", validarFormularioCliente);
    el.addEventListener("change", validarFormularioCliente);
    el.addEventListener("paste", () => {
      setTimeout(validarFormularioCliente, 50);
    });
  });

  validarFormularioCliente();

  // 🔍 Prellenado automático si el celular ya existe
  const campoTelefono = document.getElementById("telefonoCliente");
  if (campoTelefono) {
    campoTelefono.addEventListener("blur", async () => {
      const telefono = campoTelefono.value.trim();
      if (!/^3\d{9}$/.test(telefono)) return;

      try {
        const res = await fetch(`https://script.google.com/macros/s/AKfycbyvtwBBOccqKnlSCLJRxm8SHZsGawIHykustOeaezCBJjQg57fxJfaHr1natX9ErtnV/exec?telefono=${telefono}`);
        const datos = await res.json();
        console.log("Respuesta del Web App:", datos);

        if (datos && datos.nombreCliente) {
  // Concatenar nombre + apellido
  document.getElementById("nombreCliente").value = 
    `${datos.nombreCliente || ""} ${datos.apellido || ""}`.trim();

  // Dirección: base + complemento
  let direccionCompleta = datos.direccionCliente || "";
  if (datos.complementoDir) direccionCompleta += `, ${datos.complementoDir}`;

  document.getElementById("DireccionCompleta").value = direccionCompleta.trim();

  // Ciudad y correo
  document.getElementById("ciudadCliente").value = datos.ciudadDestino || "";
  document.getElementById("emailCliente").value = datos.correo || "";

  // Si quieres mapear unidad/apto/barrio/punto referencia
  document.getElementById("tipoUnidad").value = datos.tipoUnidad || "";
  document.getElementById("numeroApto").value = datos.numeroApto || "";
  document.getElementById("barrio").value = datos.barrio || "";
  document.getElementById("observacionDireccion").value = datos.puntoReferencia || "";

  console.log("✅ Datos del cliente prellenados desde hoja");
}
      } catch (error) {
        console.error("❌ Error consultando cliente:", error);
      }
    });
  }

  const btnEnviar = document.getElementById("btnEnviarPedido");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", (e) => {
      e.preventDefault();
      enviarPedidoInstitucional();

      const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;

      setTimeout(() => {
        enviarPedidoWhatsApp();

        const modalFormulario = document.getElementById("modalFormularioCliente");
        if (modalFormulario) bootstrap.Modal.getOrCreateInstance(modalFormulario).hide();

        if (window.opener) {
          window.opener.postMessage("limpiarCarrito", "*");
          window.close();
        }

        if (hayProductos) {
          window.articulosCarrito = [];
          if (typeof guardarCarrito === "function") guardarCarrito();
          if (typeof renderizarCarrito === "function") renderizarCarrito();
          if (typeof actualizarSubtotal === "function") actualizarSubtotal();
          if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
          if (typeof actualizarEstadoBotonWhatsApp === "function") actualizarEstadoBotonWhatsApp();
        }
      }, 500);
    });
  }
});

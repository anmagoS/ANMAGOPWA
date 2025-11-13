// 🔗 Vincular carrito desde ventana principal si existe
if (window.opener && Array.isArray(window.opener.articulosCarrito)) {
  window.articulosCarrito = JSON.parse(JSON.stringify(window.opener.articulosCarrito));
}

// 🆕 FUNCIÓN FALTANTE - AGREGAR ESTA
function construirNombreCliente() {
  const nombreInput = document.getElementById("nombreCliente");
  return nombreInput ? nombreInput.value.trim() : "Cliente";
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

function construirDireccionEstructurada() {
  const direccionBase    = document.getElementById("DireccionCompleta")?.value.trim();
  const tipoUnidad       = document.getElementById("tipoUnidad")?.value.trim();
  const numeroApto       = document.getElementById("numeroApto")?.value.trim();
  const barrio           = document.getElementById("barrio")?.value.trim();
  const puntoReferencia  = document.getElementById("observacionDireccion")?.value.trim();

  let direccion = direccionBase || "";
  if (tipoUnidad)      direccion += `, ${tipoUnidad}`;
  if (numeroApto)      direccion += ` ${numeroApto}`;
  if (barrio)          direccion += `, Barrio ${barrio}`;
  if (puntoReferencia) direccion += `, ${puntoReferencia}`;
  return direccion.trim();
}

// 🔄 Parseo inverso cuando llega DIRECCIONCLIENTE concatenada
function repartirDireccionConcatenada(direccionConc) {
  const baseInput = document.getElementById("DireccionCompleta");
  const tipoInput = document.getElementById("tipoUnidad");
  const numeroInput = document.getElementById("numeroApto");
  const barrioInput = document.getElementById("barrio");
  const refInput = document.getElementById("observacionDireccion");

  if (!direccionConc || !baseInput) return;

  // Split por comas, y limpieza básica
  const partes = direccionConc.split(",").map(p => p.trim());

  // Heurística por orden: [base], [tipo + número], [Barrio X], [referencia]
  baseInput.value = partes[0] || "";

  const segunda = partes[1] || ""; // tipo + número (si existe)
  // Detectar tipo
  const tipos = ["CASA","APARTAMENTO","PISO","BODEGA","INTERIOR"];
  const tipoDetectado = tipos.find(t => segunda.toUpperCase().includes(t));
  if (tipoInput)   tipoInput.value = tipoDetectado || "";
  if (numeroInput) numeroInput.value = segunda.replace(tipoDetectado || "", "").trim();

  const tercera = partes[2] || "";
  if (barrioInput) barrioInput.value = tercera.replace(/^Barrio\s*/i, "").trim();

  const cuarta = partes[3] || "";
  if (refInput) refInput.value = cuarta || "";
}

// 🧾 Generar texto para WhatsApp
function generarTextoWhatsApp() {
  const nombreCliente = construirNombreCliente();
  const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;

  if (!hayProductos) {
    return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero registrarme como cliente.\n\n✅ ¡Gracias por tu atención!`;
  }

  const productos = window.articulosCarrito.map((p, i) => {
    return `${i + 1}. ${p.nombre.toUpperCase()}
🖼️ Imagen: ${p.imagen}
📏 Talla: ${p.talla || "No especificada"}
💲 Precio: $${p.precio.toLocaleString("es-CO")}
🔢 Cantidad: ${p.cantidad}`;
  }).join("\n\n");

  const total = window.articulosCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total del pedido: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias por tu atención!`;
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

  // Al inicio, deshabilitar todos los campos excepto el celular
  const otrosCampos = document.querySelectorAll("#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select");
  otrosCampos.forEach(el => el.disabled = true);

  // Validación en tiempo real
  ["nombreCliente","telefonoCliente","DireccionCompleta","ciudadCliente"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", validarFormularioCliente);
    }
  });

  const campoTelefono = document.getElementById("telefonoCliente");
  if (campoTelefono) {
    campoTelefono.addEventListener("blur", async () => {
      const telefono = campoTelefono.value.trim();
      if (!/^3\d{9}$/.test(telefono)) return;

      // Bloquear mientras se valida
      otrosCampos.forEach(el => el.disabled = true);

      try {
        const res = await fetch(`https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec?telefonoCliente=${telefono}`);
        const json = await res.json();

        if (json && json.existe && json.datos) {
          const d = json.datos;

          document.getElementById("clienteId").value        = d["CLIENTEID"] || "";
          document.getElementById("telefonoCliente").value  = d["TELEFONOCLIENTE"] || "";
          document.getElementById("nombreCliente").value    = d["NOMBRECLIENTE"] || "";
          document.getElementById("ciudadCliente").value    = d["CIUDAD DESTINO"] || "";
          document.getElementById("emailCliente").value     = d["CORREO"] || "";

          // Prellenar dirección concatenada en base y repartir a campos
          const direccionConc = d["DIRECCIONCLIENTE"] || "";
          repartirDireccionConcatenada(direccionConc);

          console.log("✅ Datos del cliente prellenados");
        } else {
          // Si no existe, limpiar campos
          document.getElementById("clienteId").value = "";
          document.getElementById("nombreCliente").value = "";
          document.getElementById("DireccionCompleta").value = "";
          document.getElementById("tipoUnidad").value = "";
          document.getElementById("numeroApto").value = "";
          document.getElementById("barrio").value = "";
          document.getElementById("observacionDireccion").value = "";
          document.getElementById("ciudadCliente").value = "";
          document.getElementById("emailCliente").value = "";
          console.log("ℹ️ Cliente no encontrado, campos en blanco");
        }

        // Habilitar después de la validación
        otrosCampos.forEach(el => el.disabled = false);
        validarFormularioCliente();

      } catch (error) {
        console.error("❌ Error consultando cliente:", error);
        otrosCampos.forEach(el => el.disabled = false);
        validarFormularioCliente();
      }
    });
  }

  // 🟢 Enviar pedido (form submit + concatenación antes de enviar)
  const btnEnviar = document.getElementById("btnEnviarPedido");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", (e) => {
      e.preventDefault();

      // Construir dirección concatenada y volcarla al campo que se envía
      const direccionFinal = construirDireccionEstructurada();
      document.getElementById("DireccionCompleta").value = direccionFinal;

      enviarPedidoWhatsApp();
      form.submit(); // envía al Web App vía iframe

      // Ocultar modal si existe
      const modalFormulario = document.getElementById("modalFormularioCliente");
      if (modalFormulario && window.bootstrap) {
        window.bootstrap.Modal.getOrCreateInstance(modalFormulario).hide();
      }

      // Limpiar carrito (si se abrió desde una ventana principal)
      if (window.opener) {
        window.opener.postMessage("limpiarCarrito", "*");
        window.close();
      }

      // Limpieza local del carrito
      const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;
      if (hayProductos) {
        window.articulosCarrito = [];
        if (typeof guardarCarrito === "function") guardarCarrito();
        if (typeof renderizarCarrito === "function") renderizarCarrito();
        if (typeof actualizarSubtotal === "function") actualizarSubtotal();
        if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
        if (typeof actualizarEstadoBotonWhatsApp === "function") actualizarEstadoBotonWhatsApp();
      }
    });
  }

  // ✅ VALIDACIÓN INICIAL
  setTimeout(validarFormularioCliente, 500);
});

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
  if (btnEnviar) btnEnviar.disabled = !(todosLlenos && telefonoValido);
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
  if (puntoReferencia) direccion += `, ${puntoReferencia}`;

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
    return `${i + 1}. ${p.nombre.toUpperCase()}
🖼️ Imagen: ${p.imagen}
📏 Talla: ${p.talla || "No especificada"}
💲 Precio: $${p.precio.toLocaleString("es-CO")}
🔢 Cantidad: ${p.cantidad}`;
  }).join("\n\n");

  const total = window.articulosCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total del pedido: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias por tu atención!`;
}

// 📤 Envío institucional a hoja (POST)
async function enviarPedidoInstitucional() {
  try {
    const datos = {
      clienteId: document.getElementById("clienteId")?.value.trim(),
      nombreCliente: document.getElementById("nombreCliente")?.value.trim(),
      apellidoCompl: "", // columna "APELLIDO COMPL."
      direccionCliente: construirDireccionEstructurada(),
      telefonoCliente: document.getElementById("telefonoCliente")?.value.trim(),
      cedula: "",
      complementoDir: "", // columna "COMPLEMENTO DE DIR"
      ciudadDestino: document.getElementById("ciudadCliente")?.value.trim(), // "CIUDAD DESTINO"
      correo: document.getElementById("emailCliente")?.value.trim(),
      rotular: "",
      rotulo: "",
      mensajeCobro: "",
      usuario: "ANMAGOSTORE@GMAIL.COM"
    };

    const res = await fetch("https://script.google.com/macros/s/AKfycbyvtwBBOccqKnlSCLJRxm8SHZsGawIHykustOeaezCBJjQg57fxJfaHr1natX9ErtnV/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const respuesta = await res.json();
    console.log("📤 Respuesta del Web App:", respuesta);

    if (!respuesta || respuesta.error) {
      throw new Error(respuesta?.error || "sin_respuesta");
    }
    return respuesta;
  } catch (error) {
    console.error("❌ Error al enviar al Web App:", error);
    throw error;
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

  // Al inicio, deshabilitar todos los campos excepto el celular
  const otrosCampos = document.querySelectorAll("#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select");
  otrosCampos.forEach(el => el.disabled = true);

  // Validación en cada cambio de campo
  document.querySelectorAll("#formCliente input, #formCliente select, #formCliente textarea").forEach(el => {
    el.addEventListener("input", validarFormularioCliente);
    el.addEventListener("change", validarFormularioCliente);
    el.addEventListener("paste", () => setTimeout(validarFormularioCliente, 50));
  });
  validarFormularioCliente();

  // 🔍 Prellenado automático si el celular ya existe
  const campoTelefono = document.getElementById("telefonoCliente"); // ← FALTABA
  if (campoTelefono) {
    campoTelefono.addEventListener("blur", async () => {
      const telefono = campoTelefono.value.trim();
      if (!/^3\d{9}$/.test(telefono)) return;

      console.log("🔄 Validando celular...");
      try {
        const res = await fetch(`https://script.google.com/macros/s/AKfycbyvtwBBOccqKnlSCLJRxm8SHZsGawIHykustOeaezCBJjQg57fxJfaHr1natX9ErtnV/exec?telefono=${telefono}`);
        const json = await res.json();
        console.log("Respuesta del Web App:", json);

        // Habilitar los demás campos después de la validación
        otrosCampos.forEach(el => el.disabled = false);

        if (json && json.existe && json.datos) {
          const d = json.datos; // claves = encabezados de Sheets

          // Guarda el CLIENTEID oculto
          const hId = document.getElementById("clienteId");
          if (hId) hId.value = (d["CLIENTEID"] || "").toString().trim();

          // Mapeo a tus campos del formulario
          document.getElementById("telefonoCliente").value   = (d["TELEFONOCLIENTE"] || "").toString();
          document.getElementById("nombreCliente").value     = d["NOMBRECLIENTE"] || "";
          document.getElementById("DireccionCompleta").value = d["DIRECCIONCLIENTE"] || "";
          document.getElementById("ciudadCliente").value     = d["CIUDAD DESTINO"] || "";
          document.getElementById("emailCliente").value      = d["CORREO"] || "";

          // Campos que no existen en Sheets: limpiarlos
          if (document.getElementById("tipoUnidad"))           document.getElementById("tipoUnidad").value = "";
          if (document.getElementById("numeroApto"))           document.getElementById("numeroApto").value = "";
          if (document.getElementById("barrio"))               document.getElementById("barrio").value = "";
          if (document.getElementById("observacionDireccion")) document.getElementById("observacionDireccion").value = "";

          console.log("✅ Prellenado y CLIENTEID almacenado");
        } else {
          const hId = document.getElementById("clienteId");
          if (hId) hId.value = ""; // nuevo registro
          console.log("ℹ️ Cliente no encontrado, campos en blanco");
        }
      } catch (error) {
        console.error("❌ Error consultando cliente:", error);
        otrosCampos.forEach(el => el.disabled = false);
      }
    });
  }

  // 🟢 Enviar: esperar POST antes de WhatsApp/cerrar
  const btnEnviar = document.getElementById("btnEnviarPedido");
  if (btnEnviar) {
    btnEnviar.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const resp = await enviarPedidoInstitucional(); // esperar guardado
        console.log("✅ Guardado en Sheets:", resp);

        enviarPedidoWhatsApp();

        const modalFormulario = document.getElementById("modalFormularioCliente");
        if (modalFormulario) bootstrap.Modal.getOrCreateInstance(modalFormulario).hide();

        if (window.opener) {
          window.opener.postMessage("limpiarCarrito", "*");
          window.close();
        }

        const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;
        if (hayProductos) {
          window.articulosCarrito = [];
          if (typeof guardarCarrito === "function") guardarCarrito();
          if (typeof renderizarCarrito === "function") renderizarCarrito();
          if (typeof actualizarSubtotal === "function") actualizarSubtotal();
          if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
          if (typeof actualizarEstadoBotonWhatsApp === "function") actualizarEstadoBotonWhatsApp();
        }
      } catch (err) {
        console.error("❌ Error guardando en Sheets:", err);
        alert("No se pudo guardar el pedido. Intenta de nuevo.");
      }
    });
  }
});

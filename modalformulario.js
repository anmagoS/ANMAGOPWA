// 🔍 Validación epistémica
function validarFormularioCliente() {
  const camposObligatorios = ["nombreCliente", "telefonoCliente", "cedulaCliente", "emailCliente"];
  const todosLlenos = camposObligatorios.every(id => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== "";
  });

  const cedulaValida = /^\d+$/.test(document.getElementById("cedulaCliente")?.value.trim());
  const telefonoValido = /^3\d{9}$/.test(document.getElementById("telefonoCliente")?.value.trim());
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById("emailCliente")?.value.trim());

  const btnEnviar = document.getElementById("btnEnviarPedido");
  if (btnEnviar) {
    btnEnviar.disabled = !(todosLlenos && cedulaValida && telefonoValido && emailValido);
  }
}

// 🧱 Construcción de dirección estructurada
function construirDireccionEstructurada() {
  const tipoVia = document.getElementById("tipoVia")?.value.trim();
  const numeroVia = document.getElementById("numeroVia")?.value.trim();
  const complementoVia1 = document.getElementById("complementoVia1")?.value.trim();
  const numeroAdicional1 = document.getElementById("numeroAdicional1")?.value.trim();
  const complementoVia2 = document.getElementById("complementoVia2")?.value.trim();
  const numeroAdicional2 = document.getElementById("numeroAdicional2")?.value.trim();
  const tipoUnidad = document.getElementById("tipoUnidad")?.value.trim();
  const numeroApto = document.getElementById("numeroApto")?.value.trim();
  const barrio = document.getElementById("barrio")?.value.trim();

  let direccion = `${tipoVia} ${numeroVia}${complementoVia1 ? ' ' + complementoVia1 : ''} # ${numeroAdicional1}${complementoVia2 ? ' ' + complementoVia2 : ''} - ${numeroAdicional2}`;
  if (tipoUnidad && numeroApto) direccion += `, ${tipoUnidad} ${numeroApto}`;
  if (barrio) direccion += `, Barrio ${barrio}`;
  return direccion;
}

// 🧾 Generar texto para WhatsApp
function generarTextoWhatsApp() {
  const nombre = document.getElementById("nombreCliente")?.value.trim();
  const productos = (window.articulosCarrito || []).map((p, i) => {
    return `${i + 1}. ${p.nombre.toUpperCase()}\n🖼️ Imagen: ${p.imagen}\n📏 Talla: ${p.talla || "No especificada"}\n💲 Precio: $${p.precio.toLocaleString("es-CO")}\n🔢 Cantidad: ${p.cantidad}`;
  }).join("\n\n");

  const total = (window.articulosCarrito || []).reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  return `🛍️ ¡Hola! Soy ${nombre} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total del pedido: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias por tu atención!`;
}

// 🧾 Generar texto para Telegram
function generarTextoTelegram() {
  const cedula = document.getElementById("cedulaCliente")?.value.trim();
  const nombre = document.getElementById("nombreCliente")?.value.trim();
  const apellido = document.getElementById("apellidoCliente")?.value.trim();
  const telefono = document.getElementById("telefonoCliente")?.value.trim();
  const telefono2 = document.getElementById("telefonoSecundario")?.value.trim();
  const ciudad = document.getElementById("ciudadCliente")?.value.trim();
  const email = document.getElementById("emailCliente")?.value.trim();
  const direccion = construirDireccionEstructurada();
  const fecha = new Date().toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  const productos = (window.articulosCarrito || []).map((p, i) => {
    return `${i + 1}. ${p.nombre.toUpperCase()}\n${p.imagen}\n📏 Talla: ${p.talla || "No especificada"}\n🔢 Cantidad: ${p.cantidad}\n🏬 Proveedor: ${p.proveedor || "No especificado"}`;
  }).join("\n\n");

  return `🕒 Pedido registrado el ${fecha}

🧾 Cédula: ${cedula}
👤 Nombre: ${nombre} ${apellido}
📞 Teléfono: ${telefono}
📞 Otro: ${telefono2 || "No aplica"}
🏠 Dirección: ${direccion}
🏙️ Ciudad: ${ciudad}
📧 Correo: ${email}

🛍️ Productos:
${productos}`;
}

// 📤 Envío institucional a hoja
function enviarPedidoInstitucional() {
  try {
    const mensajeCompleto = generarTextoTelegram();
    const mensajeReducido = mensajeCompleto.split("🛍️ Productos:")[0];
    const url = `https://script.google.com/macros/s/AKfycbzS4IFkO8g8GDx4RSzRSVDCteJGaszXs-U3OwJyi9pT4ZUsZUI38fKXqiElQVKB8Opo/exec?mensaje=${encodeURIComponent(mensajeReducido)}`;

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    console.log("📤 GET enviado al Web App intermedio mediante iframe");
  } catch (error) {
    console.error("❌ Error al enviar al Web App intermedio:", error);
  }
}

// 📤 Envío a Telegram
function enviarPedidoTelegramBot() {
  const mensaje = generarTextoTelegram();
  const token = "8320682242:AAG4h89_8WVmljeEvYHjzRxmnJDt-HoxcAY";
  const chatId = -1003044241716;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: "" })
  })
  .then(res => res.json())
  .then(data => console.log("✅ Pedido enviado a Telegram:", data))
  .catch(err => console.error("❌ Error al enviar a Telegram:", err));
}

// 📤 Envío a WhatsApp
function enviarPedidoWhatsApp() {
  const mensaje = generarTextoWhatsApp();
  const url = `https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}

btnEnviar.addEventListener("click", (e) => {
  e.preventDefault();
  enviarPedidoInstitucional();

  setTimeout(() => {
    enviarPedidoWhatsApp();
    enviarPedidoTelegramBot();

    alert("✅ Pedido enviado correctamente. Gracias por tu compra.");

    window.articulosCarrito = [];
    guardarCarrito();

    window.location.href = "index.html"; // O usa history.back();
  }, 500);
});

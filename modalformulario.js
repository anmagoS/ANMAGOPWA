document.addEventListener("DOMContentLoaded", async () => {
  const inputCiudad = document.getElementById("ciudadCliente");
  const listaSugerencias = document.getElementById("sugerenciasCiudades");
  const btnEnviar = document.getElementById("btnEnviarPedido");
  let ciudades = [];
  // 🔹 Cargar ciudades desde JSON
  try {
    const res = await fetch("https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/ciudades.json");
    const data = await res.json();
    ciudades = data.map(({ ciudad, departamento }) => ({
      nombre: ciudad.trim(),
      departamento: departamento.trim()
    }));
    console.log("✅ Ciudades cargadas");
  } catch (error) {
    console.error("❌ Error al cargar ciudades:", error);
  }

  // 🔹 Autocompletado filtrado con validación activa
  inputCiudad.addEventListener("input", () => {
    const valor = inputCiudad.value.trim().toLowerCase();
    listaSugerencias.innerHTML = "";

    if (valor.length < 2) {
      validarFormularioCliente();
      return;
    }

    const filtradas = ciudades.filter(c =>
      c.nombre.toLowerCase().includes(valor)
    ).slice(0, 8);

    filtradas.forEach(ciudad => {
      const item = document.createElement("li");
      item.className = "dropdown-item";
      item.textContent = `${ciudad.nombre} (${ciudad.departamento})`;
      item.addEventListener("click", () => {
        inputCiudad.value = ciudad.nombre;
        listaSugerencias.innerHTML = "";
        listaSugerencias.classList.remove("show");
        validarFormularioCliente();
      });
      listaSugerencias.appendChild(item);
    });

    if (filtradas.length > 0) {
      listaSugerencias.classList.add("show");
    }

    validarFormularioCliente();
  });

  // 🔹 Validar también al perder foco
  inputCiudad.addEventListener("blur", () => {
    validarFormularioCliente();
  });

  // 🔹 Cerrar sugerencias si se hace clic fuera del campo o lista
  document.addEventListener("click", e => {
    if (!e.target.closest("#ciudadCliente") && !e.target.closest("#sugerenciasCiudades")) {
      listaSugerencias.classList.remove("show");
      listaSugerencias.innerHTML = "";
    }
  });

  // 🔹 Validación de formulario
  document.querySelectorAll("#formCliente input, #formCliente select").forEach(el => {
    el.addEventListener("input", validarFormularioCliente);
  });

  // 🔹 Envío del pedido
  if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
      enviarPedidoWhatsApp();
      enviarPedidoTelegramBot();
    });
  }
});


// 🔍 Validación epistémica
function validarFormularioCliente() {
  const camposObligatorios = [
    "nombreCliente",
    "telefonoCliente",
    "cedulaCliente",
    "emailCliente"
  ];

  const todosLlenos = camposObligatorios.every(id => {
    const el = document.getElementById(id);
    const lleno = el && el.value.trim() !== "";
    console.log(`🧪 ${id}: ${lleno ? "✔️" : "❌"}`);
    return lleno;
  });

  const cedulaValida = /^\d+$/.test(document.getElementById("cedulaCliente")?.value.trim());
  const telefonoValido = /^3\d{9}$/.test(document.getElementById("telefonoCliente")?.value.trim());
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById("emailCliente")?.value.trim());

  console.log({ todosLlenos, cedulaValida, telefonoValido, emailValido });

  const btnEnviar = document.getElementById("btnEnviarPedido");
  if (btnEnviar) {
    btnEnviar.disabled = !(todosLlenos && cedulaValida && telefonoValido && emailValido);
    console.log(`🔘 Botón activado: ${!btnEnviar.disabled}`);
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
  const nombre = document.getElementById("nombreCliente")?.value.trim();
  const telefono = document.getElementById("telefonoCliente")?.value.trim();
  const ciudad = document.getElementById("ciudadCliente")?.value.trim();
  const direccion = construirDireccionEstructurada();
  const fecha = new Date().toLocaleString("es-CO", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });

  const productos = (window.articulosCarrito || []).map((p, i) => {
    return `${i + 1}. ${p.nombre.toUpperCase()}\n${p.imagen}\n📏 Talla: ${p.talla || "No especificada"}\n🔢 Cantidad: ${p.cantidad}\n🏬 Proveedor: ${p.proveedor || "No especificado"}`;
  }).join("\n\n");

  return `🕒 Pedido registrado el ${fecha}\n\n👤 Nombre: ${nombre}\n📞 Teléfono: ${telefono}\n🏙️ Ciudad: ${ciudad}\n🏠 Dirección: ${direccion}\n\n${productos}`;
}

// 📤 Envío a WhatsApp
function enviarPedidoWhatsApp() {
  const mensaje = generarTextoWhatsApp();
  const url = `https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}


// 📤 Envío automático a Telegram
function enviarPedidoTelegramBot() {
  const mensaje = generarTextoTelegram();
  const token = "8320682242:AAG4h89_8WVmljeEvYHjzRxmnJDt-HoxcAY";
  const chatId = -1003044241716;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: mensaje,
      parse_mode: ""
    })
  })
  .then(res => res.json())
  .then(data => console.log("✅ Pedido enviado a Telegram:", data))
  .catch(err => console.error("❌ Error al enviar a Telegram:", err));
}

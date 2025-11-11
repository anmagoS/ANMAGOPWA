function mostrarAlertaCarrito(producto) {
  console.log("🚨 mostrarAlertaCarrito ejecutada con:", producto);
  let modal = document.getElementById("anmago-carrito");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "anmago-carrito";
    modal.className = "anmago-modal-carrito";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-carrito-contenido">
      <img src="${producto.imagen}" alt="${producto.nombre}" style="max-height:120px; object-fit:cover;" onerror="this.src='REDES_IMAGES/default.jpg'">
      <p class="mb-2 fw-bold">✅ Agregado al carrito:</p>
      <p class="mb-2">${producto.nombre} <br><small class="text-light">Talla: ${producto.talla} | Cantidad: ${producto.cantidad}</small></p>
      <p class="mb-3 fs-5 text-warning">💰 $${producto.precio.toLocaleString("es-CO")}</p>
        <button class="anmago-btn" id="btn-ver-carrito">Ver carrito</button>
        <button class="anmago-btn-outline" id="btn-ir-inicio">Inicio</button>
    </div>
  `;

  // ✅ Cierre al hacer click fuera del contenido
  modal.onclick = e => {
    if (e.target.id === "anmago-carrito") {
      modal.classList.remove("activo");
    }
  };

  document.getElementById("btn-ver-carrito").onclick = () => {
    modal.classList.remove("activo");
    const offcanvas = document.getElementById("offcanvasCarrito");
    if (offcanvas) bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
  };

  document.getElementById("btn-ir-inicio").onclick = () => {
    window.location.href = "INICIO.HTML";
  };

  // ✅ Activar modal
  modal.classList.add("activo");

  // ✅ Auto-cierre después de 6 segundos
  setTimeout(() => {
    modal.classList.remove("activo");
  }, 6000);
}

// ✅ Registro global
window.mostrarAlertaCarrito = mostrarAlertaCarrito;

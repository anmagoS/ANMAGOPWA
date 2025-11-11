function mostrarAlertaCarrito(producto) {
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
      <p>✅ Agregado al carrito:</p>
      <p>${producto.nombre} <br><small>Talla: ${producto.talla} | Cantidad: ${producto.cantidad}</small></p>
      <p>💰 $${producto.precio.toLocaleString("es-CO")}</p>
      <button id="btn-ver-carrito">Ver carrito</button>
      <button id="btn-ir-inicio">Inicio</button>
    </div>
  `;

  // Activar modal
  modal.classList.add("activo");

  // Botones
  document.getElementById("btn-ver-carrito").onclick = () => {
    modal.classList.remove("activo");
    const offcanvas = document.getElementById("offcanvasCarrito");
    if (offcanvas) bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
  };

  document.getElementById("btn-ir-inicio").onclick = () => {
    window.location.href = "INICIO.HTML";
  };

  // Auto-cierre
  setTimeout(() => {
    modal.classList.remove("activo");
  }, 6000);
}


// ✅ Registro global
window.mostrarAlertaCarrito = mostrarAlertaCarrito;

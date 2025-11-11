if (!modal) {
  modal = document.createElement("div");
  modal.id = "modal-carrito";
  modal.className = "modal-carrito-anmago";
  document.body.appendChild(modal);
}

// 🔁 Actualiza contenido cada vez
modal.innerHTML = `
  <div class="modal-carrito-contenido">
    <p class="mb-3">✅ Has agregado <strong>${producto.cantidad}</strong> unidad${producto.cantidad > 1 ? "es" : ""} de <strong>${producto.nombre}</strong> en talla <strong>${producto.talla}</strong> al carrito.</p>
    <div class="d-flex justify-content-center gap-3">
      <button class="btn btn-light btn-sm" id="btn-ver-carrito">Ver carrito</button>
      <button class="btn btn-outline-light btn-sm" id="btn-ir-inicio">Inicio</button>
    </div>
  </div>
`;

// 🔁 Reasigna eventos cada vez
modal.onclick = e => {
  if (e.target.id === "modal-carrito") {
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

// ✅ Activa el modal
modal.classList.add("activo");

// ⏱️ Oculta después de 6 segundos
setTimeout(() => {
  modal.classList.remove("activo");
}, 6000);
window.mostrarAlertaCarrito = mostrarAlertaCarrito;

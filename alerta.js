  function mostrarAlertaCarrito(producto) {
  let alerta = document.getElementById("alerta-carrito");

  if (!alerta) {
    alerta = document.createElement("div");
    alerta.id = "alerta-carrito";
    alerta.className = "alerta-carrito-movil d-none";
    document.body.appendChild(alerta);
  }

  alerta.innerHTML = `
    <div class="contenido-alerta">
      <p class="mb-2">✅ Has agregado <strong>${producto.cantidad}</strong> unidad${producto.cantidad > 1 ? "es" : ""} de <strong>${producto.nombre}</strong> en talla <strong>${producto.talla}</strong> al carrito.</p>
      <div class="d-flex justify-content-center gap-3">
        <button class="btn btn-light btn-sm" id="btn-ver-carrito">Ver carrito</button>
        <button class="btn btn-outline-light btn-sm" id="btn-ir-inicio">Inicio</button>
      </div>
    </div>
  `;

  alerta.classList.remove("d-none");
 alerta.style.display = "block";
  // Botón: Ver carrito
  document.getElementById("btn-ver-carrito").onclick = () => {
    alerta.classList.add("d-none");
    const offcanvas = document.getElementById("offcanvasCarrito");
    if (offcanvas) bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
  };

  // Botón: Ir al inicio
  document.getElementById("btn-ir-inicio").onclick = () => {
    window.location.href = "INICIO.HTML";
  };

  // Ocultar automáticamente después de 6 segundos
  setTimeout(() => {
    alerta.classList.add("d-none");
  }, 6000);
}
window.mostrarAlertaCarrito = mostrarAlertaCarrito;

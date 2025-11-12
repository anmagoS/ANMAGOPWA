
// === alerta.js ===
(function () {
  let autoCloseId = null;

  function cerrarAlerta() {
    const modal = document.getElementById("anmago-carrito");
    if (modal) modal.classList.remove("activo");
    if (autoCloseId) {
      clearTimeout(autoCloseId);
      autoCloseId = null;
    }
  }

  function mostrarAlertaCarrito(producto) {
    let modal = document.getElementById("anmago-carrito");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "anmago-carrito";
      modal.className = "anmago-modal-carrito";
    document.body.appendChild(modal);
 


      // Cerrar al tocar fuera del contenido
      modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarAlerta();
      });

      // Cerrar con Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarAlerta();
      });
    }

    // Cantidad y valor (unitario y total del ítem)
    const cantidad = producto.cantidad || 1;
    const valorUnitario = producto.precio;
    const valorTotalItem = (valorUnitario * cantidad);

    modal.innerHTML = `
      <div class="modal-carrito-contenido">
        <img src="${producto.imagen}" alt="${producto.nombre}" style="max-height:120px; object-fit:cover;" onerror="this.src='REDES_IMAGES/default.jpg'">
        <p>✅ Agregado al carrito</p>
        <p><strong>${producto.nombre}</strong><br>
           <small>Talla: ${producto.talla || "No especificada"} | Cantidad: ${cantidad}</small>
        </p>
        <p>💰 Valor unitario: $${valorUnitario.toLocaleString("es-CO")}<br>
           <small>Total por este ítem: $${valorTotalItem.toLocaleString("es-CO")}</small>
        </p>
        <div class="d-grid gap-2">
          <button id="btn-ver-carrito" class="btn btn-light text-dark fw-bold">Ir al carrito</button>
          <button id="btn-ir-inicio" class="btn btn-outline-light fw-bold">Seguir comprando</button>
        </div>
      </div>
    `;

    // Activar alerta
    modal.classList.add("activo");

    // Botones
    document.getElementById("btn-ver-carrito").onclick = () => {
      cerrarAlerta();
      const offcanvas = document.getElementById("offcanvasCarrito");
      if (offcanvas) bootstrap.Offcanvas.getOrCreateInstance(offcanvas).show();
    };
    document.getElementById("btn-ir-inicio").onclick = () => {
      cerrarAlerta();
      window.location.href = "INICIO.HTML";
    };

    // Auto-cierre único
    if (autoCloseId) clearTimeout(autoCloseId);
    autoCloseId = setTimeout(cerrarAlerta, 6000);
  }

  // Registro global
  window.mostrarAlertaCarrito = mostrarAlertaCarrito;
})();


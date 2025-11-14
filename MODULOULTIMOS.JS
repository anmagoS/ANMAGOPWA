// 🔥 CÓDIGO OPTIMIZADO - ÚLTIMOS PRODUCTOS ESTILO MERCADOLIBRE (SIN ENVÍOS GRATIS)

// ✅ Configuración global
const VERSION_ANMAGO = new Date().getTime(); // Cache busting

// 🚀 Carga los últimos productos optimizados
async function cargarUltimosProductos() {
  try {
    const contenedor = document.getElementById("grid-ultimos");
    if (!contenedor) {
      console.warn("⚠️ No se encontró el contenedor grid-ultimos");
      return;
    }

    // Mostrar skeleton loading
    mostrarSkeletonLoading(contenedor);

    const url = `https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json?v=${VERSION_ANMAGO}`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const productos = await res.json();
    renderUltimosProductosML(productos);
    
  } catch (error) {
    console.error("❌ Error al cargar últimos productos:", error);
    mostrarErrorUltimosProductos();
  }
}

// 🎨 Renderiza productos con estilo MercadoLibre (SIN ENVÍOS GRATIS)
function renderUltimosProductosML(productos) {
  const contenedor = document.getElementById("grid-ultimos");
  if (!contenedor) return;

  // Tomar últimos 12 productos (mejor para grid responsive)
  const ultimos = productos.slice(-12).reverse();
  
  if (ultimos.length === 0) {
    mostrarEstadoVacio();
    return;
  }

  contenedor.innerHTML = ultimos.map(p => {
    if (!p.id || !p.producto || !p.imagen || !p.precio) return '';

    // Formatear precio
    const precioFormateado = p.precio.toLocaleString("es-CO");
    
    return `
      <div class="card-producto-ml" data-producto-id="${p.id}">
        <a href="producto.html?id=${p.id}" class="text-decoration-none">
          <img src="${p.imagen}" 
               alt="${p.producto}" 
               class="card-img-ml" 
               loading="lazy" 
               decoding="async"
               onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
          
          <div class="card-body-ml">
            <h3 class="nombre-producto-ml small text-dark mb-2 line-clamp-2" title="${p.producto}">
              ${p.producto}
            </h3>
            
            <div class="precio-ml mb-3">$${precioFormateado}</div>
            
            <div class="d-grid">
              <button class="btn btn-outline-primary btn-sm" 
                      onclick="event.preventDefault(); event.stopPropagation(); agregarAlCarritoDesdeCard('${p.id}')">
                <i class="bi bi-cart-plus"></i> Agregar
              </button>
            </div>
          </div>
        </a>
      </div>
    `;
  }).join('');

  console.log("✅ Últimos productos renderizados:", ultimos.length);
  
  // Inicializar eventos hover
  inicializarEventosProductos();
}

// 🎭 Mostrar skeleton loading
function mostrarSkeletonLoading(contenedor) {
  contenedor.innerHTML = `
    <div class="card-producto-ml skeleton" style="height: 280px;"></div>
    <div class="card-producto-ml skeleton" style="height: 280px;"></div>
    <div class="card-producto-ml skeleton" style="height: 280px;"></div>
    <div class="card-producto-ml skeleton" style="height: 280px;"></div>
    <div class="card-producto-ml skeleton" style="height: 280px;"></div>
    <div class="card-producto-ml skeleton" style="height: 280px;"></div>
  `;
}

// ❌ Mostrar estado de error
function mostrarErrorUltimosProductos() {
  const contenedor = document.getElementById("grid-ultimos");
  if (!contenedor) return;
  
  contenedor.innerHTML = `
    <div class="col-12 text-center py-5">
      <i class="bi bi-emoji-frown fs-1 text-muted"></i>
      <p class="text-muted mt-2">No pudimos cargar los productos</p>
      <button class="btn btn-outline-primary mt-2" onclick="cargarUltimosProductos()">
        <i class="bi bi-arrow-clockwise"></i> Reintentar
      </button>
    </div>
  `;
}

// 📭 Mostrar estado vacío
function mostrarEstadoVacio() {
  const contenedor = document.getElementById("grid-ultimos");
  if (!contenedor) return;
  
  contenedor.innerHTML = `
    <div class="col-12 text-center py-5">
      <i class="bi bi-inbox fs-1 text-muted"></i>
      <p class="text-muted mt-2">No hay productos disponibles</p>
    </div>
  `;
}

// 🖱️ Inicializar eventos hover para productos
function inicializarEventosProductos() {
  const productos = document.querySelectorAll('.card-producto-ml');
  
  productos.forEach(producto => {
    producto.addEventListener('mouseenter', () => {
      producto.style.transform = 'translateY(-4px)';
      producto.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
    });
    
    producto.addEventListener('mouseleave', () => {
      producto.style.transform = 'translateY(0)';
      producto.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    });
  });
}

// 🛒 Agregar al carrito desde la card del producto
function agregarAlCarritoDesdeCard(productoId) {
  // Buscar el producto en el catálogo
  fetch(`https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json?v=${VERSION_ANMAGO}`)
    .then(res => res.json())
    .then(productos => {
      const producto = productos.find(p => p.id === productoId);
      if (producto) {
        // Usar la función global agregarAlCarrito si existe
        if (typeof agregarAlCarrito === 'function') {
          agregarAlCarrito(producto);
          mostrarFeedbackAgregado(productoId);
        } else {
          console.warn('⚠️ Función agregarAlCarrito no disponible');
          // Fallback: redirigir a la página del producto
          window.location.href = `producto.html?id=${productoId}`;
        }
      }
    })
    .catch(error => {
      console.error('Error al agregar producto:', error);
      window.location.href = `producto.html?id=${productoId}`;
    });
}

// 💫 Mostrar feedback visual al agregar producto
function mostrarFeedbackAgregado(productoId) {
  const productoCard = document.querySelector(`[data-producto-id="${productoId}"]`);
  if (productoCard) {
    // Efecto visual
    productoCard.style.transform = 'scale(0.95)';
    productoCard.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      productoCard.style.transform = 'scale(1)';
    }, 300);
    
    // Mostrar toast notification si existe
    if (typeof mostrarToast === 'function') {
      mostrarToast('✅ Producto agregado al carrito', 'success');
    }
  }
  
  // Actualizar contador del carrito
  if (typeof actualizarContadoresCarrito === 'function') {
    actualizarContadoresCarrito();
  }
}

// 🔄 Recargar productos manualmente
function recargarUltimosProductos() {
  const contenedor = document.getElementById("grid-ultimos");
  if (contenedor) {
    contenedor.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary"></div></div>';
  }
  cargarUltimosProductos();
}

// 🚀 Inicialización automática al cargar
document.addEventListener("DOMContentLoaded", () => {
  // Cargar productos después de un pequeño delay para priorizar contenido crítico
  setTimeout(cargarUltimosProductos, 100);
});

// 🌐 Exportar funciones para uso global
window.cargarUltimosProductos = cargarUltimosProductos;
window.recargarUltimosProductos = recargarUltimosProductos;
window.agregarAlCarritoDesdeCard = agregarAlCarritoDesdeCard;

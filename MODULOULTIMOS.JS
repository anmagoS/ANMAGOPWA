// MODULOULTIMOS.JS - Solo últimos productos
const VERSION_ANMAGO = new Date().getTime();

async function cargarUltimosProductos() {
  try {
    const contenedor = document.getElementById("grid-ultimos");
    if (!contenedor) return;

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

function renderUltimosProductosML(productos) {
  const contenedor = document.getElementById("grid-ultimos");
  if (!contenedor) return;

  const ultimos = productos.slice(-12).reverse();
  
  if (ultimos.length === 0) {
    mostrarEstadoVacio();
    return;
  }

  contenedor.innerHTML = ultimos.map(p => {
    if (!p.id || !p.producto || !p.imagen || !p.precio) return '';

    const precioFormateado = p.precio.toLocaleString("es-CO");
    
    return `
      <div class="card-producto-ml" data-producto-id="${p.id}">
        <a href="producto.html?id=${p.id}" class="text-decoration-none">
          <img src="${p.imagen}" 
               alt="${p.producto}" 
               class="card-img-ml" 
               loading="lazy" 
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

  inicializarEventosProductos();
}

function agregarAlCarritoDesdeCard(productoId) {
  fetch(`https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json?v=${VERSION_ANMAGO}`)
    .then(res => res.json())
    .then(productos => {
      const producto = productos.find(p => p.id === productoId);
      if (producto && window.carritoManager) {
        window.carritoManager.agregarProducto(producto);
      }
    })
    .catch(error => {
      console.error('Error al agregar producto:', error);
    });
}

// Funciones auxiliares (mantener las que tienes)
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

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(cargarUltimosProductos, 100);
});

// Exportar funciones globales
window.cargarUltimosProductos = cargarUltimosProductos;
window.agregarAlCarritoDesdeCard = agregarAlCarritoDesdeCard;

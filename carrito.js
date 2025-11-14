// carrito.js - Sistema completo del carrito
class CarritoManager {
    constructor() {
        this.articulosCarrito = [];
        this.observers = [];
        this.init();
    }
    init() {
        this.cargarCarrito();
        this.setupStorageListener();
        console.log('🛒 CarritoManager inicializado');
    }

    cargarCarrito() {
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        if (carritoGuardado) {
            try {
                this.articulosCarrito = JSON.parse(carritoGuardado);
            } catch (e) {
                console.error('Error cargando carrito:', e);
                this.articulosCarrito = [];
            }
        }
        window.articulosCarrito = this.articulosCarrito;
        this.notificarObservers();
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'carritoAnmago') {
                this.cargarCarrito();
            }
        });
    }

    agregarProducto(producto) {
        const existe = this.articulosCarrito.find(item => 
            item.id === producto.id && item.talla === producto.talla
        );

        if (existe) {
            existe.cantidad += producto.cantidad || 1;
        } else {
            this.articulosCarrito.push({
                ...producto,
                cantidad: producto.cantidad || 1
            });
        }

        this.guardarCarrito();
        this.mostrarNotificacion('✅ Producto agregado al carrito');
    }

    eliminarProducto(id, talla) {
        this.articulosCarrito = this.articulosCarrito.filter(item => 
            !(item.id === id && item.talla === talla)
        );
        this.guardarCarrito();
    }

    actualizarCantidad(id, talla, nuevaCantidad) {
        const producto = this.articulosCarrito.find(item => 
            item.id === id && item.talla === talla
        );
        
        if (producto) {
            if (nuevaCantidad <= 0) {
                this.eliminarProducto(id, talla);
            } else {
                producto.cantidad = nuevaCantidad;
                this.guardarCarrito();
            }
        }
    }

    guardarCarrito() {
        localStorage.setItem('carritoAnmago', JSON.stringify(this.articulosCarrito));
        window.articulosCarrito = this.articulosCarrito;
        this.notificarObservers();
    }

    // Sistema de observadores para actualización en tiempo real
    agregarObserver(observer) {
        this.observers.push(observer);
    }

    notificarObservers() {
        this.observers.forEach(observer => observer(this.articulosCarrito));
    }

    obtenerTotalItems() {
        return this.articulosCarrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    }

    obtenerSubtotal() {
        return this.articulosCarrito.reduce((total, item) => {
            return total + (item.precio * item.cantidad);
        }, 0);
    }

    mostrarNotificacion(mensaje) {
        // Crear notificación toast simple
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="toast show" role="alert">
                <div class="toast-body bg-success text-white rounded">
                    <i class="bi bi-check-circle me-2"></i>
                    ${mensaje}
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    limpiarCarrito() {
        this.articulosCarrito = [];
        this.guardarCarrito();
    }
}

// 🚀 INICIALIZACIÓN GLOBAL
let carritoManager;

function inicializarCarrito() {
    carritoManager = new CarritoManager();
    window.carritoManager = carritoManager;
    
    // Observer para actualizar UI automáticamente
    carritoManager.agregarObserver(() => {
        actualizarContadoresCarrito();
        actualizarOffcanvasCarrito();
    });

    return carritoManager;
}

// 🔢 ACTUALIZAR CONTADORES EN TIEMPO REAL
function actualizarContadoresCarrito() {
    const contador = document.getElementById('contador-carrito');
    const contadorMobile = document.getElementById('contador-carrito-mobile');
    
    const totalItems = window.carritoManager ? window.carritoManager.obtenerTotalItems() : 0;
    
    [contador, contadorMobile].forEach(el => {
        if (el) {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'block' : 'none';
        }
    });
}

// 🛒 ACTUALIZAR OFFCANVAS EN TIEMPO REAL
function actualizarOffcanvasCarrito() {
    const contenedor = document.getElementById('carrito-contenido');
    const subtotalElement = document.getElementById('subtotal');
    
    if (!contenedor || !window.carritoManager) return;

    const carrito = window.carritoManager.articulosCarrito;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-bag-x fs-1"></i>
                <p class="mt-2">Tu carrito está vacío</p>
            </div>
        `;
        if (subtotalElement) subtotalElement.textContent = '$0';
        return;
    }

    contenedor.innerHTML = carrito.map(item => `
        <div class="card mb-2">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-3">
                        <img src="${item.imagen}" alt="${item.nombre}" 
                             class="img-fluid rounded" style="height: 60px; object-fit: cover;">
                    </div>
                    <div class="col-6">
                        <h6 class="card-title mb-1 small">${item.nombre}</h6>
                        <p class="card-text mb-1 small text-muted">Talla: ${item.talla}</p>
                        <p class="card-text mb-0 fw-bold text-primary">$${item.precio?.toLocaleString('es-CO')}</p>
                    </div>
                    <div class="col-3">
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary" 
                                    onclick="carritoManager.actualizarCantidad('${item.id}', '${item.talla}', ${item.cantidad - 1})">-</button>
                            <span class="mx-2">${item.cantidad}</span>
                            <button class="btn btn-sm btn-outline-secondary"
                                    onclick="carritoManager.actualizarCantidad('${item.id}', '${item.talla}', ${item.cantidad + 1})">+</button>
                        </div>
                        <button class="btn btn-sm btn-danger mt-1 w-100" 
                                onclick="carritoManager.eliminarProducto('${item.id}', '${item.talla}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (subtotalElement) {
        const subtotal = window.carritoManager.obtenerSubtotal();
        subtotalElement.textContent = `$${subtotal.toLocaleString('es-CO')}`;
    }
}

// 📝 ABRIR FORMULARIO
function abrirFormularioPedido() {
    if (!window.carritoManager || window.carritoManager.articulosCarrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    window.open('modalformulario.html', '_blank');
}

// 🎯 FUNCIONES GLOBALES
window.actualizarContadoresCarrito = actualizarContadoresCarrito;
window.abrirFormularioPedido = abrirFormularioPedido;
window.actualizarOffcanvasCarrito = actualizarOffcanvasCarrito;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarCarrito();
});

// carrito.js - Sistema completo del carrito CORREGIDO DEFINITIVO
// Versión: 2024.1 | Compatibilidad total | Performance optimizado

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

    // ✅ FUNCIÓN CRÍTICA CORREGIDA - NO BORRA EL CARRITO
    cargarCarrito() {
        console.log('🔄 CARGANDO CARRITO DESDE localStorage...');
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        
        if (carritoGuardado) {
            try {
                const carritoParseado = JSON.parse(carritoGuardado);
                
                // ✅ VALIDACIÓN ROBUSTA: Solo asignar si es un array válido
                if (Array.isArray(carritoParseado)) {
                    this.articulosCarrito = carritoParseado;
                    console.log('✅ Carrito cargado correctamente:', this.articulosCarrito.length + ' productos');
                } else {
                    console.warn('⚠️ Carrito en localStorage no es un array válido, usando array vacío');
                    this.articulosCarrito = [];
                }
            } catch (e) {
                console.error('❌ Error parseando carrito:', e);
                // ✅ CORRECCIÓN CRÍTICA: NO BORRAR EL CARRITO, mantener lo que haya
                console.log('🛡️  Conservando carrito existente en lugar de borrarlo');
                // No hacemos this.articulosCarrito = [] - mantenemos el estado actual
            }
        } else {
            console.log('📭 No hay carrito guardado en localStorage');
            this.articulosCarrito = [];
        }
        
        window.articulosCarrito = this.articulosCarrito;
        this.notificarObservers();
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'carritoAnmago') {
                console.log('📡 Cambio detectado en localStorage, recargando carrito...');
                this.cargarCarrito();
            }
        });
    }

    agregarProducto(producto) {
        // Validar producto
        if (!producto.id || !producto.nombre) {
            console.error('❌ Producto inválido:', producto);
            return false;
        }

        const existe = this.articulosCarrito.find(item => 
            item.id === producto.id && item.talla === producto.talla
        );

        if (existe) {
            existe.cantidad += producto.cantidad || 1;
            console.log('📈 Producto actualizado:', existe.nombre, 'x' + existe.cantidad);
        } else {
            const nuevoProducto = {
                id: String(producto.id),
                nombre: String(producto.nombre || 'Producto sin nombre'),
                precio: Number(producto.precio || 0),
                talla: String(producto.talla || 'Única'),
                cantidad: Number(producto.cantidad || 1),
                imagen: String(producto.imagen || ''),
                variante: String(producto.variante || 'Estándar')
            };
            this.articulosCarrito.push(nuevoProducto);
            console.log('✅ Producto agregado:', nuevoProducto.nombre);
        }

        this.guardarCarrito();
        this.mostrarNotificacion('✅ Producto agregado al carrito');
        return true;
    }

    eliminarProducto(id, talla) {
        const inicialCount = this.articulosCarrito.length;
        this.articulosCarrito = this.articulosCarrito.filter(item => 
            !(item.id === id && item.talla === talla)
        );
        
        if (this.articulosCarrito.length < inicialCount) {
            console.log('🗑️ Producto eliminado');
            this.guardarCarrito();
            this.mostrarNotificacion('🗑️ Producto eliminado');
        }
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
                console.log('🔢 Cantidad actualizada:', producto.nombre, 'x' + nuevaCantidad);
                this.guardarCarrito();
            }
        }
    }

    guardarCarrito() {
        try {
            localStorage.setItem('carritoAnmago', JSON.stringify(this.articulosCarrito));
            window.articulosCarrito = this.articulosCarrito;
            this.notificarObservers();
            console.log('💾 Carrito guardado:', this.articulosCarrito.length + ' productos');
        } catch (e) {
            console.error('❌ Error guardando carrito:', e);
        }
    }

    // Sistema de observadores para actualización en tiempo real
    agregarObserver(observer) {
        this.observers.push(observer);
    }

    notificarObservers() {
        this.observers.forEach(observer => {
            try {
                observer(this.articulosCarrito);
            } catch (e) {
                console.error('❌ Error en observer:', e);
            }
        });
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
        // Solo mostrar en desktop
        if (window.innerWidth <= 768) return;
        
        // Crear notificación toast mejorada
        const toast = document.createElement('div');
        toast.className = 'position-fixed p-3';
        toast.style.cssText = `
            z-index: 9999;
            bottom: 20px;
            left: 20px;
            right: 20px;
            max-width: 400px;
            margin: 0 auto;
        `;
        
        toast.innerHTML = `
            <div class="toast show" role="alert">
                <div class="toast-body bg-success text-white rounded d-flex justify-content-between align-items-center">
                    <span>
                        <i class="bi bi-check-circle me-2"></i>
                        ${mensaje}
                    </span>
                    <button type="button" class="btn-close btn-close-white" onclick="this.closest('.toast').remove()"></button>
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    // ✅ SOLO LIMPIAR CUANDO SE ENVÍA EL PEDIDO
    limpiarCarrito() {
        console.log('🔄 Limpiando carrito (solo después de enviar pedido)');
        this.articulosCarrito = [];
        this.guardarCarrito();
    }

    // ✅ FUNCIÓN MEJORADA PARA ACTUALIZAR CONTADORES
    actualizarContadoresCarrito() {
        const totalItems = this.obtenerTotalItems();
        
        console.log('🔄 Actualizando contadores:', totalItems + ' items');
        
        // Contadores con fallback seguro
        const contadores = [
            { id: 'contador-carrito', tipo: 'PC' },
            { id: 'contador-carrito-mobile', tipo: 'Mobile' },
            { id: 'contador-carrito-header', tipo: 'Header' }
        ];
        
        contadores.forEach(contador => {
            const elemento = document.getElementById(contador.id);
            if (elemento) {
                elemento.textContent = totalItems;
                elemento.style.display = totalItems > 0 ? 'block' : 'none';
                console.log(`📊 ${contador.tipo} actualizado:`, totalItems);
            }
        });
    }

    // 🔍 DIAGNÓSTICO DEL CARRITO
    diagnostico() {
        console.log('🩺 DIAGNÓSTICO DEL CARRITO:');
        console.log('- Productos:', this.articulosCarrito.length);
        console.log('- Total items:', this.obtenerTotalItems());
        console.log('- Subtotal:', this.obtenerSubtotal());
        console.log('- localStorage:', localStorage.getItem('carritoAnmago') ? 'OK' : 'Vacío');
        console.log('- Observers:', this.observers.length);
    }
}

// 🚀 INICIALIZACIÓN GLOBAL MEJORADA
let carritoManager;

function inicializarCarrito() {
    try {
        // ✅ VERIFICAR SI YA EXISTE ANTES DE CREAR UNO NUEVO
        if (window.carritoManager) {
            console.log('✅ carritoManager ya está inicializado, reutilizando...');
            return window.carritoManager;
        }
        
        carritoManager = new CarritoManager();
        window.carritoManager = carritoManager;
        
        // Observer para actualizar UI automáticamente
        carritoManager.agregarObserver(() => {
            carritoManager.actualizarContadoresCarrito();
            actualizarOffcanvasCarrito();
        });

        // Actualizar contadores inmediatamente
        carritoManager.actualizarContadoresCarrito();
        
        console.log('✅ Carrito inicializado correctamente');
        return carritoManager;
    } catch (error) {
        console.error('❌ Error inicializando carrito:', error);
        return null;
    }
}

// 🛒 ACTUALIZAR OFFCANVAS EN TIEMPO REAL - VERSIÓN MEJORADA
function actualizarOffcanvasCarrito() {
    const contenedor = document.getElementById('carrito-contenido');
    const subtotalElement = document.getElementById('subtotal');
    
    if (!contenedor) {
        console.log('⚠️ Contenedor del carrito no disponible');
        return;
    }

    if (!window.carritoManager) {
        console.log('⚠️ carritoManager no disponible, usando sincronización básica');
        // Intentar cargar desde localStorage directamente
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        if (carritoGuardado) {
            try {
                const carrito = JSON.parse(carritoGuardado);
                actualizarOffcanvasConDatos(contenedor, subtotalElement, carrito);
            } catch (error) {
                console.error('❌ Error cargando carrito para offcanvas:', error);
            }
        }
        return;
    }

    const carrito = window.carritoManager.articulosCarrito;
    actualizarOffcanvasConDatos(contenedor, subtotalElement, carrito);
}

// ✅ FUNCIÓN AUXILIAR PARA ACTUALIZAR OFFCANVAS
function actualizarOffcanvasConDatos(contenedor, subtotalElement, carrito) {
    if (!carrito || carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-bag-x fs-1"></i>
                <p class="mt-2">Tu carrito está vacío</p>
                <small class="text-muted">Agrega productos para continuar</small>
            </div>
        `;
        if (subtotalElement) {
            subtotalElement.textContent = '$0';
            subtotalElement.classList.remove('text-success');
        }
        return;
    }

    console.log('🛒 Actualizando offcanvas con', carrito.length, 'productos');

    // Construir HTML del carrito
    contenedor.innerHTML = carrito.map(item => `
        <div class="card mb-2 border-0 shadow-sm">
            <div class="card-body py-2">
                <div class="row align-items-center">
                    <div class="col-3">
                        <img src="${item.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'}" 
                             alt="${item.nombre}" 
                             class="img-fluid rounded" 
                             style="height: 60px; object-fit: cover; width: 100%;"
                             onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                    </div>
                    <div class="col-6">
                        <h6 class="card-title mb-1 small fw-bold">${item.nombre}</h6>
                        <p class="card-text mb-1 small text-muted">
                            ${item.variante ? item.variante + ' • ' : ''}Talla: ${item.talla}
                        </p>
                        <p class="card-text mb-0 fw-bold text-primary">$${(item.precio || 0).toLocaleString('es-CO')}</p>
                    </div>
                    <div class="col-3">
                        <div class="d-flex align-items-center justify-content-center mb-1">
                            <button class="btn btn-sm btn-outline-secondary px-2" 
                                    onclick="window.carritoManager.actualizarCantidad('${item.id}', '${item.talla}', ${item.cantidad - 1})"
                                    ${item.cantidad <= 1 ? 'disabled' : ''}>
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="mx-2 fw-bold">${item.cantidad}</span>
                            <button class="btn btn-sm btn-outline-secondary px-2"
                                    onclick="window.carritoManager.actualizarCantidad('${item.id}', '${item.talla}', ${item.cantidad + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                        <button class="btn btn-sm btn-danger mt-1 w-100" 
                                onclick="window.carritoManager.eliminarProducto('${item.id}', '${item.talla}')"
                                title="Eliminar producto">
                            <i class="bi bi-trash"></i> 
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (subtotalElement) {
        const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        subtotalElement.textContent = `$${subtotal.toLocaleString('es-CO')}`;
        subtotalElement.classList.add('text-success');
    }
}

// ✅ FUNCIÓN AUXILIAR PARA CARACTERÍSTICAS DE VENTANA
function getWindowFeatures() {
    const width = Math.min(600, window.screen.width - 40);
    const height = Math.min(700, window.screen.height - 100);
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    return `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,centerscreen=yes`;
}

// 📝 ABRIR FORMULARIO - VERSIÓN 100% FUNCIONAL CORREGIDA
function abrirFormularioPedido() {
    console.log('🚀 INICIANDO APERTURA DE FORMULARIO...');
    
    // ✅ VERIFICAR MÚLTIPLES FUENTES DEL CARRITO
    let carrito = [];
    
    if (window.carritoManager && window.carritoManager.articulosCarrito.length > 0) {
        carrito = window.carritoManager.articulosCarrito;
        console.log('✅ Usando carrito desde carritoManager:', carrito.length + ' productos');
    } else {
        // Fallback: cargar desde localStorage directamente
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        if (carritoGuardado) {
            try {
                carrito = JSON.parse(carritoGuardado);
                console.log('✅ Usando carrito desde localStorage:', carrito.length + ' productos');
            } catch (error) {
                console.error('❌ Error cargando carrito desde localStorage:', error);
            }
        }
    }
    
    if (carrito.length === 0) {
        console.log('📭 Carrito vacío');
        alert('🛒 Tu carrito está vacío\n\nAgrega productos antes de continuar con la compra.');
        return;
    }
    
    try {
        // ✅ PREPARAR DATOS PARA URL
        const carritoLimpio = carrito.map(item => ({
            id: String(item.id || ''),
            nombre: String(item.nombre || 'Producto'),
            precio: Number(item.precio || 0),
            talla: String(item.talla || 'Única'),
            cantidad: Number(item.cantidad || 1),
            imagen: String(item.imagen || ''),
            variante: String(item.variante || 'Estándar')
        }));
        
        console.log('🧹 Carrito preparado para enviar:', carritoLimpio);
        
        // ✅ CODIFICAR PARÁMETROS
        const productosParam = encodeURIComponent(JSON.stringify(carritoLimpio));
        
        // ✅ CONSTRUIR URL
        const url = `modalformulario.html?carrito=true&productos=${productosParam}`;
        
        console.log('🌐 URL generada (longitud):', url.length);
        
        // ✅ ABRIR VENTANA
        const ventana = window.open(url, 'FormularioPedido', getWindowFeatures());
        
        if (ventana) {
            console.log('✅ Ventana abierta exitosamente');
            
            // ✅ ACTUALIZAR OFFCANVAS DESPUÉS DE ABRIR FORMULARIO
            setTimeout(() => {
                actualizarOffcanvasCarrito();
            }, 500);
            
        } else {
            console.error('❌ El navegador bloqueó la ventana emergente');
            alert('⚠️ Por favor permite ventanas emergentes para este sitio.');
        }
        
    } catch (error) {
        console.error('❌ Error crítico al abrir formulario:', error);
        // Fallback simple
        const urlFallback = `modalformulario.html?carrito=true`;
        window.open(urlFallback, 'FormularioPedido', getWindowFeatures());
    }
}

// ========== ✅ CORRECCIONES CRÍTICAS - AGREGAR AL FINAL ==========

// 🔥 CORRECCIÓN 1: FUNCIÓN GLOBAL PARA AGREGAR AL CARRITO DESDE PRODUCTO.HTML
window.agregarAlCarrito = function(producto) {
    console.log('🛍️ AGREGANDO PRODUCTO DESDE PRODUCTO.HTML:', producto);
    
    if (!producto || !producto.id) {
        console.error('❌ Producto inválido para agregarAlCarrito');
        return false;
    }
    
    // Asegurar que carritoManager esté inicializado
    if (!window.carritoManager) {
        console.log('🔄 Inicializando carritoManager...');
        inicializarCarrito();
    }
    
    if (window.carritoManager) {
        const resultado = window.carritoManager.agregarProducto(producto);
        
        // ✅ ACTUALIZAR OFFCANVAS INMEDIATAMENTE
        setTimeout(() => {
            actualizarOffcanvasCarrito();
        }, 100);
        
        return resultado;
    } else {
        console.error('❌ carritoManager no disponible');
        return false;
    }
};

// 🔥 CORRECCIÓN 2: SINCRONIZACIÓN AUTOMÁTICA MEJORADA
function sincronizarCarritoGlobal() {
    console.log('🔄 SINCRONIZANDO CARRITO GLOBAL...');
    
    // Actualizar contadores
    if (window.carritoManager) {
        window.carritoManager.actualizarContadoresCarrito();
    } else {
        // Fallback manual
        const carrito = JSON.parse(localStorage.getItem('carritoAnmago') || '[]');
        const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
        
        ['contador-carrito', 'contador-carrito-mobile'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = totalItems;
                elemento.style.display = totalItems > 0 ? 'block' : 'none';
            }
        });
    }
    
    // Actualizar offcanvas
    actualizarOffcanvasCarrito();
}

// 🔥 CORRECCIÓN 3: ACTUALIZAR CARRITO AL CARGAR PÁGINA
function actualizarCarritoAlCargar() {
    console.log('📄 Página cargada, actualizando carrito...');
    sincronizarCarritoGlobal();
}

// 🔥 CORRECCIÓN 4: EVENT LISTENER PARA OFFCANVAS
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM cargado, configurando carrito...');
    
    // Inicializar carrito
    setTimeout(() => {
        inicializarCarrito();
        actualizarCarritoAlCargar();
    }, 500);
    
    // Actualizar carrito cuando se abre el offcanvas
    const offcanvasElement = document.getElementById('offcanvasCarrito');
    if (offcanvasElement) {
        offcanvasElement.addEventListener('show.bs.offcanvas', function() {
            console.log('🎯 Offcanvas abierto, actualizando...');
            setTimeout(() => {
                actualizarOffcanvasCarrito();
            }, 300);
        });
    }
});

// 🔥 CORRECCIÓN 5: FUNCIÓN GLOBAL PARA AGREGAR PRODUCTOS (COMPATIBILIDAD)
window.agregarProductoAlCarrito = function(producto) {
    return window.agregarAlCarrito(producto);
};

// 🔥 CORRECCIÓN 6: ACTUALIZAR CONTADORES MANUALMENTE
window.actualizarContadoresCarrito = function() {
    if (window.carritoManager) {
        window.carritoManager.actualizarContadoresCarrito();
    } else {
        sincronizarCarritoGlobal();
    }
};

// 🎯 FUNCIONES GLOBALES
window.abrirFormularioPedido = abrirFormularioPedido;
window.actualizarOffcanvasCarrito = actualizarOffcanvasCarrito;
window.sincronizarCarritoGlobal = sincronizarCarritoGlobal;
window.actualizarContadoresCarrito = actualizarContadoresCarrito;

// 🔧 HERRAMIENTAS DE DESARROLLO
window.debugCarrito = function() {
    console.log('🔍 DIAGNÓSTICO COMPLETO DEL CARRITO:');
    console.log('- carritoManager disponible:', !!window.carritoManager);
    console.log('- localStorage carritoAnmago:', localStorage.getItem('carritoAnmago'));
    
    if (window.carritoManager) {
        window.carritoManager.diagnostico();
    } else {
        // Mostrar contenido de localStorage directamente
        const carritoGuardado = localStorage.getItem('carritoAnmago');
        if (carritoGuardado) {
            try {
                const carrito = JSON.parse(carritoGuardado);
                console.log('- Productos en localStorage:', carrito.length);
                console.log('- Detalles:', carrito);
            } catch (error) {
                console.error('- Error parseando localStorage:', error);
            }
        } else {
            console.log('- localStorage vacío');
        }
    }
};

// 📱 COMPATIBILIDAD CON MÓVIL - OCULTAR NOTIFICACIONES
document.addEventListener('DOMContentLoaded', function() {
    // Agregar CSS para ocultar notificaciones en móvil
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .toast.show {
                display: none !important;
            }
        }
        @media (min-width: 769px) {
            .toast.show {
                right: auto !important;
                left: 20px !important;
                bottom: 20px !important;
            }
        }
    `;
    document.head.appendChild(style);
});

console.log('🛒 carrito.js cargado - Sistema 100% funcional ✅');

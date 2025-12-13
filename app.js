// ==============================================
// SISTEMA DE CATEGORÍAS RÁPIDAS DINÁMICAS
// ==============================================

// === Variables globales ===
let productosGlobal = [];
let vistaActual = 'inicio';
let contextoNavegacion = {
    nivel: 0, // 0: inicio, 1: tipo, 2: subtipo, 3: categoria
    tipo: null,
    subtipo: null,
    categoria: null
};

// === Obtener parámetros desde URL ===
function getParametrosDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        tipo: params.get("tipo")?.trim(),
        subtipo: params.get("subtipo")?.trim(),
        categoria: params.get("categoria")?.trim(),
        vista: params.get("vista")?.trim()
    };
}

// === Función compartida para índice promocional ===
function obtenerIndicePromocional(cantidadPorCiclo = 4, ciclosPorDia = 4, totalPromos = 0) {
    const ahora = new Date();
    ahora.setMinutes(0, 0, 0);

    const inicio = new Date(Date.UTC(2025, 10, 8, 0, 0, 0));
    const diferenciaHoras = Math.floor((ahora - inicio) / (1000 * 60 * 60));
    const cicloActual = diferenciaHoras % (ciclosPorDia * 365);
    const indice = cicloActual * cantidadPorCiclo;

    return totalPromos > 0 ? indice % totalPromos : 0;
}

// === Mostrar temporizador de promociones ===
function mostrarTemporizadorPromos() {
    const contenedor = document.getElementById("temporizador-promos");
    if (!contenedor) return;

    setInterval(() => {
        const ahora = new Date();
        const horas = ahora.getHours();
        const siguienteCorte = horas % 6 === 0 ? horas + 6 : Math.ceil(horas / 6) * 6;
        const siguienteFecha = new Date(ahora);
        siguienteFecha.setHours(siguienteCorte, 0, 0, 0);

        const restante = siguienteFecha - ahora;
        if (restante <= 0) {
            contenedor.textContent = "⏳ ¡Promociones actualizadas!";
            return;
        }

        const horasRestantes = Math.floor(restante / (1000 * 60 * 60));
        const minutosRestantes = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
        const segundosRestantes = Math.floor((restante % (1000 * 60)) / 1000);

        contenedor.textContent = `⏰ Cambia en ${horasRestantes}h ${minutosRestantes}m ${segundosRestantes}s`;
    }, 1000);
}

// === Cargar catálogo global ===
async function cargarCatalogoGlobal() {
    try {
        const url = "https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json";
        const res = await fetch(url);
        const productos = await res.json();
        window.catalogoGlobal = productos;
        productosGlobal = productos;

        // Inicializar categorías rápidas dinámicas
        inicializarCategoriasRapidas();

        return productos;
    } catch (err) {
        console.error("❌ Error al cargar catálogo:", err);
        return [];
    }
}

// === Cargar accesos globales ===
async function cargarAccesosGlobal() {
    try {
        const url = "https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/accesos.json";
        const res = await fetch(url);
        const accesos = await res.json();
        window.accesosGlobal = accesos;
    } catch (err) {
        console.error("❌ Error al cargar accesos:", err);
    }
}

// ==============================================
// SISTEMA DE CATEGORÍAS RÁPIDAS DINÁMICAS
// ==============================================

// Iconos para las categorías (solo para niveles 0 y 1)
const ICONOS_CATEGORIAS = {
    // Nivel 0: Tipos principales
    'TODOS': '🛍️',
    'ROPA': '👗',
    'RELOJERIA': '⌚',
    'HOGAR': '🏠',
    'BELLEZA': '💄',
    'NAVIDAD': '🎄',
    'ESCOLAR': '🎒',
    
    // Nivel 1: Subtipos
    'DAMA': '👩',
    'CABALLERO': '👨',
    'UNISEX': '👥',
    'NIÑOS': '👦',
    'NIÑAS': '👧',
    
    // Nivel 2: Categorías - NO TIENEN ICONOS (texto plano)
    // 'CHAQUETAS': '', // Sin icono
    // 'BODYS': '',     // Sin icono
    // etc...
};

// Función para obtener icono según categoría y nivel
function obtenerIcono(categoria, nivel = 0) {
    // Si estamos en nivel 2 (categorías), no mostrar icono
    if (nivel === 2) {
        return ''; // Sin icono para categorías
    }
    
    // Para niveles 0 y 1, usar iconos
    return ICONOS_CATEGORIAS[categoria] || '📦';
}

// Inicializar categorías rápidas
function inicializarCategoriasRapidas() {
    if (!productosGlobal || productosGlobal.length === 0) {
        console.warn('⚠️ No hay productos para inicializar categorías');
        return;
    }

    // Mostrar nivel 0 (tipos principales)
    mostrarCategoriasNivel0();
}

// Mostrar nivel 0: Tipos principales (desde INICIO)
function mostrarCategoriasNivel0() {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const tiposUnicos = ['TODOS', ...new Set(productosGlobal.map(p => p.tipo).filter(Boolean))];
    
    const html = tiposUnicos.map(tipo => {
        let contador = '';
        if (tipo !== 'TODOS') {
            const count = productosGlobal.filter(p => p.tipo === tipo).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count">${count}</span>`;
            }
        }

        return `
            <a href="#" class="categoria-rapida" data-tipo="${tipo}" 
               onclick="cargarPorTipo('${tipo}'); return false;">
                <div>${obtenerIcono(tipo, 0)}</div>
                <div>${tipo}</div>
                ${contador}
            </a>
        `;
    }).join('');

    contenedor.innerHTML = html;
    contextoNavegacion = { nivel: 0, tipo: null, subtipo: null, categoria: null };
}

// Mostrar nivel 1: Subtipos (dentro de un TIPO)
function mostrarCategoriasNivel1(tipo) {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const subtiposUnicos = ['TODOS', ...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo)
            .map(p => p.subtipo)
            .filter(Boolean)
    )];

    const html = subtiposUnicos.map(subtipo => {
        let contador = '';
        if (subtipo !== 'TODOS') {
            const count = productosGlobal.filter(p => p.tipo === tipo && p.subtipo === subtipo).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count">${count}</span>`;
            }
        }

        return `
            <a href="#" class="categoria-rapida" data-subtipo="${subtipo}" 
               onclick="cargarPorSubtipo('${tipo}', '${subtipo}'); return false;">
                <div>${obtenerIcono(subtipo, 1)}</div>
                <div>${subtipo}</div>
                ${contador}
            </a>
        `;
    }).join('');

    contenedor.innerHTML = html;
    contextoNavegacion = { nivel: 1, tipo: tipo, subtipo: null, categoria: null };
}

// Mostrar nivel 2: Categorías (dentro de un SUBTIPO)
function mostrarCategoriasNivel2(tipo, subtipo) {
    const contenedor = document.getElementById('categorias-rapidas');
    if (!contenedor) return;

    const categoriasUnicas = ['TODAS', ...new Set(
        productosGlobal
            .filter(p => p.tipo === tipo && p.subtipo === subtipo)
            .map(p => p.categoria)
            .filter(Boolean)
    )];

    const html = categoriasUnicas.map(categoria => {
        let contador = '';
        if (categoria !== 'TODAS') {
            const count = productosGlobal.filter(p => 
                p.tipo === tipo && p.subtipo === subtipo && p.categoria === categoria
            ).length;
            if (count > 0) {
                contador = `<span class="badge-categoria-count">${count}</span>`;
            }
        }

        return `
            <a href="#" class="categoria-rapida sin-icono" data-categoria="${categoria}" 
               onclick="cargarPorCategoria('${tipo}', '${subtipo}', '${categoria}'); return false;">
                <div class="placeholder-icon"></div>
                <div>${categoria}</div>
                ${contador}
            </a>
        `;
    }).join('');

    contenedor.innerHTML = html;
    contextoNavegacion = { nivel: 2, tipo: tipo, subtipo: subtipo, categoria: null };
}

// ==============================================
// FUNCIONES DE CARGA PRINCIPALES
// ==============================================

// Cargar productos por TIPO (Nivel 0 → 1)
function cargarPorTipo(tipo) {
    if (tipo === 'TODOS') {
        mostrarTodosLosProductosCompleto();
        mostrarCategoriasNivel0();
        return;
    }

    // Mostrar vista de todos los productos con filtro por tipo
    mostrarTodosLosProductosCompleto(tipo);
    
    // Actualizar categorías rápidas a subtipos
    mostrarCategoriasNivel1(tipo);
    
    // Actualizar título
    const titulo = document.getElementById('titulo-todos');
    if (titulo) titulo.textContent = `🛍️ ${tipo}`;
}

// Cargar productos por SUBTIPO (Nivel 1 → 2)
function cargarPorSubtipo(tipo, subtipo) {
    if (subtipo === 'TODOS') {
        // Volver al nivel anterior
        cargarPorTipo(tipo);
        return;
    }

    // Mostrar vista de todos los productos con filtro por tipo+subtipo
    mostrarTodosLosProductosCompleto(tipo, subtipo);
    
    // Actualizar categorías rápidas a categorías
    mostrarCategoriasNivel2(tipo, subtipo);
    
    // Actualizar título
    const titulo = document.getElementById('titulo-todos');
    if (titulo) titulo.textContent = `🛍️ ${tipo} - ${subtipo}`;
}

// Cargar productos por CATEGORÍA (Nivel 2 → 3)
function cargarPorCategoria(tipo, subtipo, categoria) {
    if (categoria === 'TODAS') {
        // Volver al nivel anterior
        cargarPorSubtipo(tipo, subtipo);
        return;
    }

    // Mostrar vista de todos los productos con filtro por tipo+subtipo+categoria
    mostrarTodosLosProductosCompleto(tipo, subtipo, categoria);
    
    // Mantener las mismas categorías rápidas (estamos en el nivel más específico)
    mostrarCategoriasNivel2(tipo, subtipo);
    
    // Actualizar título
    const titulo = document.getElementById('titulo-todos');
    if (titulo) titulo.textContent = `🛍️ ${tipo} - ${subtipo} - ${categoria}`;
}

// ==============================================
// SISTEMA DE "TODOS LOS PRODUCTOS" OPTIMIZADO
// ==============================================

let todosProductos = [];
let productosFiltradosTodos = [];
let productosCargados = 0;
const productosPorCarga = 20;
let cargandoMasProductos = false;
let tieneMasProductos = true;
let filtrosActuales = { tipo: null, subtipo: null, categoria: null };

// Función principal para mostrar productos con filtros
// Función principal para mostrar productos con filtros
async function mostrarTodosLosProductosCompleto(tipo = null, subtipo = null, categoria = null) {
    try {
        // Guardar filtros actuales
        filtrosActuales = { tipo, subtipo, categoria };
        
        // Cambiar a vista todos
        cambiarAVista('todos');
        
        // **CORRECIÓN: Mostrar loading SOLO SI no hay productos ya cargados**
        const grid = document.getElementById('grid-todos');
        if (grid && grid.children.length === 0) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Cargando productos...</p>
                </div>
            `;
        }

        // Resetear scroll infinito
        productosCargados = 0;
        cargandoMasProductos = false;
        tieneMasProductos = true;

        // Asegurar catálogo cargado
        if (!window.catalogoGlobal || window.catalogoGlobal.length === 0) {
            window.catalogoGlobal = await cargarCatalogoGlobal();
        }

        todosProductos = window.catalogoGlobal || [];
        
        // Aplicar filtros
        productosFiltradosTodos = aplicarFiltrosProductos(todosProductos, tipo, subtipo, categoria);

        // Actualizar contador
        const contador = document.getElementById('contador-todos');
        if (contador) {
            contador.textContent = `${productosFiltradosTodos.length} productos`;
        }

        // Llenar filtros del sidebar
        llenarFiltrosTodos();

        // **CORRECIÓN IMPORTANTE: Limpiar el grid antes de cargar**
        if (grid) {
            grid.innerHTML = ''; // Limpiar el mensaje de carga
        }

        // Cargar primera tanda
        cargarPrimeraTandaProductos();

        // Configurar scroll infinito
        configurarScrollInfinito();

    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarErrorProductos();
    }
}

// Aplicar filtros a productos
function aplicarFiltrosProductos(productos, tipo, subtipo, categoria) {
    if (!productos || !Array.isArray(productos)) return [];

    return productos.filter(producto => {
        // Filtrar por tipo
        if (tipo && producto.tipo !== tipo) return false;
        
        // Filtrar por subtipo
        if (subtipo && producto.subtipo !== subtipo) return false;
        
        // Filtrar por categoría
        if (categoria && producto.categoria !== categoria) return false;
        
        return true;
    });
}

// Cargar primera tanda de productos
// Cargar primera tanda de productos
function cargarPrimeraTandaProductos() {
    productosCargados = 0;
    
    // **CORRECIÓN: Limpiar el grid antes de renderizar**
    const grid = document.getElementById('grid-todos');
    if (grid) {
        grid.innerHTML = '';
    }
    
    // **CORRECIÓN: Ocultar mensaje de no resultados si existe**
    const sinResultados = document.getElementById('sin-resultados-todos');
    if (sinResultados) {
        sinResultados.classList.add('d-none');
    }
    
    renderizarSiguientesProductos();
}

// Renderizar más productos (scroll infinito)
// Renderizar más productos (scroll infinito)
function renderizarSiguientesProductos() {
    if (cargandoMasProductos || !tieneMasProductos) return;
    
    cargandoMasProductos = true;
    
    // Mostrar spinner
    const spinner = document.getElementById('cargando-todos');
    if (spinner) spinner.classList.remove('d-none');
    
    setTimeout(() => {
        const inicio = productosCargados;
        const fin = inicio + productosPorCarga;
        const productosParaMostrar = productosFiltradosTodos.slice(inicio, fin);
        
        const grid = document.getElementById('grid-todos');
        
        // **CORRECIÓN: Ocultar mensaje de no resultados si existe**
        const sinResultados = document.getElementById('sin-resultados-todos');
        if (sinResultados) sinResultados.classList.add('d-none');
        
        if (productosParaMostrar.length === 0 && productosCargados === 0) {
            // **CORRECIÓN: Solo mostrar "no resultados" si realmente no hay productos**
            if (grid) grid.innerHTML = '';
            if (sinResultados) sinResultados.classList.remove('d-none');
            tieneMasProductos = false;
        } else if (productosParaMostrar.length === 0) {
            // Ya no hay más productos
            tieneMasProductos = false;
            
            // **CORRECIÓN: Ocultar spinner si no hay más productos**
            const spinner = document.getElementById('cargando-todos');
            if (spinner) spinner.classList.add('d-none');
        } else {
            // Renderizar productos
            productosParaMostrar.forEach(producto => {
                const card = crearCardProducto(producto);
                if (grid) grid.appendChild(card);
            });
            
            productosCargados += productosParaMostrar.length;
            
            // Mostrar botón "Ver más"
            const btnContainer = document.getElementById('btn-ver-mas-container');
            if (btnContainer && productosCargados < productosFiltradosTodos.length) {
                btnContainer.classList.remove('d-none');
            }
        }
        
        // **CORRECIÓN: Siempre ocultar spinner al final**
        if (spinner) spinner.classList.add('d-none');
        cargandoMasProductos = false;
        
        // Cargar más automáticamente si quedan pocos
        if (tieneMasProductos && (productosFiltradosTodos.length - productosCargados) < 10) {
            renderizarSiguientesProductos();
        }
    }, 300);
}

// Crear tarjeta de producto
function crearCardProducto(producto) {
    const div = document.createElement('div');
    div.className = 'card-producto-ml';
    
    const precioOriginal = Number(producto.precio) || 0;
    let precioFinal = precioOriginal;
    let badgePromo = '';
    
    // Verificar promoción
    const estaEnPromo = producto.promo === "sí" || producto.promo === true || producto.promo === "true";
    
    if (estaEnPromo) {
        const descuento = producto.precioOferta ? Math.round((1 - producto.precioOferta / precioOriginal) * 100) : 10;
        precioFinal = producto.precioOferta || Math.round(precioOriginal * 0.9);
        badgePromo = `<span class="badge bg-danger position-absolute" style="top: 10px; left: 10px;">-${descuento}%</span>`;
    }
    
    // Verificar stock
    const badgeStock = producto.stock <= 5 ? 
        `<span class="badge bg-warning text-dark position-absolute" style="top: 10px; right: 10px;">Últimas</span>` : '';
    
    div.innerHTML = `
        <a href="PRODUCTO.HTML?id=${producto.id}">
            <div class="position-relative">
                <img src="${producto.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'}" 
                     alt="${producto.producto}" 
                     class="card-img-ml"
                     loading="lazy"
                     onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                ${badgePromo}
                ${badgeStock}
            </div>
            
            <div class="card-body-ml">
                <div class="d-flex flex-wrap gap-1 mb-1">
                    <span class="badge bg-info text-dark">${producto.tipo || ''}</span>
                    <span class="badge bg-secondary">${producto.subtipo || ''}</span>
                </div>
                
                <h3 class="nombre-producto-ml small line-clamp-2">${producto.producto}</h3>
                
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <div>
                        <div class="precio-ml fw-bold text-primary">
                            $${precioFinal.toLocaleString('es-CO')}
                        </div>
                        ${estaEnPromo && precioOriginal !== precioFinal ? `
                            <div class="text-muted text-decoration-line-through small">
                                $${precioOriginal.toLocaleString('es-CO')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <button class="btn btn-outline-primary btn-sm" 
                            onclick="event.preventDefault(); window.location.href='PRODUCTO.HTML?id=${producto.id}'">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
        </a>
    `;
    
    return div;
}

// Configurar scroll infinito
function configurarScrollInfinito() {
    window.removeEventListener('scroll', manejarScrollInfinito);
    window.addEventListener('scroll', manejarScrollInfinito);
}

// Manejar scroll infinito
function manejarScrollInfinito() {
    if (cargandoMasProductos || !tieneMasProductos) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    if (scrollTop + clientHeight >= scrollHeight - 500) {
        renderizarSiguientesProductos();
    }
}

// Llenar filtros del sidebar
function llenarFiltrosTodos() {
    // Filtrar tipos únicos
    const tiposUnicos = [...new Set(todosProductos.map(p => p.tipo).filter(Boolean))];
    const filtroTipo = document.getElementById('filtro-tipo-todos');
    if (filtroTipo) {
        filtroTipo.innerHTML = '<option value="">Filtrar por tipo</option>';
        tiposUnicos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            filtroTipo.appendChild(option);
        });
        
        // Establecer valor actual
        if (filtrosActuales.tipo && tiposUnicos.includes(filtrosActuales.tipo)) {
            filtroTipo.value = filtrosActuales.tipo;
        }
    }
}

// Filtrar productos desde el sidebar
function filtrarProductosTodos() {
    const filtroTipo = document.getElementById('filtro-tipo-todos')?.value || '';
    const busqueda = document.getElementById('buscar-todos')?.value.toLowerCase() || '';
    
    // Aplicar filtros del sidebar
    productosFiltradosTodos = todosProductos.filter(producto => {
        // Filtrar por tipo del sidebar
        if (filtroTipo && producto.tipo !== filtroTipo) return false;
        
        // Filtrar por búsqueda
        if (busqueda) {
            const textoProducto = `${producto.producto || ''} ${producto.descripcion || ''} ${producto.tipo || ''} ${producto.subtipo || ''} ${producto.categoria || ''}`.toLowerCase();
            if (!textoProducto.includes(busqueda)) return false;
        }
        
        return true;
    });
    
    // Aplicar ordenamiento
    aplicarOrdenamientoActual();
    
    // Actualizar contador
    const contador = document.getElementById('contador-todos');
    if (contador) {
        contador.textContent = `${productosFiltradosTodos.length} productos`;
    }
    
    // Reiniciar scroll
    productosCargados = 0;
    tieneMasProductos = productosFiltradosTodos.length > 0;
    
    // Limpiar y recargar
    const grid = document.getElementById('grid-todos');
    if (grid) grid.innerHTML = '';
    
    if (productosFiltradosTodos.length > 0) {
        cargarPrimeraTandaProductos();
    } else {
        const sinResultados = document.getElementById('sin-resultados-todos');
        if (sinResultados) sinResultados.classList.remove('d-none');
    }
}

// Ordenar productos
function ordenarProductosTodos() {
    aplicarOrdenamientoActual();
    productosCargados = 0;
    const grid = document.getElementById('grid-todos');
    if (grid) grid.innerHTML = '';
    
    if (productosFiltradosTodos.length > 0) {
        cargarPrimeraTandaProductos();
    }
}

// Aplicar ordenamiento
function aplicarOrdenamientoActual() {
    const orden = document.getElementById('ordenar-todos')?.value || 'recientes';
    
    switch(orden) {
        case 'precio-asc':
            productosFiltradosTodos.sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0));
            break;
        case 'precio-desc':
            productosFiltradosTodos.sort((a, b) => (Number(b.precio) || 0) - (Number(a.precio) || 0));
            break;
        case 'nombre':
            productosFiltradosTodos.sort((a, b) => (a.producto || '').localeCompare(b.producto || ''));
            break;
        case 'recientes':
        default:
            // Mantener orden original
            break;
    }
}

// Mostrar error
function mostrarErrorProductos() {
    const grid = document.getElementById('grid-todos');
    if (grid) {
        grid.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>Error al cargar los productos. Intenta recargar la página.</p>
                    <button onclick="mostrarTodosLosProductosCompleto()" class="btn btn-danger btn-sm">
                        <i class="bi bi-arrow-clockwise"></i> Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

// ==============================================
// FUNCIONES AUXILIARES
// ==============================================

// Cambiar entre vistas
function cambiarAVista(vista) {
    document.querySelectorAll('.vista').forEach(v => {
        v.classList.remove('vista-activa');
    });
    
    const vistaElement = document.getElementById(`vista-${vista}`);
    if (vistaElement) {
        vistaElement.classList.add('vista-activa');
    }
    
    vistaActual = vista;
}

// Volver al inicio
function volverAInicio() {
    cambiarAVista('inicio');
    mostrarCategoriasNivel0();
    
    // Limpiar scroll infinito
    window.removeEventListener('scroll', manejarScrollInfinito);
    
    // Limpiar filtros
    const busqueda = document.getElementById('buscar-todos');
    const filtroTipo = document.getElementById('filtro-tipo-todos');
    const orden = document.getElementById('ordenar-todos');
    
    if (busqueda) busqueda.value = '';
    if (filtroTipo) filtroTipo.value = '';
    if (orden) orden.value = 'recientes';
    
    // Limpiar URL
    const nuevaURL = new URL(window.location);
    nuevaURL.searchParams.delete('vista');
    window.history.replaceState({}, '', nuevaURL);
}

// ==============================================
// INICIALIZACIÓN PRINCIPAL
// ==============================================

document.addEventListener("DOMContentLoaded", async () => {
    const { tipo, subtipo, categoria, vista } = getParametrosDesdeURL();

    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js")
            .then(() => console.log("✅ Service Worker registrado"))
            .catch(err => console.error("❌ Error al registrar SW:", err));
    }

    // Cargar datos
    await cargarCatalogoGlobal();
    await cargarAccesosGlobal();
    window.catalogo = window.catalogoGlobal || [];

    // Filtrar promociones
    window.promocionesGlobal = window.catalogoGlobal.filter(p => {
        const promo = typeof p.promo === "string" ? p.promo.toLowerCase().trim() : p.promo;
        return promo === true || promo === "true" || promo === "sí" || promo === "activo";
    });

    // Configurar PWA
    configurarInstalacionPWA();

    // Cargar header
    const headerContainer = document.getElementById("header-container");
    if (headerContainer && !headerContainer.querySelector(".header")) {
        const header = await fetch("HEADER.HTML").then(res => res.text());
        headerContainer.insertAdjacentHTML("afterbegin", header);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

       // Activar buscador si existe
    if (typeof activarBuscadorGlobal === "function") {
        activarBuscadorGlobal();
    }

    // Manejar parámetros de URL
    if (vista === 'todos' || tipo) {
        setTimeout(() => {
            if (tipo && subtipo && categoria) {
                cargarPorCategoria(tipo, subtipo, categoria);
            } else if (tipo && subtipo) {
                cargarPorSubtipo(tipo, subtipo);
            } else if (tipo) {
                cargarPorTipo(tipo);
            } else if (vista === 'todos') {
                mostrarTodosLosProductosCompleto();
            }
        }, 500);
    }

    // Actualizar carrito
    if (typeof window.actualizarContadorCarrito === "function") {
        window.actualizarContadorCarrito();
    }

    // Mostrar temporizador de promociones
    mostrarTemporizadorPromos();
});

// Configurar instalación PWA
function configurarInstalacionPWA() {
    const esPWAInstalado = window.matchMedia('(display-mode: standalone)').matches || 
                          window.navigator.standalone === true;

    if (!esPWAInstalado) {
        const contenedor = document.getElementById("instalar-container");
        if (contenedor) contenedor.classList.remove("d-none");
    }

    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;

        const boton = document.getElementById("boton-instalar");
        boton?.addEventListener("click", async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const resultado = await deferredPrompt.userChoice;
                console.log("📲 Resultado instalación:", resultado.outcome);
                deferredPrompt = null;
                document.getElementById("instalar-container")?.classList.add("d-none");
            }
        });
    });
}

// ==============================================
// FUNCIONES DE COMPATIBILIDAD (mantener existentes)
// ==============================================

// Mantener función original para compatibilidad
function mostrarTodosLosProductos() {
    mostrarTodosLosProductosCompleto();
    mostrarCategoriasNivel0();
}

// Función de compatibilidad para cargar subtipos (redirige al nuevo sistema)
function cargarSubtipos(tipo) {
    cargarPorTipo(tipo);
}

// Función de compatibilidad para filtrar por categoría
function filtrarPorCategoria(categoria) {
    if (categoria === 'TODOS') {
        volverAInicio();
        return;
    }
    
    // Buscar si la categoría es un tipo, subtipo o categoría
    const productoEjemplo = productosGlobal.find(p => 
        p.tipo === categoria || p.subtipo === categoria || p.categoria === categoria
    );
    
    if (productoEjemplo) {
        if (productoEjemplo.tipo === categoria) {
            cargarPorTipo(categoria);
        } else if (productoEjemplo.subtipo === categoria) {
            // Buscar el tipo de este subtipo
            const tipoProducto = productosGlobal.find(p => p.subtipo === categoria)?.tipo;
            if (tipoProducto) {
                cargarPorSubtipo(tipoProducto, categoria);
            }
        } else {
            // Buscar tipo y subtipo de esta categoría
            const productoCat = productosGlobal.find(p => p.categoria === categoria);
            if (productoCat) {
                cargarPorCategoria(productoCat.tipo, productoCat.subtipo, categoria);
            }
        }
    }
}

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
    
    // Inicializar sistema de filtrado por categorías
    if (typeof inicializarFiltroCategorias === 'function') {
      setTimeout(() => {
        inicializarFiltroCategorias();
      }, 500);
    }
    
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

// ✅ FUNCIÓN CORREGIDA - CERRAR EL OFFICANVAS DEL MENÚ
function cerrarMenuLateral() {
  // Cerrar el offcanvas usando Bootstrap
  const offcanvasElement = document.getElementById('menuLateral');
  if (offcanvasElement) {
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement);
    if (offcanvasInstance) {
      offcanvasInstance.hide();
    } else {
      const newInstance = new bootstrap.Offcanvas(offcanvasElement);
      newInstance.hide();
    }
  }
  
  // También cerrar todos los details abiertos dentro del menú
  const menu = document.getElementById("menu-categorias");
  if (menu) {
    const detailsAbiertos = menu.querySelectorAll('details[open]');
    detailsAbiertos.forEach(detail => {
      detail.removeAttribute('open');
    });
  }
}

// === Renderizar menú lateral desde catálogo ===
function renderizarMenuLateral(catalogo) {
  const menu = document.getElementById("menu-categorias");
  if (!menu) {
    console.log("❌ menu-categorias no encontrado");
    return;
  }

  const mapa = {};
  catalogo.forEach(p => {
    if (!p.tipo || !p.subtipo || !p.categoria) return;
    if (!mapa[p.tipo]) mapa[p.tipo] = {};
    if (!mapa[p.tipo][p.subtipo]) mapa[p.tipo][p.subtipo] = new Set();
    mapa[p.tipo][p.subtipo].add(p.categoria);
  });

  // Limpiar menú existente
  menu.innerHTML = '';

  // ✅ AGREGAR OPCIÓN "TODOS LOS PRODUCTOS" AL INICIO DEL MENÚ
  const opcionTodos = document.createElement("details");
  opcionTodos.innerHTML = `<summary class="fw-bold text-primary">🛍️ TODOS LOS PRODUCTOS</summary>`;
  
  const linkTodos = document.createElement("a");
  linkTodos.className = "nav-link ps-3 fw-bold";
  linkTodos.textContent = "Ver catálogo completo";
  linkTodos.href = "#";
  
  linkTodos.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    cerrarMenuLateral();
    
    setTimeout(() => {
      // Llamar a la función que mostrará todos los productos
      if (typeof mostrarTodosLosProductos === 'function') {
        mostrarTodosLosProductos();
      }
    }, 50);
  };
  
  opcionTodos.appendChild(linkTodos);
  menu.appendChild(opcionTodos);

  // Agregar las categorías normales
  Object.entries(mapa).forEach(([tipo, subtipos]) => {
    const bloqueTipo = document.createElement("details");
    bloqueTipo.innerHTML = `<summary class="fw-bold">${tipo}</summary>`;

    Object.entries(subtipos).forEach(([subtipo, categorias]) => {
      const bloqueSubtipo = document.createElement("details");
      bloqueSubtipo.innerHTML = `<summary>${subtipo}</summary>`;

      categorias.forEach(categoria => {
        const link = document.createElement("a");
        link.className = "nav-link ps-3";
        link.textContent = categoria;
        link.href = "#";
        
        link.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // ✅ CERRAR EL MENÚ COMPLETO (OFFCANVAS)
          cerrarMenuLateral();
          
          // Navegar después de cerrar el menú
          setTimeout(() => {
            if (typeof window.cargarProductos === 'function') {
              window.cargarProductos(tipo, subtipo, categoria);
            } else {
              window.location.href = `PRODUCTOS.HTML?tipo=${encodeURIComponent(tipo)}&subtipo=${encodeURIComponent(subtipo)}&categoria=${encodeURIComponent(categoria)}`;
            }
          }, 50);
        };
        
        bloqueSubtipo.appendChild(link);
      });

      bloqueTipo.appendChild(bloqueSubtipo);
    });

    menu.appendChild(bloqueTipo);
  });
}

// === Renderizar carrusel de promociones ===
function renderCarruselPromosDesdePromos() {
  const contenedor = document.getElementById("carousel-promos-contenido");
  if (!contenedor || !Array.isArray(window.promocionesGlobal)) return;

  const cantidadPorCiclo = 4;
  const ciclosPorDia = 4;
  const totalPromos = window.promocionesGlobal.length;
  const indiceActual = obtenerIndicePromocional(cantidadPorCiclo, ciclosPorDia, totalPromos);
  
  let bloqueCarrusel = window.promocionesGlobal.slice(indiceActual, indiceActual + cantidadPorCiclo);
  if (bloqueCarrusel.length < cantidadPorCiclo && totalPromos >= cantidadPorCiclo) {
    bloqueCarrusel = window.promocionesGlobal.slice(0, cantidadPorCiclo);
  }
  
  contenedor.innerHTML = "";

  bloqueCarrusel.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = `carousel-item ${index === 0 ? "active" : ""}`;
    item.innerHTML = `
      <div class="d-flex justify-content-center">
        <div class="card" style="width: 18rem;">
          <img src="${p.imagen}" class="card-img-top" alt="${p.producto}">
          <div class="card-body text-center">
            <h5 class="card-title">${p.producto}</h5>
            <p class="card-text">
              <s class="text-muted me-2">$${p.precio.toLocaleString("es-CO")}</s>
              <span class="text-success fw-bold">$${(p.precio * 0.9).toLocaleString("es-CO")}</span>
            </p>
            <a href="PRODUCTO.HTML?id=${p.id}" class="boton-comprar">Ver producto</a>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(item);
  });
}

// === Renderizar promociones por ciclo ===
function renderPromocionesPorCiclo() {
  const contenedor = document.getElementById("contenedor-promos");
  if (!contenedor || !Array.isArray(window.promocionesGlobal)) return;

  const cantidadPorCiclo = 4;
  const ciclosPorDia = 4;
  const totalPromos = window.promocionesGlobal.length;

  if (totalPromos === 0) {
    contenedor.innerHTML = `<div class="text-center text-muted">No hay promociones disponibles.</div>`;
    return;
  }

  const indiceActual = obtenerIndicePromocional(cantidadPorCiclo, ciclosPorDia, totalPromos);
  const bloque = window.promocionesGlobal.slice(indiceActual, indiceActual + cantidadPorCiclo);

  if (bloque.length === 0) {
    contenedor.innerHTML = `<div class="text-center text-muted">No hay promociones activas en este momento.</div>`;
    return;
  }

  contenedor.innerHTML = "";
  contenedor.classList.toggle("bloque-incompleto", bloque.length < cantidadPorCiclo);

  bloque.forEach(p => {
    const precioOriginal = Number(p.precio) || 0;
    const precioDescuento = Math.round(precioOriginal * 0.9);

    const tarjeta = document.createElement("div");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
      <a href="PRODUCTO.HTML?id=${p.id}">
        <div class="imagen-producto">
          <img src="${p.imagen}" alt="${p.producto}">
          <span class="etiqueta-promo">🔥 10%</span>
        </div>
      </a>
      <div class="nombre-producto">${p.producto}</div>
      <div class="nombre-producto">${p.material || ""}</div>
      <div class="nombre-producto">${p.tallas || ""}</div>
      <div class="precio-producto">
        <s>$${precioOriginal.toLocaleString("es-CO")} COP</s>
        <span class="text-success fw-bold">$${precioDescuento.toLocaleString("es-CO")} COP</span>
      </div>
      <a href="PRODUCTO.HTML?id=${p.id}" class="boton-comprar">Ver más</a>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// === Renderizar productos en grid ===
function renderizarProductos(productos) {
  const contenedor = document.getElementById("contenido-productos");
  if (!contenedor) return;

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-search fs-1 text-muted"></i>
        <p class="mt-3 text-muted">No se encontraron productos</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = productos.map(producto => {
    const precioOriginal = Number(producto.precio) || 0;
    const precioDescuento = producto.promo === "sí" ? Math.round(precioOriginal * 0.9) : precioOriginal;

    return `
      <div class="producto">
        <a href="PRODUCTO.HTML?id=${producto.id}">
          <div class="imagen-producto">
            <img src="${producto.imagen}" alt="${producto.producto}">
            ${producto.promo === "sí" ? '<span class="etiqueta-promo">🔥 10%</span>' : ''}
            ${producto.stock <= 5 ? '<span class="etiqueta-stock">ÚLTIMAS UNIDADES</span>' : ''}
          </div>
        </a>
        <div class="nombre-producto">${producto.producto}</div>
        ${producto.material ? `<div class="material-producto">${producto.material}</div>` : ''}
        ${producto.tallas ? `<div class="tallas-producto">${producto.tallas}</div>` : ''}
        <div class="precio-producto">
          ${producto.promo === "sí" ? `<s>$${precioOriginal.toLocaleString("es-CO")} COP</s>` : ''}
          <span class="${producto.promo === "sí" ? 'text-success fw-bold' : ''}">
            $${precioDescuento.toLocaleString("es-CO")} COP
          </span>
        </div>
        <a href="PRODUCTO.HTML?id=${producto.id}" class="boton-comprar">Ver más</a>
      </div>
    `;
  }).join('');
}

// === SISTEMA DE FILTRADO POR CATEGORÍAS RÁPIDAS (ESTILO TEMU) ===
// Se integra sin afectar el funcionamiento actual

let productosGlobal = [];
let categoriaFiltroActual = 'TODOS';

// Función para filtrar por categoría (llamada desde las categorías rápidas)
function filtrarPorCategoria(categoria) {
  categoriaFiltroActual = categoria;
  
  // Actualizar estado activo en las categorías
  document.querySelectorAll('.categoria-rapida').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tipo') === categoria) {
      btn.classList.add('active');
    }
  });
  
  // Obtener los productos del catálogo global
  const productos = window.catalogoGlobal || [];
  
  if (categoria === 'TODOS') {
    // Ocultar el contenedor de productos filtrados
    const filtroContainer = document.getElementById('productos-filtrados-container');
    if (filtroContainer) filtroContainer.classList.add('d-none');
    // Mostrar secciones normales
    const ultimosGrid = document.getElementById('grid-ultimos');
    if (ultimosGrid) ultimosGrid.style.display = 'grid';
    return;
  }
  
  // Crear contenedor si no existe
  let contenedor = document.getElementById('productos-filtrados-container');
  let grid = document.getElementById('grid-productos-filtrados');
  let titulo = document.getElementById('titulo-categoria-filtrada');
  let contador = document.getElementById('contador-productos-filtrados');
  let sinProductos = document.getElementById('sin-productos-filtrados');
  
  if (!contenedor) {
    // Crear el contenedor dinámicamente
    const vistaInicio = document.getElementById('vista-inicio');
    const nuevoHTML = `
      <div id="productos-filtrados-container" class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h4 fw-bold mb-0" id="titulo-categoria-filtrada">Productos</h2>
          <span class="badge bg-primary" id="contador-productos-filtrados">0 productos</span>
        </div>
        <div id="grid-productos-filtrados" class="grid-productos-ml">
          <!-- Los productos filtrados aparecerán aquí -->
        </div>
        <div id="sin-productos-filtrados" class="text-center py-5 d-none">
          <i class="bi bi-emoji-frown fs-1 text-muted"></i>
          <h5 class="mt-3">No hay productos en esta categoría</h5>
          <p class="text-muted">Prueba con otra categoría</p>
          <button class="btn btn-outline-primary mt-2" onclick="filtrarPorCategoria('TODOS')">
            Ver todos los productos
          </button>
        </div>
      </div>
    `;
    
    // Insertar después del banner promocional o carrusel
    const ultimosContainer = document.querySelector('.container.mt-4');
    if (ultimosContainer) {
      ultimosContainer.insertAdjacentHTML('beforebegin', nuevoHTML);
    } else {
      vistaInicio.insertAdjacentHTML('beforeend', nuevoHTML);
    }
    
    // Reasignar variables
    contenedor = document.getElementById('productos-filtrados-container');
    grid = document.getElementById('grid-productos-filtrados');
    titulo = document.getElementById('titulo-categoria-filtrada');
    contador = document.getElementById('contador-productos-filtrados');
    sinProductos = document.getElementById('sin-productos-filtrados');
  }
  
  // Mostrar contenedor de productos filtrados
  contenedor.classList.remove('d-none');
  // Ocultar últimos productos temporalmente
  const ultimosGrid = document.getElementById('grid-ultimos');
  if (ultimosGrid) ultimosGrid.style.display = 'none';
  
  // Filtrar productos por categoría (busca en tipo, subtipo, categoria o keywords)
  const productosFiltrados = productos.filter(producto => {
    // Buscar en diferentes campos
    const tipoMatch = producto.tipo && producto.tipo.toUpperCase() === categoria;
    const subtipoMatch = producto.subtipo && producto.subtipo.toUpperCase() === categoria;
    const categoriaMatch = producto.categoria && producto.categoria.toUpperCase() === categoria;
    const keywordsMatch = producto.keywords && producto.keywords.toUpperCase().includes(categoria);
    
    return tipoMatch || subtipoMatch || categoriaMatch || keywordsMatch;
  });
  
  // Actualizar título y contador
  titulo.textContent = categoria;
  contador.textContent = `${productosFiltrados.length} productos`;
  
  // Mostrar productos o mensaje de no hay productos
  if (productosFiltrados.length === 0) {
    grid.innerHTML = '';
    sinProductos.classList.remove('d-none');
  } else {
    sinProductos.classList.add('d-none');
    
    // Generar HTML de productos (máximo 8 para no sobrecargar)
    let html = '';
    productosFiltrados.slice(0, 8).forEach((producto) => {
      const precioOriginal = Number(producto.precio) || 0;
      const precioDescuento = producto.promo === "sí" ? Math.round(precioOriginal * 0.9) : precioOriginal;
      
      html += `
        <div class="card-producto-ml">
          <a href="PRODUCTO.HTML?id=${producto.id}">
            <div class="position-relative">
              <img src="${producto.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'}" 
                   alt="${producto.producto}" class="card-img-ml"
                   onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
              ${producto.promo === "sí" ? '<span class="badge bg-danger position-absolute" style="top: 10px; left: 10px;">-10%</span>' : ''}
              ${producto.stock <= 5 ? '<span class="badge bg-warning text-dark position-absolute" style="top: 10px; right: 10px;">Últimas</span>' : ''}
            </div>
            <div class="card-body-ml">
              <h3 class="nombre-producto-ml small line-clamp-2">${producto.producto}</h3>
              <div class="precio-ml fw-bold text-primary">
                $${precioDescuento.toLocaleString('es-CO')}
              </div>
              ${producto.promo === "sí" && precioOriginal !== precioDescuento ? 
                `<div class="text-muted text-decoration-line-through small">
                  $${precioOriginal.toLocaleString('es-CO')}
                </div>` : ''
              }
              <button class="btn btn-outline-primary btn-sm mt-2" onclick="event.preventDefault(); window.location.href='PRODUCTO.HTML?id=${producto.id}'">
                <i class="bi bi-eye"></i> Ver detalles
              </button>
            </div>
          </a>
        </div>
      `;
    });
    
    // Agregar botón "Ver más" si hay más de 8 productos
    if (productosFiltrados.length > 8) {
      html += `
        <div class="card-producto-ml d-flex align-items-center justify-content-center">
          <div class="text-center p-4">
            <p class="mb-3">Hay ${productosFiltrados.length - 8} productos más</p>
            <button class="btn btn-primary" onclick="cargarSubtipos('${categoria.toLowerCase()}')">
              Ver todos en esta categoría
            </button>
          </div>
        </div>
      `;
    }
    
    grid.innerHTML = html;
  }
}

// Función para mostrar todos los productos (mantiene compatibilidad)
function mostrarTodosLosProductos() {
  filtrarPorCategoria('TODOS');
  // También activa la vista de todos los productos si existe
  if (typeof window.mostrarTodosLosProductosCompleto === 'function') {
    window.mostrarTodosLosProductosCompleto();
  } else if (typeof mostrarTodosLosProductos === 'function') {
    // Esto es para compatibilidad con tu función existente
    // Se maneja más adelante
  }
}

// Función para cargar subtipos (mantiene compatibilidad con tu sistema)
function cargarSubtipos(tipo) {
  // Primero filtra por la categoría
  filtrarPorCategoria(tipo.toUpperCase());
  
  // También puede navegar a la vista de subtipos si el usuario quiere
  // (esto mantiene tu sistema de navegación original)
  // Descomenta la siguiente línea si quieres ambas funcionalidades:
  /*
  setTimeout(() => {
    // Tu lógica original para cargar subtipos
    if (window.cargarYRenderizarSubtipos) {
      window.cargarYRenderizarSubtipos(tipo);
    }
  }, 100);
  */
}

// Inicializar el sistema de filtrado cuando se cargan los productos
function inicializarFiltroCategorias() {
  // Esperar a que se carguen los productos
  if (window.catalogoGlobal && window.catalogoGlobal.length > 0) {
    productosGlobal = window.catalogoGlobal;
    console.log(`✅ Sistema de filtrado Temu listo con ${productosGlobal.length} productos`);
    
    // Agregar badges de contador a las categorías
    agregarContadoresCategorias();
  } else {
    // Reintentar después de 2 segundos
    setTimeout(() => {
      if (window.catalogoGlobal && window.catalogoGlobal.length > 0) {
        productosGlobal = window.catalogoGlobal;
        agregarContadoresCategorias();
      }
    }, 2000);
  }
}

// Agregar contadores a las categorías
function agregarContadoresCategorias() {
  document.querySelectorAll('.categoria-rapida').forEach(categoria => {
    const tipo = categoria.getAttribute('data-tipo');
    if (tipo !== 'TODOS') {
      // Contar productos que pertenecen a esta categoría
      const count = productosGlobal.filter(producto => {
        const tipoMatch = producto.tipo && producto.tipo.toUpperCase() === tipo;
        const subtipoMatch = producto.subtipo && producto.subtipo.toUpperCase() === tipo;
        const categoriaMatch = producto.categoria && producto.categoria.toUpperCase() === tipo;
        const keywordsMatch = producto.keywords && producto.keywords.toUpperCase().includes(tipo);
        
        return tipoMatch || subtipoMatch || categoriaMatch || keywordsMatch;
      }).length;
      
      if (count > 0) {
        // Eliminar badge anterior si existe
        const badgeAnterior = categoria.querySelector('.badge-categoria-count');
        if (badgeAnterior) {
          badgeAnterior.remove();
        }
        
        // Crear nuevo badge
        const badge = document.createElement('span');
        badge.className = 'badge-categoria-count';
        badge.textContent = count;
        badge.style.cssText = `
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        categoria.style.position = 'relative';
        categoria.appendChild(badge);
      }
    }
  });
}

// 🛍️ FUNCIONES PARA "TODOS LOS PRODUCTOS" - VERSIÓN SCROLL INFINITO

let todosProductos = [];
let productosFiltradosTodos = [];
let productosCargados = 0;
const productosPorCarga = 20; // Cuántos productos cargar cada vez
let cargandoMasProductos = false;
let tieneMasProductos = true;

// Función para mostrar todos los productos (vista completa)
async function mostrarTodosLosProductosCompleto() {
  try {
    console.log("🛍️ Cargando todos los productos...");
    
    // Ocultar todas las vistas y mostrar solo "todos"
    document.querySelectorAll('.vista').forEach(vista => {
      vista.classList.remove('vista-activa');
    });
    document.getElementById('vista-todos').classList.add('vista-activa');
    
    // Mostrar loading inicial
    const grid = document.getElementById('grid-todos');
    grid.innerHTML = '';
    
    const cargandoDiv = document.createElement('div');
    cargandoDiv.className = 'col-12 text-center py-5';
    cargandoDiv.innerHTML = `
      <div class="spinner-border text-primary"></div>
      <p class="mt-2">Cargando catálogo completo...</p>
    `;
    grid.appendChild(cargandoDiv);
    
    // Resetear variables de scroll infinito
    productosCargados = 0;
    cargandoMasProductos = false;
    tieneMasProductos = true;
    
    // Asegurarse de tener el catálogo cargado
    if (!window.catalogoGlobal || window.catalogoGlobal.length === 0) {
      window.catalogoGlobal = await cargarCatalogoGlobal();
    }
    
    todosProductos = window.catalogoGlobal || [];
    productosFiltradosTodos = [...todosProductos];
    
    // Actualizar contador
    document.getElementById('contador-todos').textContent = `${todosProductos.length} productos`;
    
    // Llenar filtros
    llenarFiltrosTodos();
    
    // Limpiar grid y cargar primera tanda
    grid.innerHTML = '';
    cargarPrimeraTandaProductos();
    
    // Configurar scroll infinito
    configurarScrollInfinito();
    
    console.log(`✅ ${todosProductos.length} productos listos para mostrar`);
    
  } catch (error) {
    console.error('Error cargando todos los productos:', error);
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
}

// Función para cargar primera tanda de productos
function cargarPrimeraTandaProductos() {
  productosCargados = 0;
  renderizarSiguientesProductos();
}

// Función para renderizar más productos
function renderizarSiguientesProductos() {
  if (cargandoMasProductos || !tieneMasProductos) return;
  
  cargandoMasProductos = true;
  
  // Mostrar spinner
  const spinner = document.getElementById('cargando-todos');
  if (spinner) spinner.classList.remove('d-none');
  
  // Simular un pequeño delay para mejor UX
  setTimeout(() => {
    const inicio = productosCargados;
    const fin = inicio + productosPorCarga;
    const productosParaMostrar = productosFiltradosTodos.slice(inicio, fin);
    
    const grid = document.getElementById('grid-todos');
    
    // Ocultar mensaje de no resultados si existe
    const sinResultados = document.getElementById('sin-resultados-todos');
    if (sinResultados) sinResultados.classList.add('d-none');
    
    if (productosParaMostrar.length === 0 && productosCargados === 0) {
      // No hay productos
      grid.innerHTML = '';
      if (sinResultados) sinResultados.classList.remove('d-none');
      tieneMasProductos = false;
    } else if (productosParaMostrar.length === 0) {
      // Ya no hay más productos
      tieneMasProductos = false;
    } else {
      // Renderizar productos
      productosParaMostrar.forEach(producto => {
        const card = crearCardProducto(producto);
        grid.appendChild(card);
      });
      
      productosCargados += productosParaMostrar.length;
      
      // Mostrar botón "Ver más" si hay más productos (solo si no hay filtros activos)
      const btnContainer = document.getElementById('btn-ver-mas-container');
      if (btnContainer && productosCargados < productosFiltradosTodos.length) {
        btnContainer.classList.remove('d-none');
      }
    }
    
    // Ocultar spinner
    if (spinner) spinner.classList.add('d-none');
    cargandoMasProductos = false;
    
    // Si quedan menos de 10 productos por mostrar, cargar más automáticamente
    if (tieneMasProductos && (productosFiltradosTodos.length - productosCargados) < 10) {
      renderizarSiguientesProductos();
    }
  }, 300);
}

// Función para crear una tarjeta de producto (igual que las otras vistas)
function crearCardProducto(producto) {
  const div = document.createElement('div');
  div.className = 'card-producto-ml';
  
  const precioOriginal = Number(producto.precio) || 0;
  let precioFinal = precioOriginal;
  let descuentoHTML = '';
  let badgePromo = '';
  
  // Verificar si está en promoción
  const estaEnPromo = producto.promo === "sí" || producto.promo === true || producto.promo === "true";
  
  if (estaEnPromo) {
    const descuento = producto.precioOferta ? Math.round((1 - producto.precioOferta / precioOriginal) * 100) : 10;
    precioFinal = producto.precioOferta || Math.round(precioOriginal * 0.9);
    badgePromo = `<span class="badge bg-danger position-absolute" style="top: 10px; left: 10px;">-${descuento}%</span>`;
  }
  
  // Verificar stock bajo
  const badgeStock = producto.stock <= 5 ? 
    `<span class="badge bg-warning text-dark position-absolute" style="top: 10px; right: 10px;">Últimas</span>` : '';
  
  // Badge del tipo (opcional)
  const badgeTipo = producto.tipo ? 
    `<span class="badge bg-info text-dark mb-1">${producto.tipo}</span>` : '';
  
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
        ${badgeTipo}
        
        <h3 class="nombre-producto-ml small line-clamp-2">${producto.producto}</h3>
        
        ${producto.subtipo ? `
          <p class="text-muted mb-1 small">${producto.subtipo}</p>
        ` : ''}
        
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
          
          <button class="btn btn-outline-primary btn-sm" onclick="event.preventDefault(); window.location.href='PRODUCTO.HTML?id=${producto.id}'">
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
  // Limpiar listener anterior si existe
  window.removeEventListener('scroll', manejarScrollInfinito);
  
  // Agregar nuevo listener
  window.addEventListener('scroll', manejarScrollInfinito);
  
  // También agregar botón de "Ver más" como alternativa
  const btnVerMas = document.getElementById('btn-ver-mas');
  if (btnVerMas) {
    btnVerMas.onclick = cargarMasProductos;
  }
}

// Manejar scroll infinito
function manejarScrollInfinito() {
  if (cargandoMasProductos || !tieneMasProductos) return;
  
  // Calcular si estamos cerca del final de la página
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight;
  const clientHeight = document.documentElement.clientHeight;
  
  // Si estamos a 500px del final, cargar más productos
  if (scrollTop + clientHeight >= scrollHeight - 500) {
    renderizarSiguientesProductos();
  }
}

// Función para cargar más productos (usada por el botón)
function cargarMasProductos() {
  if (!cargandoMasProductos && tieneMasProductos) {
    renderizarSiguientesProductos();
  }
}

// Llenar los filtros
function llenarFiltrosTodos() {
  // Filtrar tipos únicos
  const tiposUnicos = [...new Set(todosProductos.map(p => p.tipo).filter(Boolean))];
  const filtroTipo = document.getElementById('filtro-tipo-todos');
  if (filtroTipo) {
    // Mantener la opción actual si existe
    const valorActual = filtroTipo.value;
    filtroTipo.innerHTML = '<option value="">Filtrar por tipo</option>';
    
    tiposUnicos.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo;
      option.textContent = tipo;
      filtroTipo.appendChild(option);
    });
    
    // Restaurar valor si existe
    if (valorActual && tiposUnicos.includes(valorActual)) {
      filtroTipo.value = valorActual;
    }
  }
}

// Función para filtrar productos en vista "todos"
function filtrarProductosTodos() {
  const filtroTipo = document.getElementById('filtro-tipo-todos')?.value || '';
  const busqueda = document.getElementById('buscar-todos')?.value.toLowerCase() || '';
  
  // Aplicar filtros
  productosFiltradosTodos = todosProductos.filter(producto => {
    // Filtrar por tipo
    if (filtroTipo && producto.tipo !== filtroTipo) return false;
    
    // Filtrar por búsqueda de texto
    if (busqueda) {
      const textoProducto = `${producto.producto || ''} ${producto.descripcion || ''} ${producto.tipo || ''} ${producto.subtipo || ''} ${producto.categoria || ''}`.toLowerCase();
      if (!textoProducto.includes(busqueda)) return false;
    }
    
    return true;
  });
  
  // Aplicar ordenamiento actual
  aplicarOrdenamientoActual();
  
  // Actualizar contador
  const contador = document.getElementById('contador-todos');
  if (contador) {
    contador.textContent = `${productosFiltradosTodos.length} productos`;
  }
  
  // Reiniciar scroll infinito
  productosCargados = 0;
  tieneMasProductos = productosFiltradosTodos.length > 0;
  
  // Limpiar grid y cargar primera tanda
  const grid = document.getElementById('grid-todos');
  if (grid) {
    grid.innerHTML = '';
  }
  
  // Ocultar mensaje de no resultados temporalmente
  const sinResultados = document.getElementById('sin-resultados-todos');
  if (sinResultados) sinResultados.classList.add('d-none');
  
  // Cargar productos filtrados
  if (productosFiltradosTodos.length > 0) {
    cargarPrimeraTandaProductos();
  } else {
    // Mostrar mensaje de no resultados
    if (sinResultados) sinResultados.classList.remove('d-none');
  }
}

// Función para ordenar productos
function ordenarProductosTodos() {
  aplicarOrdenamientoActual();
  
  // Reiniciar scroll infinito
  productosCargados = 0;
  
  // Limpiar grid y cargar primera tanda
  const grid = document.getElementById('grid-todos');
  if (grid) {
    grid.innerHTML = '';
  }
  
  if (productosFiltradosTodos.length > 0) {
    cargarPrimeraTandaProductos();
  }
}

// Aplicar ordenamiento actual
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
      // Mantener orden original (más recientes primero)
      break;
  }
}

// Modificar la función de volver al inicio para limpiar el scroll infinito
function volverAInicio() {
  // Ocultar todas las vistas y mostrar solo la vista de inicio
  document.querySelectorAll('.vista').forEach(vista => {
    vista.classList.remove('vista-activa');
  });
  
  const vistaInicio = document.getElementById('vista-inicio');
  if (vistaInicio) {
    vistaInicio.classList.add('vista-activa');
  }
  
  // Limpiar listener de scroll infinito
  window.removeEventListener('scroll', manejarScrollInfinito);
  
  // Limpiar filtros de la vista "todos"
  const busqueda = document.getElementById('buscar-todos');
  const filtroTipo = document.getElementById('filtro-tipo-todos');
  const orden = document.getElementById('ordenar-todos');
  
  if (busqueda) busqueda.value = '';
  if (filtroTipo) filtroTipo.value = '';
  if (orden) orden.value = 'recientes';
  
  // También volver al filtro "TODOS" en categorías rápidas
  filtrarPorCategoria('TODOS');
  
  // Limpiar parámetros de URL
  const nuevaURL = new URL(window.location);
  nuevaURL.searchParams.delete('vista');
  window.history.replaceState({}, '', nuevaURL);
}

// === Inicialización principal ===
document.addEventListener("DOMContentLoaded", async () => {
  const { tipo, subtipo, categoria, vista } = getParametrosDesdeURL();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("✅ Service Worker registrado"))
      .catch(err => console.error("❌ Error al registrar SW:", err));
  }

  await cargarCatalogoGlobal();
  await cargarAccesosGlobal();
  window.catalogo = window.catalogoGlobal || [];

  // ✅ Filtrar promociones globales
  window.promocionesGlobal = window.catalogoGlobal.filter(p => {
    const promo = typeof p.promo === "string" ? p.promo.toLowerCase().trim() : p.promo;
    return promo === true || promo === "true" || promo === "sí" || promo === "activo";
  });

  // ✅ Mostrar botón de instalación PWA si no está instalado
  const esPWAInstalado = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

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

  // ✅ Cargar encabezado
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer.querySelector(".header")) {
    const header = await fetch("HEADER.HTML").then(res => res.text());
    headerContainer.insertAdjacentHTML("afterbegin", header);
    
    // ✅ ESPERAR a que el header se renderice completamente
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // ✅ Renderizar menú lateral y promociones (DESPUÉS de cargar el header)
  if (Array.isArray(window.catalogoGlobal) && window.catalogoGlobal.length > 0) {
    // Darle más tiempo al header para renderizar
    setTimeout(() => {
      renderizarMenuLateral(window.catalogoGlobal);
    }, 200);
    
    renderCarruselPromosDesdePromos();
    renderPromocionesPorCiclo();
  }

  // ✅ Activar buscador si existe
  if (typeof activarBuscadorGlobal === "function") {
    activarBuscadorGlobal();
  }

  // ✅ Activar botón flotante del carrito
  const carritoBtn = document.querySelector(".btn_shopping");
  carritoBtn?.addEventListener("click", e => {
    e.preventDefault();
    const offcanvas = document.getElementById("offcanvasCarrito");
    if (offcanvas) {
      const instancia = bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
      instancia.show();
    }
  });

  // ✅ Mostrar temporizador
  mostrarTemporizadorPromos();

  // ✅ Cargar pie de página
  const footer = await fetch("footer.html").then(res => res.text());
  document.getElementById("footer-container").innerHTML = footer;

  // ✅ Activar menú lateral si existe - VERSIÓN CORREGIDA
  const toggle = document.getElementById("toggle-categorias");
  toggle?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const menu = document.getElementById("menu-categorias");
    if (menu) {
      const isVisible = menu.style.display === "flex";
      menu.style.display = isVisible ? "none" : "flex";
    }
  });

  // ✅ Renderizar productos si aplica
  if (document.getElementById("contenido-productos")) {
    const rutaActual = window.location.pathname;
    const accesosRuta = window.accesosGlobal?.filter(a => a.ruta === rutaActual) || [];
    const idsRuta = accesosRuta.map(a => a.id_producto);
    const productosFiltrados = window.catalogoGlobal.filter(p => idsRuta.includes(p.id));
    renderizarProductos(productosFiltrados.length ? productosFiltrados : window.catalogoGlobal);
  }

  // ✅ Manejar parámetros de URL para la vista "todos"
  if (vista === 'todos') {
    // Esperar un poco para que todo cargue
    setTimeout(() => {
      mostrarTodosLosProductosCompleto();
    }, 500);
  }

  // ✅ Actualizar contador del carrito si la función está disponible
  if (typeof window.actualizarContadorCarrito === "function") {
    window.actualizarContadorCarrito();
  }

  // ✅ Renderizar contenido del carrito si la función está disponible y el catálogo está listo
  if (
    typeof window.renderizarCarrito === "function" &&
    Array.isArray(window.catalogoGlobal) &&
    window.catalogoGlobal.length > 0 &&
    document.getElementById("carrito-contenido")
  ) {
    window.renderizarCarrito();
  }
  
  // ✅ Inicializar sistema de filtrado de categorías
  setTimeout(() => {
    inicializarFiltroCategorias();
  }, 1000);
});

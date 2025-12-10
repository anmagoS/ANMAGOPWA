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

// 🛍️ FUNCIONES PARA "TODOS LOS PRODUCTOS" - NUEVAS

let todosProductos = [];
let productosFiltradosTodos = [];
const productosPorPagina = 20;
let paginaActualTodos = 1;

// Función para mostrar todos los productos
async function mostrarTodosLosProductos() {
  try {
    // Si ya estamos en la vista "todos", no hacer nada
    const vistaActual = document.getElementById('vista-todos');
    if (vistaActual && vistaActual.classList.contains('vista-activa')) {
      return;
    }
    
    console.log("🛍️ Cargando todos los productos...");
    
    // Asegurarse de tener el catálogo cargado
    if (!window.catalogoGlobal || window.catalogoGlobal.length === 0) {
      await cargarCatalogoGlobal();
    }
    
    // Verificar si existe la vista "todos"
    let vistaTodosContainer = document.getElementById('vista-todos');
    if (!vistaTodosContainer) {
      // Crear la vista si no existe
      const main = document.querySelector('main');
      const htmlVistaTodos = `
        <!-- VISTA 5: TODOS LOS PRODUCTOS -->
        <div id="vista-todos" class="vista">
          <div class="container mt-3">
            <nav class="breadcrumb-vista">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a href="#" onclick="volverAInicio(); return false;">INICIO</a></li>
                <li class="breadcrumb-item active" id="breadcrumb-todos">Todos los productos</li>
              </ol>
            </nav>
            
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h1 class="h4 fw-bold mb-0">🛍️ Todos los productos</h1>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary" id="contador-todos">0 productos</span>
                <!-- Opcional: Agregar filtro de búsqueda -->
                <div class="input-group input-group-sm" style="width: 200px;">
                  <input type="text" id="buscar-todos" class="form-control" placeholder="Buscar..." 
                         onkeyup="filtrarProductosTodos()">
                  <button class="btn btn-outline-secondary" type="button">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Filtros opcionales -->
            <div class="row mb-3">
              <div class="col-md-4">
                <select class="form-select form-select-sm" id="filtro-tipo-todos" onchange="filtrarProductosTodos()">
                  <option value="">Todos los tipos</option>
                </select>
              </div>
              <div class="col-md-4">
                <select class="form-select form-select-sm" id="filtro-categoria-todos" onchange="filtrarProductosTodos()">
                  <option value="">Todas las categorías</option>
                </select>
              </div>
              <div class="col-md-4">
                <select class="form-select form-select-sm" id="ordenar-todos" onchange="ordenarProductosTodos()">
                  <option value="recientes">Más recientes</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="nombre">Nombre A-Z</option>
                </select>
              </div>
            </div>
            
            <div id="grid-todos" class="grid-productos-ml"></div>
            
            <!-- Paginación -->
            <nav aria-label="Paginación productos" class="mt-4" id="paginacion-todos">
              <ul class="pagination justify-content-center">
                <li class="page-item disabled">
                  <a class="page-link" href="#" tabindex="-1">Anterior</a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item">
                  <a class="page-link" href="#">Siguiente</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      `;
      main.insertAdjacentHTML('beforeend', htmlVistaTodos);
      vistaTodosContainer = document.getElementById('vista-todos');
    }
    
    // Cambiar a vista de todos los productos
    document.querySelectorAll('.vista').forEach(vista => {
      vista.classList.remove('vista-activa');
    });
    vistaTodosContainer.classList.add('vista-activa');
    
    document.getElementById('breadcrumb-todos').textContent = 'Todos los productos';
    
    // Mostrar loading
    const grid = document.getElementById('grid-todos');
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2">Cargando todos los productos...</p>
      </div>
    `;
    
    // Obtener catálogo
    todosProductos = window.catalogoGlobal || [];
    productosFiltradosTodos = [...todosProductos];
    
    // Actualizar contador
    document.getElementById('contador-todos').textContent = `${todosProductos.length} productos`;
    
    // Llenar filtros
    llenarFiltrosTodos();
    
    // Renderizar primera página
    renderizarPaginaTodos(1);
    
    // Actualizar URL
    const nuevaURL = new URL(window.location);
    nuevaURL.searchParams.set('vista', 'todos');
    window.history.pushState({}, '', nuevaURL);
    
    console.log(`✅ ${todosProductos.length} productos cargados`);
    
  } catch (error) {
    console.error('Error cargando todos los productos:', error);
    const grid = document.getElementById('grid-todos');
    if (grid) {
      grid.innerHTML = `
        <div class="col-12 text-center py-4">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i>
            <p>Error al cargar los productos. Intenta nuevamente.</p>
            <button onclick="mostrarTodosLosProductos()" class="btn btn-danger btn-sm">
              <i class="bi bi-arrow-clockwise"></i> Reintentar
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Llenar los filtros con opciones únicas
function llenarFiltrosTodos() {
  // Filtrar tipos únicos
  const tiposUnicos = [...new Set(todosProductos.map(p => p.tipo).filter(Boolean))];
  const filtroTipo = document.getElementById('filtro-tipo-todos');
  if (filtroTipo) {
    filtroTipo.innerHTML = '<option value="">Todos los tipos</option>';
    tiposUnicos.forEach(tipo => {
      const option = document.createElement('option');
      option.value = tipo;
      option.textContent = tipo;
      filtroTipo.appendChild(option);
    });
  }
  
  // Filtrar categorías únicas
  const categoriasUnicas = [...new Set(todosProductos.map(p => p.categoria).filter(Boolean))];
  const filtroCategoria = document.getElementById('filtro-categoria-todos');
  if (filtroCategoria) {
    filtroCategoria.innerHTML = '<option value="">Todas las categorías</option>';
    categoriasUnicas.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria;
      option.textContent = categoria;
      filtroCategoria.appendChild(option);
    });
  }
}

// Función para filtrar productos
function filtrarProductosTodos() {
  const filtroTipo = document.getElementById('filtro-tipo-todos')?.value || '';
  const filtroCategoria = document.getElementById('filtro-categoria-todos')?.value || '';
  const busqueda = document.getElementById('buscar-todos')?.value.toLowerCase() || '';
  
  productosFiltradosTodos = todosProductos.filter(producto => {
    // Filtrar por tipo
    if (filtroTipo && producto.tipo !== filtroTipo) return false;
    
    // Filtrar por categoría
    if (filtroCategoria && producto.categoria !== filtroCategoria) return false;
    
    // Filtrar por búsqueda de texto
    if (busqueda) {
      const textoProducto = `${producto.producto || ''} ${producto.descripcion || ''} ${producto.categoria || ''}`.toLowerCase();
      if (!textoProducto.includes(busqueda)) return false;
    }
    
    return true;
  });
  
  // Actualizar contador
  const contador = document.getElementById('contador-todos');
  if (contador) {
    contador.textContent = `${productosFiltradosTodos.length} productos`;
  }
  
  // Volver a primera página
  renderizarPaginaTodos(1);
}

// Función para ordenar productos
function ordenarProductosTodos() {
  const orden = document.getElementById('ordenar-todos').value;
  
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
      // Mantener orden original (más recientes primero si vienen así del JSON)
      break;
  }
  
  renderizarPaginaTodos(paginaActualTodos);
}

// Función para renderizar una página específica
function renderizarPaginaTodos(pagina) {
  paginaActualTodos = pagina;
  
  const inicio = (pagina - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosPagina = productosFiltradosTodos.slice(inicio, fin);
  
  const grid = document.getElementById('grid-todos');
  if (!grid) return;
  
  if (productosPagina.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search fs-1 text-muted"></i>
        <h5 class="mt-3">No se encontraron productos</h5>
        <p class="text-muted">Intenta con otros filtros de búsqueda</p>
      </div>
    `;
    
    // Ocultar paginación
    const paginacion = document.getElementById('paginacion-todos');
    if (paginacion) {
      paginacion.style.display = 'none';
    }
    return;
  }
  
  // Mostrar paginación
  const paginacion = document.getElementById('paginacion-todos');
  if (paginacion) {
    paginacion.style.display = 'flex';
  }
  
  // Renderizar productos
  grid.innerHTML = productosPagina.map(producto => {
    const precioOriginal = Number(producto.precio) || 0;
    let precioFinal = precioOriginal;
    let descuentoHTML = '';
    
    // Verificar si está en promoción
    if (producto.promo === "sí" || producto.promo === true || producto.promo === "true") {
      const descuento = producto.precioOferta ? Math.round((1 - producto.precioOferta / precioOriginal) * 100) : 10;
      precioFinal = producto.precioOferta || Math.round(precioOriginal * 0.9);
      descuentoHTML = `
        <div class="position-absolute top-0 start-0 m-2">
          <span class="badge bg-danger">-${descuento}%</span>
        </div>
      `;
    }
    
    return `
      <div class="card-producto-ml">
        <a href="PRODUCTO.HTML?id=${producto.id}">
          <div class="position-relative">
            <img src="${producto.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'}" 
                 alt="${producto.producto}" 
                 class="card-img-ml"
                 loading="lazy"
                 onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
            ${descuentoHTML}
            
            <!-- Badge de stock bajo -->
            ${producto.stock <= 5 ? `
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge bg-warning text-dark">Últimas</span>
              </div>
            ` : ''}
          </div>
          
          <div class="card-body-ml">
            <!-- Badge del tipo -->
            ${producto.tipo ? `
              <span class="badge bg-info text-dark mb-1">${producto.tipo}</span>
            ` : ''}
            
            <h3 class="nombre-producto-ml small line-clamp-2">${producto.producto}</h3>
            
            ${producto.subtipo ? `
              <p class="text-muted mb-1 small">${producto.subtipo}</p>
            ` : ''}
            
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div>
                <div class="precio-ml fw-bold text-primary">
                  $${precioFinal.toLocaleString('es-CO')}
                </div>
                ${precioOriginal !== precioFinal ? `
                  <div class="text-muted text-decoration-line-through small">
                    $${precioOriginal.toLocaleString('es-CO')}
                  </div>
                ` : ''}
              </div>
              
              <button class="btn btn-primary btn-sm">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </a>
      </div>
    `;
  }).join('');
  
  // Actualizar paginación
  actualizarPaginacionTodos();
}

// Función para actualizar la paginación
function actualizarPaginacionTodos() {
  const totalPaginas = Math.ceil(productosFiltradosTodos.length / productosPorPagina);
  const paginacion = document.getElementById('paginacion-todos');
  
  if (!paginacion || totalPaginas <= 1) {
    if (paginacion) {
      paginacion.style.display = 'none';
    }
    return;
  }
  
  let paginacionHTML = `
    <ul class="pagination justify-content-center">
      <li class="page-item ${paginaActualTodos === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="cambiarPaginaTodos(${paginaActualTodos - 1}); return false;">
          Anterior
        </a>
      </li>
  `;
  
  // Mostrar máximo 5 páginas alrededor de la actual
  const inicioPag = Math.max(1, paginaActualTodos - 2);
  const finPag = Math.min(totalPaginas, paginaActualTodos + 2);
  
  for (let i = inicioPag; i <= finPag; i++) {
    paginacionHTML += `
      <li class="page-item ${i === paginaActualTodos ? 'active' : ''}">
        <a class="page-link" href="#" onclick="cambiarPaginaTodos(${i}); return false;">
          ${i}
        </a>
      </li>
    `;
  }
  
  paginacionHTML += `
    <li class="page-item ${paginaActualTodos === totalPaginas ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="cambiarPaginaTodos(${paginaActualTodos + 1}); return false;">
        Siguiente
      </a>
    </li>
  </ul>`;
  
  paginacion.innerHTML = paginacionHTML;
  paginacion.style.display = 'flex';
}

// Función para cambiar de página
function cambiarPaginaTodos(pagina) {
  if (pagina < 1 || pagina > Math.ceil(productosFiltradosTodos.length / productosPorPagina)) {
    return;
  }
  
  renderizarPaginaTodos(pagina);
  
  // Hacer scroll suave al top
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Función para volver al inicio
function volverAInicio() {
  // Ocultar todas las vistas y mostrar solo la vista de inicio
  document.querySelectorAll('.vista').forEach(vista => {
    vista.classList.remove('vista-activa');
  });
  
  const vistaInicio = document.getElementById('vista-inicio');
  if (vistaInicio) {
    vistaInicio.classList.add('vista-activa');
  }
  
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
      mostrarTodosLosProductos();
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
});

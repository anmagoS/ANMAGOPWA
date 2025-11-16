// buscador.js - Versión CORREGIDA para header
(function() {
  'use strict';
  
  const CONFIG = {
    minCaracteres: 2,
    maxSugerencias: 8,
    debounceTime: 300
  };

  let timeoutBusqueda = null;
  let catalogoCargado = false;

  async function cargarCatalogo() {
    if (window.catalogoGlobal && window.catalogoGlobal.length > 0) {
      catalogoCargado = true;
      return window.catalogoGlobal;
    }

    try {
      const url = "https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json?v=" + Date.now();
      const respuesta = await fetch(url);
      window.catalogoGlobal = await respuesta.json();
      catalogoCargado = true;
      console.log('✅ Catálogo cargado:', window.catalogoGlobal.length, 'productos');
      return window.catalogoGlobal;
    } catch (error) {
      console.error('❌ Error cargando catálogo:', error);
      return [];
    }
  }

  function buscarProductos(texto) {
    if (!catalogoCargado || !window.catalogoGlobal) {
      console.log('❌ Catálogo no disponible');
      return [];
    }
    
    const textoLimpio = texto.toLowerCase().trim();
    if (textoLimpio.length < CONFIG.minCaracteres) return [];

    console.log('🔍 Buscando:', textoLimpio);
    
    const resultados = window.catalogoGlobal.filter(producto => {
      const campos = [
        producto.producto,
        producto.tipo,
        producto.subtipo,
        producto.categoria,
        producto.material,
        producto.descripcion
      ];

      return campos.some(campo => 
        campo && campo.toString().toLowerCase().includes(textoLimpio)
      );
    });

    console.log('📦 Resultados encontrados:', resultados.length);
    return resultados;
  }

  function mostrarSugerencias(coincidencias, textoBusqueda) {
    const sugerencias = document.getElementById("sugerencias");
    const buscador = document.getElementById("buscador");
    
    if (!sugerencias || !buscador) {
      console.log('❌ Elementos no encontrados');
      return;
    }

    // LIMPIAR SUGERENCIAS
    sugerencias.innerHTML = '';

    if (coincidencias.length === 0) {
      const item = document.createElement('div');
      item.className = 'dropdown-item text-muted';
      item.textContent = textoBusqueda ? `No hay resultados para "${textoBusqueda}"` : 'Escribe para buscar...';
      sugerencias.appendChild(item);
      sugerencias.classList.add('show');
      return;
    }

    // AGREGAR SUGERENCIAS
    const sugerenciasMostrar = coincidencias.slice(0, CONFIG.maxSugerencias);
    
    sugerenciasMostrar.forEach((producto, index) => {
      const item = document.createElement('a');
      item.className = 'dropdown-item d-flex align-items-center gap-2 py-2';
      item.href = `PRODUCTO.HTML?id=${producto.id}`;
      item.style.cursor = 'pointer';
      item.innerHTML = `
        <img src="${producto.imagen}" 
             alt="${producto.producto}" 
             style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; background: #f8f9fa;"
             onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
        <div class="flex-grow-1">
          <div class="fw-bold small text-dark">${producto.producto}</div>
          <div class="extra-small text-muted">
            ${producto.tipo} › ${producto.subtipo}
          </div>
          <div class="extra-small text-primary fw-bold">
            $${Number(producto.precio).toLocaleString('es-CO')}
          </div>
        </div>
      `;
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🎯 Producto seleccionado:', producto.producto);
        irADetalleDesdeBusqueda(producto);
      });
      
      sugerencias.appendChild(item);
    });

    // OPCIÓN VER TODOS
    if (coincidencias.length > CONFIG.maxSugerencias) {
      const verTodos = document.createElement('a');
      verTodos.className = 'dropdown-item text-center border-top py-2 bg-light fw-bold';
      verTodos.href = '#';
      verTodos.style.cursor = 'pointer';
      verTodos.innerHTML = `Ver todos los ${coincidencias.length} resultados ›`;
      
      verTodos.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTodosResultados(textoBusqueda, coincidencias);
      });
      
      sugerencias.appendChild(verTodos);
    }

    // MOSTRAR DROPDOWN
    sugerencias.classList.add('show');
    console.log('✅ Sugerencias mostradas:', coincidencias.length);
  }

  function irADetalleDesdeBusqueda(producto) {
    const estadoBusqueda = {
      termino: document.getElementById('buscador').value,
      timestamp: Date.now()
    };
    localStorage.setItem('ultimaBusquedaAnmago', JSON.stringify(estadoBusqueda));
    
    window.location.href = `PRODUCTO.HTML?id=${producto.id}&origen=busqueda`;
    ocultarSugerencias();
  }

  function mostrarTodosResultados(termino, productos) {
    localStorage.setItem('resultadosBusquedaAnmago', JSON.stringify({
      termino: termino,
      productos: productos,
      timestamp: Date.now()
    }));
    
    window.location.href = `RESULTADOS-BUSQUEDA.HTML?q=${encodeURIComponent(termino)}`;
    ocultarSugerencias();
  }

  function ocultarSugerencias() {
    const sugerencias = document.getElementById("sugerencias");
    if (sugerencias) {
      sugerencias.classList.remove('show');
    }
  }

  function manejarBusqueda(texto) {
    clearTimeout(timeoutBusqueda);
    
    timeoutBusqueda = setTimeout(() => {
      const coincidencias = buscarProductos(texto);
      mostrarSugerencias(coincidencias, texto);
    }, CONFIG.debounceTime);
  }

  async function inicializarBuscador() {
    const buscador = document.getElementById("buscador");
    const sugerencias = document.getElementById("sugerencias");

    if (!buscador) {
      console.error('❌ Buscador no encontrado en el DOM');
      return;
    }

    if (!sugerencias) {
      console.error('❌ Contenedor de sugerencias no encontrado');
      return;
    }

    console.log('🚀 Inicializando buscador...');

    // CARGAR CATÁLOGO
    await cargarCatalogo();
    
    if (!catalogoCargado) {
      console.error('❌ No se pudo cargar el catálogo');
      buscador.placeholder = 'Error cargando productos...';
      return;
    }

    // EVENTOS
    buscador.addEventListener('input', function() {
      console.log('📝 Input:', this.value);
      manejarBusqueda(this.value);
    });

    buscador.addEventListener('focus', function() {
      console.log('🎯 Foco en buscador');
      if (this.value.length >= CONFIG.minCaracteres) {
        const coincidencias = buscarProductos(this.value);
        mostrarSugerencias(coincidencias, this.value);
      }
    });

    buscador.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && this.value.trim().length >= CONFIG.minCaracteres) {
        e.preventDefault();
        console.log('↵ Enter presionado');
        mostrarTodosResultados(this.value.trim(), buscarProductos(this.value.trim()));
      }
    });

    // Clic fuera - ocultar
    document.addEventListener('click', function(e) {
      if (!buscador.contains(e.target) && !sugerencias.contains(e.target)) {
        ocultarSugerencias();
      }
    });

    // Escape - ocultar
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        ocultarSugerencias();
        buscador.blur();
      }
    });

    // Restaurar búsqueda anterior
    try {
      const busquedaAnterior = localStorage.getItem('ultimaBusquedaAnmago');
      if (busquedaAnterior) {
        const { termino } = JSON.parse(busquedaAnterior);
        buscador.value = termino;
      }
    } catch (error) {
      console.warn('Error restaurando búsqueda:', error);
    }

    console.log('✅ Buscador inicializado correctamente');
  }

  // INICIALIZAR
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarBuscador);
  } else {
    setTimeout(inicializarBuscador, 1000);
  }

})();

// buscador.js - Versión optimizada para header
(function() {
  'use strict';
  
  // 🔥 CONFIGURACIÓN
  const CONFIG = {
    minCaracteres: 2,
    maxSugerencias: 8,
    debounceTime: 300
  };

  // 🔥 VARIABLES GLOBALES
  let timeoutBusqueda = null;
  let catalogoCargado = false;

  // 🔥 CARGAR CATÁLOGO SI NO EXISTE
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
      console.log('✅ Catálogo cargado para buscador:', window.catalogoGlobal.length, 'productos');
      return window.catalogoGlobal;
    } catch (error) {
      console.error('❌ Error cargando catálogo para buscador:', error);
      return [];
    }
  }

  // 🔥 BUSCAR PRODUCTOS
  function buscarProductos(texto) {
    if (!catalogoCargado || !window.catalogoGlobal) return [];
    
    const textoLimpio = texto.toLowerCase().trim();
    if (textoLimpio.length < CONFIG.minCaracteres) return [];

    return window.catalogoGlobal.filter(producto => {
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
  }

  // 🔥 MOSTRAR SUGERENCIAS
  function mostrarSugerencias(coincidencias, textoBusqueda) {
    const sugerencias = document.getElementById("sugerencias");
    if (!sugerencias) return;

    sugerencias.innerHTML = '';

    if (coincidencias.length === 0) {
      const item = document.createElement('div');
      item.className = 'dropdown-item text-muted';
      item.textContent = `No hay resultados para "${textoBusqueda}"`;
      sugerencias.appendChild(item);
      sugerencias.classList.add('show');
      return;
    }

    // Limitar sugerencias
    const sugerenciasMostrar = coincidencias.slice(0, CONFIG.maxSugerencias);
    
    sugerenciasMostrar.forEach(producto => {
      const item = document.createElement('a');
      item.className = 'dropdown-item d-flex align-items-center gap-2 py-2';
      item.href = `PRODUCTO.HTML?id=${producto.id}`;
      item.innerHTML = `
        <img src="${producto.imagen}" 
             alt="${producto.producto}" 
             style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; background: #f8f9fa;">
        <div class="flex-grow-1">
          <div class="fw-bold small text-dark">${producto.producto}</div>
          <div class="extra-small text-muted">
            ${producto.tipo} › ${producto.subtipo} › ${producto.categoria}
          </div>
          <div class="extra-small text-primary fw-bold">
            $${Number(producto.precio).toLocaleString('es-CO')}
          </div>
        </div>
      `;
      
      // Prevenir navegación inmediata para mejor UX
      item.addEventListener('click', (e) => {
        e.preventDefault();
        irADetalleDesdeBusqueda(producto);
      });
      
      sugerencias.appendChild(item);
    });

    // Opción para ver todos los resultados
    if (coincidencias.length > CONFIG.maxSugerencias) {
      const verTodos = document.createElement('a');
      verTodos.className = 'dropdown-item text-center border-top py-2 bg-light';
      verTodos.href = '#';
      verTodos.innerHTML = `
        <span class="text-primary fw-bold">
          Ver todos los ${coincidencias.length} resultados ›
        </span>
      `;
      verTodos.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarTodosResultados(textoBusqueda, coincidencias);
      });
      sugerencias.appendChild(verTodos);
    }

    sugerencias.classList.add('show');
  }

  // 🔥 IR A DETALLE DESDE BÚSQUEDA
  function irADetalleDesdeBusqueda(producto) {
    // Guardar estado de búsqueda
    const estadoBusqueda = {
      termino: document.getElementById('buscador').value,
      timestamp: Date.now()
    };
    localStorage.setItem('ultimaBusquedaAnmago', JSON.stringify(estadoBusqueda));
    
    // Navegar al producto
    window.location.href = `PRODUCTO.HTML?id=${producto.id}&origen=busqueda`;
    
    // Cerrar sugerencias
    ocultarSugerencias();
  }

  // 🔥 MOSTRAR TODOS LOS RESULTADOS
  function mostrarTodosResultados(termino, productos) {
    // Guardar resultados para la vista de búsqueda
    localStorage.setItem('resultadosBusquedaAnmago', JSON.stringify({
      termino: termino,
      productos: productos,
      timestamp: Date.now()
    }));
    
    // Navegar a vista de resultados
    window.location.href = `RESULTADOS-BUSQUEDA.HTML?q=${encodeURIComponent(termino)}`;
    
    ocultarSugerencias();
  }

  // 🔥 OCULTAR SUGERENCIAS
  function ocultarSugerencias() {
    const sugerencias = document.getElementById("sugerencias");
    if (sugerencias) {
      sugerencias.classList.remove('show');
    }
  }

  // 🔥 MANEJAR BÚSQUEDA CON DEBOUNCE
  function manejarBusqueda(texto) {
    clearTimeout(timeoutBusqueda);
    
    timeoutBusqueda = setTimeout(() => {
      const coincidencias = buscarProductos(texto);
      mostrarSugerencias(coincidencias, texto);
    }, CONFIG.debounceTime);
  }

  // 🔥 INICIALIZAR BUSCADOR
  async function inicializarBuscador() {
    const buscador = document.getElementById("buscador");
    const sugerencias = document.getElementById("sugerencias");

    if (!buscador || !sugerencias) {
      console.warn('⚠️ Elementos del buscador no encontrados');
      return;
    }

    // Cargar catálogo
    await cargarCatalogo();
    
    if (!catalogoCargado) {
      console.error('❌ No se pudo cargar el catálogo para el buscador');
      return;
    }

    // 🔥 EVENT LISTENERS

    // Input con debounce
    buscador.addEventListener('input', function() {
      manejarBusqueda(this.value);
    });

    // Focus - mostrar sugerencias si hay texto
    buscador.addEventListener('focus', function() {
      if (this.value.length >= CONFIG.minCaracteres) {
        const coincidencias = buscarProductos(this.value);
        mostrarSugerencias(coincidencias, this.value);
      }
    });

    // Enter - buscar directamente
    buscador.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && this.value.trim().length >= CONFIG.minCaracteres) {
        e.preventDefault();
        mostrarTodosResultados(this.value.trim(), buscarProductos(this.value.trim()));
      }
    });

    // Clic fuera - ocultar sugerencias
    document.addEventListener('click', function(e) {
      if (!buscador.contains(e.target) && !sugerencias.contains(e.target)) {
        ocultarSugerencias();
      }
    });

    // Escape - ocultar sugerencias
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        ocultarSugerencias();
        buscador.blur();
      }
    });

    // Restaurar búsqueda anterior si existe
    const busquedaAnterior = localStorage.getItem('ultimaBusquedaAnmago');
    if (busquedaAnterior) {
      try {
        const { termino } = JSON.parse(busquedaAnterior);
        buscador.value = termino;
      } catch (error) {
        console.warn('Error restaurando búsqueda anterior:', error);
      }
    }

    console.log('✅ Buscador inicializado correctamente');
  }

  // 🔥 INICIALIZACIÓN AUTOMÁTICA
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarBuscador);
  } else {
    inicializarBuscador();
  }

  // 🔥 EXPORTAR FUNCIONES PARA USO GLOBAL
  window.buscadorGlobal = {
    buscar: buscarProductos,
    mostrarSugerencias: mostrarSugerencias,
    ocultarSugerencias: ocultarSugerencias,
    reiniciar: function() {
      const buscador = document.getElementById("buscador");
      if (buscador) buscador.value = '';
      ocultarSugerencias();
    }
  };

})();

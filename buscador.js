// buscador-simple.js - Versión que SÍ funciona
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando buscador...');
    
    const buscador = document.getElementById('buscador');
    const sugerencias = document.getElementById('sugerencias');
    
    if (!buscador || !sugerencias) {
        console.log('❌ Buscador no encontrado en el DOM');
        return;
    }

    // Cambiar a contenedor personalizado
    sugerencias.className = 'sugerencias-container';
    
    let timeoutBusqueda = null;
    let catalogoCargado = false;

    // Cargar catálogo
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
            console.error('❌ Error cargando catálogo:', error);
            return [];
        }
    }

    // Buscar productos
    function buscarProductos(texto) {
        if (!catalogoCargado || !window.catalogoGlobal) {
            console.log('❌ Catálogo no disponible');
            return [];
        }
        
        const textoLimpio = texto.toLowerCase().trim();
        if (textoLimpio.length < 2) return [];

        return window.catalogoGlobal.filter(producto => {
            const campos = [
                producto.producto,
                producto.tipo,
                producto.subtipo,
                producto.categoria,
                producto.material
            ];

            return campos.some(campo => 
                campo && campo.toString().toLowerCase().includes(textoLimpio)
            );
        });
    }

    // Mostrar sugerencias
    function mostrarSugerencias(coincidencias, textoBusqueda) {
        sugerencias.innerHTML = '';

        if (coincidencias.length === 0) {
            const itemVacio = document.createElement('div');
            itemVacio.className = 'sugerencia-vacia';
            itemVacio.textContent = textoBusqueda ? `No hay resultados para "${textoBusqueda}"` : 'Escribe para buscar productos...';
            sugerencias.appendChild(itemVacio);
            sugerencias.classList.add('mostrar');
            return;
        }

        // Mostrar máximo 8 sugerencias
        const sugerenciasMostrar = coincidencias.slice(0, 8);
        
        sugerenciasMostrar.forEach(producto => {
            const item = document.createElement('div');
            item.className = 'sugerencia-item';
            item.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.producto}" 
                     onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                <div class="sugerencia-info">
                    <div class="sugerencia-nombre">${producto.producto}</div>
                    <div class="sugerencia-categoria">${producto.tipo} › ${producto.subtipo}</div>
                    <div class="sugerencia-precio">$${Number(producto.precio).toLocaleString('es-CO')}</div>
                </div>
            `;
            
            item.addEventListener('click', function() {
                window.location.href = `PRODUCTO.HTML?id=${producto.id}`;
            });
            
            sugerencias.appendChild(item);
        });

        sugerencias.classList.add('mostrar');
        console.log('✅ Mostrando', sugerenciasMostrar.length, 'sugerencias');
    }

    // Ocultar sugerencias
    function ocultarSugerencias() {
        sugerencias.classList.remove('mostrar');
    }

    // Manejar búsqueda con debounce
    function manejarBusqueda(texto) {
        clearTimeout(timeoutBusqueda);
        
        timeoutBusqueda = setTimeout(() => {
            const coincidencias = buscarProductos(texto);
            mostrarSugerencias(coincidencias, texto);
        }, 300);
    }

    // Inicializar eventos
    function inicializarEventos() {
        // Input con debounce
        buscador.addEventListener('input', function() {
            console.log('📝 Buscando:', this.value);
            manejarBusqueda(this.value);
        });

        // Focus - mostrar si hay texto
        buscador.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                const coincidencias = buscarProductos(this.value);
                mostrarSugerencias(coincidencias, this.value);
            }
        });

        // Enter - buscar
        buscador.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim().length >= 2) {
                e.preventDefault();
                const coincidencias = buscarProductos(this.value.trim());
                if (coincidencias.length > 0) {
                    window.location.href = `PRODUCTO.HTML?id=${coincidencias[0].id}`;
                }
            }
        });

        // Clic fuera - ocultar
        document.addEventListener('click', function(e) {
            if (!buscador.contains(e.target) && !sugerencias.contains(e.target)) {
                ocultarSugerencias();
            }
        });
    }

    // Inicializar
    async function inicializar() {
        await cargarCatalogo();
        inicializarEventos();
        console.log('✅ Buscador inicializado correctamente');
    }

    inicializar();
});

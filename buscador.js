// buscador.js - Versión optimizada para header
console.log('🔍 Iniciando buscador...');

function inicializarBuscador() {
    console.log('🔍 Buscando elementos del buscador...');
    
    const buscador = document.getElementById("buscador");
    const sugerencias = document.getElementById("sugerencias");
    
    console.log('Elementos encontrados:', { 
        buscador: !!buscador, 
        sugerencias: !!sugerencias 
    });
    
    if (!buscador || !sugerencias) {
        console.log('⏳ Elementos no encontrados, reintentando en 500ms...');
        setTimeout(inicializarBuscador, 500);
        return;
    }

    console.log('✅ Elementos del buscador encontrados - INICIANDO');

    // Variables
    let catalogo = [];
    let timeoutBusqueda = null;

    // Cargar catálogo
    async function cargarCatalogo() {
        try {
            console.log('📦 Cargando catálogo...');
            const response = await fetch('https://raw.githubusercontent.com/anmagoS/ANMAGOPWA/main/catalogo.json?v=' + Date.now());
            catalogo = await response.json();
            console.log('✅ Catálogo cargado:', catalogo.length, 'productos');
        } catch (error) {
            console.error('❌ Error cargando catálogo:', error);
        }
    }

    // Buscar productos
    function buscarProductos(texto) {
        if (!texto || texto.length < 2) {
            return [];
        }
        
        const textoBusqueda = texto.toLowerCase().trim();
        console.log('🔍 Buscando:', textoBusqueda);
        
        const resultados = catalogo.filter(producto => {
            const campos = [
                producto.producto,
                producto.tipo, 
                producto.subtipo,
                producto.categoria,
                producto.material,
                producto.descripcion
            ];

            return campos.some(campo => 
                campo && campo.toString().toLowerCase().includes(textoBusqueda)
            );
        });
        
        console.log('📦 Resultados encontrados:', resultados.length);
        return resultados;
    }

    // Mostrar sugerencias
    function mostrarSugerencias(productos, textoBusqueda) {
        sugerencias.innerHTML = '';
        
        if (productos.length === 0) {
            if (textoBusqueda.length >= 2) {
                const itemVacio = document.createElement('div');
                itemVacio.className = 'sugerencia-vacia';
                itemVacio.textContent = `No hay resultados para "${textoBusqueda}"`;
                sugerencias.appendChild(itemVacio);
            }
            sugerencias.classList.add('mostrar');
            return;
        }
        
        // Limitar a 8 sugerencias
        const productosMostrar = productos.slice(0, 8);
        
        productosMostrar.forEach(producto => {
            const item = document.createElement('div');
            item.className = 'sugerencia-item';
            item.innerHTML = `
                <img src="${producto.imagen || 'https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'}" 
                     alt="${producto.producto}"
                     onerror="this.src='https://ik.imagekit.io/mbsk9dati/placeholder-producto.jpg'">
                <div class="sugerencia-info">
                    <div class="sugerencia-nombre">${producto.producto}</div>
                    <div class="sugerencia-categoria">${producto.tipo} › ${producto.subtipo}</div>
                    <div class="sugerencia-precio">$${Number(producto.precio).toLocaleString('es-CO')}</div>
                </div>
            `;
            
            item.addEventListener('click', function() {
                console.log('🎯 Producto seleccionado:', producto.producto);
                window.location.href = `PRODUCTO.HTML?id=${producto.id}`;
                ocultarSugerencias();
            });
            
            sugerencias.appendChild(item);
        });

        sugerencias.classList.add('mostrar');
        console.log('✅ Mostrando', productosMostrar.length, 'sugerencias');
    }

    // Ocultar sugerencias
    function ocultarSugerencias() {
        sugerencias.classList.remove('mostrar');
    }

    // Búsqueda con debounce
    function ejecutarBusqueda(texto) {
        clearTimeout(timeoutBusqueda);
        
        timeoutBusqueda = setTimeout(() => {
            const resultados = buscarProductos(texto);
            mostrarSugerencias(resultados, texto);
        }, 300);
    }

    // Configurar eventos
    function configurarEventos() {
        // Evento de input
        buscador.addEventListener('input', function() {
            ejecutarBusqueda(this.value);
        });

        // Evento de focus
        buscador.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                const resultados = buscarProductos(this.value);
                mostrarSugerencias(resultados, this.value);
            }
        });

        // Evento de tecla Enter
        buscador.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim().length >= 2) {
                e.preventDefault();
                const resultados = buscarProductos(this.value);
                if (resultados.length > 0) {
                    window.location.href = `PRODUCTO.HTML?id=${resultados[0].id}`;
                }
            }
        });

        // Ocultar sugerencias al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!buscador.contains(e.target) && !sugerencias.contains(e.target)) {
                ocultarSugerencias();
            }
        });

        // Ocultar con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                ocultarSugerencias();
                buscador.blur();
            }
        });

        console.log('✅ Eventos del buscador configurados');
    }

    // Inicializar
    async function iniciar() {
        await cargarCatalogo();
        configurarEventos();
        console.log('✅ Buscador completamente inicializado');
    }

    // Iniciar todo
    iniciar();
}

// Esperar a que el DOM esté listo y el header se cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM cargado, esperando header...');
        setTimeout(inicializarBuscador, 1000);
    });
} else {
    console.log('📄 DOM ya listo, esperando header...');
    setTimeout(inicializarBuscador, 1000);
}

// Reintentar si falla la primera vez
setTimeout(inicializarBuscador, 3000);

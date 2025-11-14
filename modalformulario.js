// modalformulario.js - VERSIÓN COMPLETA Y FUNCIONAL

// ✅ FUNCIÓN DEBOUSE FALTANTE
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Formulario cargado en GitHub Pages');
    
    // Inicializar variables globales
    window.articulosCarrito = window.articulosCarrito || [];
    window.clienteEncontrado = false;
    
    // Configurar formulario
    inicializarFormulario();
});

function inicializarFormulario() {
    const form = document.getElementById('formCliente');
    if (!form) {
        console.error('❌ No se encontró el formulario con ID formCliente');
        return;
    }

    console.log('✅ Formulario encontrado, configurando...');

    // 🔒 INICIALMENTE: Solo teléfono habilitado
    const otrosCampos = document.querySelectorAll('#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select');
    otrosCampos.forEach(campo => {
        campo.disabled = true;
        campo.style.opacity = '0.6';
    });

    // 📱 EVENTO PARA TELÉFONO - Búsqueda automática
    const telefonoInput = document.getElementById('telefonoCliente');
    if (telefonoInput) {
       telefonoInput.addEventListener('input', debounce(async function(event) {
    const telefono = event.target.value.trim();
            
            console.log('📞 Teléfono ingresado:', telefono);
            
            if (!/^3\d{9}$/.test(telefono)) {
                console.log('❌ Teléfono no válido');
                mantenerCamposDeshabilitados();
                return;
            }

            console.log('🔍 Buscando cliente con teléfono:', telefono);
            
            try {
                const url = `https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec?telefonoCliente=${telefono}`;
                
                console.log('🌐 Consultando API...');
                
                const response = await fetch(url);
                const data = await response.json();
                
                console.log('📦 Respuesta API:', data);

                if (data && data.existe && data.datos) {
                    console.log('✅ Cliente encontrado, prellenando...');
                    window.clienteEncontrado = true;
                    prellenarFormulario(data.datos);
                    habilitarTodosLosCampos();
                } else {
                    console.log('❌ Cliente no encontrado, habilitando para registro nuevo');
                    window.clienteEncontrado = false;
                    limpiarFormulario();
                    habilitarTodosLosCampos();
                }
                
                validarFormularioCompleto();
                
            } catch (error) {
                console.error('❌ Error en búsqueda:', error);
                habilitarTodosLosCampos();
            }
        }, 800));
    }

    // 📝 VALIDACIÓN EN TIEMPO REAL
    const camposValidar = ['nombreCliente', 'telefonoCliente', 'DireccionCompleta', 'ciudadCliente'];
    camposValidar.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.addEventListener('input', validarFormularioCompleto);
        }
    });

    // 🚀 EVENTO DE ENVÍO
    const btnEnviar = document.getElementById('btnEnviarPedido');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!validarFormularioCompleto()) {
                alert('❌ Por favor completa todos los campos requeridos');
                return;
            }

            // Construir dirección completa
            const direccionFinal = construirDireccionCompleta();
            document.getElementById('DireccionCompleta').value = direccionFinal;

            // Enviar formulario a Google Sheets
            enviarFormularioGoogleSheets();
            
            // Enviar WhatsApp
            enviarWhatsAppPedido();
            
            // Cerrar ventana
            cerrarFormulario();
        });
    }

    console.log('🎯 Formulario inicializado correctamente');
}

// ✅ FUNCIONES FALTANTES
function validarFormularioCompleto() {
    const camposRequeridos = [
        'nombreCliente', 
        'telefonoCliente', 
        'DireccionCompleta', 
        'ciudadCliente'
    ];

    const todosLlenos = camposRequeridos.every(id => {
        const campo = document.getElementById(id);
        return campo && campo.value.trim() !== '';
    });

    const telefonoValido = /^3\d{9}$/.test(document.getElementById('telefonoCliente')?.value.trim());

    const btnEnviar = document.getElementById('btnEnviarPedido');
    if (btnEnviar) {
        btnEnviar.disabled = !(todosLlenos && telefonoValido);
    }

    console.log('🔍 Validación:', { todosLlenos, telefonoValido, habilitado: !btnEnviar?.disabled });

    return todosLlenos && telefonoValido;
}

function habilitarTodosLosCampos() {
    const todosLosCampos = document.querySelectorAll('#formCliente input, #formCliente textarea, #formCliente select');
    todosLosCampos.forEach(campo => {
        campo.disabled = false;
        campo.style.opacity = '1';
    });
}

function mantenerCamposDeshabilitados() {
    const otrosCampos = document.querySelectorAll('#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select');
    otrosCampos.forEach(campo => {
        campo.disabled = true;
        campo.style.opacity = '0.6';
    });
}

function limpiarFormulario() {
    const camposLimpiar = [
        'clienteId', 'nombreCliente', 'ciudadCliente', 'emailCliente',
        'tipoUnidad', 'numeroApto', 'barrio', 'observacionDireccion'
    ];
    
    camposLimpiar.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) campo.value = '';
    });
}

function prellenarFormulario(datos) {
    console.log('📝 Prellenando formulario con:', datos);
    
    // Mapear campos del formulario con los datos de la API
    const mapeoCampos = {
        'clienteId': datos['CLIENTEID'] || '',
        'telefonoCliente': datos['TELEFONOCLIENTE'] || '',
        'nombreCliente': datos['NOMBRECLIENTE'] || '',
        'ciudadCliente': datos['CIUDAD DESTINO'] || '',
        'emailCliente': datos['CORREO'] || '',
        'DireccionCompleta': datos['DIRECCIONCLIENTE'] || ''
    };

    // Llenar campos básicos
    Object.keys(mapeoCampos).forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = mapeoCampos[id];
            console.log(`✅ Campo ${id} prellenado:`, mapeoCampos[id]);
        }
    });

    // Procesar dirección si existe
    if (datos['DIRECCIONCLIENTE']) {
        procesarDireccion(datos['DIRECCIONCLIENTE']);
    }
}

function procesarDireccion(direccionConcatenada) {
    console.log('🏠 Procesando dirección:', direccionConcatenada);
    
    if (!direccionConcatenada) return;

    const partes = direccionConcatenada.split(',').map(p => p.trim()).filter(p => p);
    
    // Dirección base (siempre primera parte)
    const direccionBase = document.getElementById('DireccionCompleta');
    if (direccionBase && partes[0]) {
        direccionBase.value = partes[0];
    }

    // Tipo y número (segunda parte)
    if (partes.length > 1) {
        const segundaParte = partes[1];
        const tipos = ['APARTAMENTO', 'CASA', 'PISO', 'BODEGA', 'INTERIOR'];
        
        const tipoEncontrado = tipos.find(t => segundaParte.toUpperCase().includes(t));
        if (tipoEncontrado) {
            const tipoInput = document.getElementById('tipoUnidad');
            if (tipoInput) {
                tipoInput.value = tipoEncontrado.charAt(0) + tipoEncontrado.slice(1).toLowerCase();
                console.log('✅ Tipo unidad prellenado:', tipoInput.value);
            }
            
            // Extraer número
            const numeroMatch = segundaParte.replace(new RegExp(tipoEncontrado, 'i'), '').trim();
            const numeroInput = document.getElementById('numeroApto');
            if (numeroInput && numeroMatch) {
                numeroInput.value = numeroMatch;
                console.log('✅ Número apto prellenado:', numeroInput.value);
            }
        }
    }

    // Barrio (tercera parte)
    if (partes.length > 2) {
        const barrioInput = document.getElementById('barrio');
        if (barrioInput) {
            barrioInput.value = partes[2].replace(/^barrio\s*/i, '').trim();
            console.log('✅ Barrio prellenado:', barrioInput.value);
        }
    }

    // Referencia (cuarta parte)
    if (partes.length > 3) {
        const refInput = document.getElementById('observacionDireccion');
        if (refInput) {
            refInput.value = partes[3];
            console.log('✅ Referencia prellenada:', refInput.value);
        }
    }
}

function construirDireccionCompleta() {
    const base = document.getElementById('DireccionCompleta')?.value.trim() || '';
    const tipo = document.getElementById('tipoUnidad')?.value.trim() || '';
    const numero = document.getElementById('numeroApto')?.value.trim() || '';
    const barrio = document.getElementById('barrio')?.value.trim() || '';
    const referencia = document.getElementById('observacionDireccion')?.value.trim() || '';

    let direccion = base;
    if (tipo) direccion += `, ${tipo}`;
    if (numero) direccion += ` ${numero}`;
    if (barrio) direccion += `, Barrio ${barrio}`;
    if (referencia) direccion += `, ${referencia}`;

    return direccion;
}

function enviarFormularioGoogleSheets() {
    const formData = new FormData();
    
    // Agregar todos los campos del formulario
    const campos = [
        'clienteId', 'telefonoCliente', 'nombreCliente', 'DireccionCompleta',
        'tipoUnidad', 'numeroApto', 'barrio', 'observacionDireccion',
        'ciudadCliente', 'emailCliente'
    ];
    
    campos.forEach(campo => {
        const valor = document.getElementById(campo)?.value || '';
        formData.append(campo, valor);
    });

    // Agregar campos fijos que tu Apps Script espera
    formData.append('ciudadDestino', document.getElementById('ciudadCliente')?.value || '');
    formData.append('direccionCliente', document.getElementById('DireccionCompleta')?.value || '');
    formData.append('usuario', 'ANMAGOSTORE@GMAIL.COM');
    
    const url = 'https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec';
    
    // Enviar en segundo plano
    fetch(url, {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
        console.log('✅ Respuesta de Google Sheets:', data);
        if (data.error) {
            console.error('❌ Error de Google Sheets:', data.error);
        }
    }).catch(error => {
        console.error('❌ Error enviando a Google Sheets:', error);
    });
}

function enviarWhatsAppPedido() {
    const nombre = document.getElementById('nombreCliente')?.value.trim() || 'Cliente';
    const telefono = document.getElementById('telefonoCliente')?.value.trim() || '';
    
    let mensaje = '';

    if (window.articulosCarrito && window.articulosCarrito.length > 0) {
        // 🛒 PEDIDO CON PRODUCTOS
        mensaje = `🛍️ ¡Hola! Soy ${nombre.toUpperCase()} (${telefono}) y quiero realizar este pedido:\n\n`;
        
        let total = 0;
        window.articulosCarrito.forEach((producto, index) => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;
            
            mensaje += `${index + 1}. ${producto.nombre}\n`;
            mensaje += `📏 Talla: ${producto.talla || 'N/A'}\n`;
            mensaje += `💰 Precio: $${producto.precio?.toLocaleString()}\n`;
            mensaje += `🔢 Cantidad: ${producto.cantidad}\n`;
            mensaje += `🧮 Subtotal: $${subtotal.toLocaleString()}\n\n`;
        });
        
        mensaje += `🧾 TOTAL: $${total.toLocaleString()}\n\n`;
        mensaje += `📍 Dirección: ${construirDireccionCompleta()}\n`;
        mensaje += `✅ ¡Gracias!`;
    } else {
        // 👤 SOLO REGISTRO
        mensaje = `👋 ¡Hola! Soy ${nombre.toUpperCase()} (${telefono}) y quiero registrarme como cliente.\n\n`;
        mensaje += `📍 Dirección: ${construirDireccionCompleta()}\n`;
        mensaje += `🏙️ Ciudad: ${document.getElementById('ciudadCliente')?.value || ''}\n`;
        mensaje += `📧 Email: ${document.getElementById('emailCliente')?.value || ''}\n\n`;
        mensaje += `✅ ¡Gracias por registrarme!`;
    }

    const urlWhatsApp = `https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}

function cerrarFormulario() {
    // Limpiar carrito
    if (window.articulosCarrito && window.articulosCarrito.length > 0) {
        window.articulosCarrito = [];
        localStorage.removeItem('carritoAnmago');
    }

    // Cerrar ventana/modal
    if (window.opener) {
        window.close();
    } else {
        const modal = document.getElementById('modalFormularioCliente');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        }
    }
}

// 🆘 DIAGNÓSTICO
window.diagnosticoFormulario = function() {
    console.log('🩺 DIAGNÓSTICO FORMULARIO:');
    console.log('- Formulario encontrado:', !!document.getElementById('formCliente'));
    console.log('- Teléfono encontrado:', !!document.getElementById('telefonoCliente'));
    console.log('- Carrito:', window.articulosCarrito);
    console.log('- Cliente encontrado:', window.clienteEncontrado);
    validarFormularioCompleto();
};

// formulario.js - Archivo completo corregido
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Formulario.js cargado - Versión corregida');
    
    // Inicializar la detección de ubicación
    window.ubicacionActual = detectarUbicacion();
    console.log('📍 Ubicación detectada:', window.ubicacionActual);
    
    // Configurar el evento del formulario
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Formulario enviado desde:', window.ubicacionActual);
            
            if (validarFormulario()) {
                enviarWhatsapp();
            }
        });
    }
    
    // Agregar validación en tiempo real
    const inputs = document.querySelectorAll('#registroForm input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validarCampo);
        input.addEventListener('input', limpiarError);
    });
});

function detectarUbicacion() {
    const url = window.location.href;
    const path = window.location.pathname;
    
    // Detectar por URL
    if (url.includes('carrito') || url.includes('checkout') || path.includes('carrito')) {
        return 'carrito';
    }
    
    // Detectar por elementos en la página
    if (document.querySelector('.carrito-container') || 
        document.querySelector('#carrito') ||
        document.querySelector('.producto-carrito')) {
        return 'carrito';
    }
    
    // Detectar por presencia de productos en el carrito
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length > 0 && document.querySelector('#registroForm')) {
        return 'carrito';
    }
    
    return 'registro';
}

function validarCampo(e) {
    const campo = e.target;
    const valor = campo.value.trim();
    
    if (campo.hasAttribute('required') && !valor) {
        mostrarError(campo, 'Este campo es obligatorio');
        return false;
    }
    
    if (campo.type === 'email' && valor) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) {
            mostrarError(campo, 'Por favor ingresa un email válido');
            return false;
        }
    }
    
    if (campo.type === 'tel' && valor) {
        const telefonoRegex = /^[0-9+\-\s()]{10,}$/;
        if (!telefonoRegex.test(valor)) {
            mostrarError(campo, 'Por favor ingresa un teléfono válido');
            return false;
        }
    }
    
    limpiarError(campo);
    return true;
}

function mostrarError(campo, mensaje) {
    limpiarError(campo);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-mensaje';
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.textContent = mensaje;
    
    campo.parentNode.appendChild(errorDiv);
    campo.style.borderColor = 'red';
}

function limpiarError(campo) {
    const errorExistente = campo.parentNode.querySelector('.error-mensaje');
    if (errorExistente) {
        errorExistente.remove();
    }
    campo.style.borderColor = '';
}

function validarFormulario() {
    console.log('🔍 Validando formulario...');
    
    const camposRequeridos = document.querySelectorAll('#registroForm input[required]');
    let valido = true;
    
    camposRequeridos.forEach(campo => {
        const evento = new Event('blur', { bubbles: true });
        campo.dispatchEvent(evento);
        
        const error = campo.parentNode.querySelector('.error-mensaje');
        if (error) {
            valido = false;
        }
    });
    
    if (!valido) {
        alert('Por favor completa todos los campos requeridos correctamente.');
    }
    
    return valido;
}

function enviarWhatsapp() {
    console.log('📤 Enviando WhatsApp...');
    
    const telefono = '573126363394';
    
    // Re-detectar ubicación por si cambió
    window.ubicacionActual = detectarUbicacion();
    console.log('📍 Ubicación final:', window.ubicacionActual);
    
    let mensaje = '';

    if (window.ubicacionActual === 'carrito') {
        // 🛍️ MENSAJE PARA PEDIDOS DESDE CARRITO
        console.log('🛍️ Generando mensaje de PEDIDO');
        mensaje = generarMensajePedido();
    } else {
        // 👤 MENSAJE PARA REGISTRO DE CLIENTE
        console.log('👤 Generando mensaje de REGISTRO');
        mensaje = generarMensajeRegistro();
    }
    
    console.log('💬 Mensaje generado:', mensaje);

    const urlWhatsapp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    console.log('🔗 URL WhatsApp:', urlWhatsapp);
    
    window.open(urlWhatsapp, '_blank');
    
    // Opcional: Limpiar carrito después de enviar pedido
    if (window.ubicacionActual === 'carrito') {
        setTimeout(() => {
            localStorage.removeItem('carrito');
            console.log('🛒 Carrito limpiado después del pedido');
        }, 1000);
    }
}

function generarMensajeRegistro() {
    const nombre = document.getElementById('nombre')?.value || 'No especificado';
    const email = document.getElementById('email')?.value || 'No especificado';
    const telefono = document.getElementById('telefono')?.value || 'No especificado';
    
    return `¡Hola! Soy ${nombre.toUpperCase()} y quiero registrarme como cliente.\n\n📧 Email: ${email}\n📞 Teléfono: ${telefono}\n\n¡Gracias por tu atención!`;
}

function generarMensajePedido() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const nombre = document.getElementById('nombre')?.value || 
                   document.querySelector('input[name="nombre"]')?.value || 
                   'No especificado';
    
    let mensaje = `🛍️ ¡Hola! Soy ${nombre.toUpperCase()} y quiero realizar el siguiente pedido:\n\n`;
    
    let total = 0;
    
    if (carrito.length === 0) {
        return `🛍️ ¡Hola! Soy ${nombre.toUpperCase()} y quiero realizar un pedido.\n\n(Mi carrito está vacío)`;
    }
    
    carrito.forEach((producto, index) => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;
        
        mensaje += `${index + 1}. ${producto.nombre}\n`;
        mensaje += `🖼️ Imagen: ${producto.imagen}\n`;
        mensaje += `📏 Talla: ${producto.talla || 'N/A'}\n`;
        mensaje += `💲 Precio: $${producto.precio.toLocaleString()}\n`;
        mensaje += `🔢 Cantidad: ${producto.cantidad}\n`;
        mensaje += `💰 Subtotal: $${subtotal.toLocaleString()}\n\n`;
    });
    
    mensaje += `🧾 TOTAL DEL PEDIDO: $${total.toLocaleString()}\n\n`;
    mensaje += `✅ ¡Gracias por tu atención!`;
    
    return mensaje;
}

// Debug helper
window.mostrarInfoFormulario = function() {
    console.log('🔍 DEBUG Formulario:');
    console.log('- Ubicación:', window.ubicacionActual);
    console.log('- Carrito:', JSON.parse(localStorage.getItem('carrito')) || []);
    console.log('- Formulario encontrado:', !!document.getElementById('registroForm'));
};

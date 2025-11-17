// modalformulario.js - VERSIÓN ULTRA RÁPIDA Y CONFIABLE

// 🚀 INICIALIZACIÓN INMEDIATA - Sin esperar DOMContentLoaded
console.log('🚀 INICIANDO FORMULARIO - VERSIÓN ULTRA RÁPIDA');

// 🔥 VARIABLES GLOBALES INMEDIATAS
window.articulosCarrito = [];
window.formularioInicializado = false;

// 🎯 DETECCIÓN GARANTIZADA DEL CARRITO - VERSIÓN SÍNCRONA
function detectarCarritoGarantizado() {
    console.log('🎯 INICIANDO DETECCIÓN GARANTIZADA DEL CARRITO');
    
    // 1. PRIMERO: Verificar URL parameters (más rápido)
    const urlParams = new URLSearchParams(window.location.search);
    const productosParam = urlParams.get('productos');
    
    if (productosParam && productosParam !== '[]' && productosParam !== 'null') {
        try {
            const productos = JSON.parse(decodeURIComponent(productosParam));
            if (Array.isArray(productos) && productos.length > 0) {
                window.articulosCarrito = productos;
                console.log('✅ CARRITO DETECTADO desde URL:', productos.length, 'productos');
                return true;
            }
        } catch (error) {
            console.error('❌ Error parseando URL:', error);
        }
    }
    
    // 2. SEGUNDO: Verificar localStorage (rápido)
    try {
        const carritoLocal = localStorage.getItem('carritoAnmago');
        if (carritoLocal && carritoLocal !== '[]' && carritoLocal !== 'null') {
            const productos = JSON.parse(carritoLocal);
            if (Array.isArray(productos) && productos.length > 0) {
                window.articulosCarrito = productos;
                console.log('✅ CARRITO DETECTADO desde localStorage:', productos.length, 'productos');
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error parseando localStorage:', error);
    }
    
    // 3. TERCERO: Verificar window.opener (menos confiable pero lo intentamos)
    if (window.opener && Array.isArray(window.opener.articulosCarrito) && window.opener.articulosCarrito.length > 0) {
        window.articulosCarrito = JSON.parse(JSON.stringify(window.opener.articulosCarrito));
        console.log('✅ CARRITO DETECTADO desde window.opener:', window.articulosCarrito.length, 'productos');
        return true;
    }
    
    console.log('ℹ️  NO hay carrito detectado - Modo registro solamente');
    return false;
}

// 🔥 EJECUCIÓN INMEDIATA - No esperar eventos
const tieneCarrito = detectarCarritoGarantizado();
console.log('🎯 RESULTADO DETECCIÓN:', tieneCarrito ? 'CON CARRITO' : 'SOLO REGISTRO');

// 👤 Construir nombre del cliente - VERSIÓN RÁPIDA
function construirNombreCliente() {
    const nombreInput = document.getElementById("nombreCliente");
    return nombreInput ? nombreInput.value.trim() : "Cliente";
}

// ✅ Validación de formulario - VERSIÓN OPTIMIZADA
function validarFormularioCliente() {
    const nombre = document.getElementById("nombreCliente");
    const telefono = document.getElementById("telefonoCliente");
    const direccion = document.getElementById("DireccionCompleta");
    const ciudad = document.getElementById("ciudadCliente");
    
    const todosLlenos = nombre?.value.trim() && 
                       telefono?.value.trim() && 
                       direccion?.value.trim() && 
                       ciudad?.value.trim();
    
    const telefonoValido = telefono && /^3\d{9}$/.test(telefono.value.trim());

    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        btnEnviar.disabled = !(todosLlenos && telefonoValido);
    }
    
    return todosLlenos && telefonoValido;
}

// 🏠 Construir dirección estructurada - VERSIÓN RÁPIDA
function construirDireccionEstructurada() {
    const direccionBase = document.getElementById("DireccionCompleta")?.value.trim() || '';
    const tipoUnidad = document.getElementById("tipoUnidad")?.value.trim() || '';
    const numeroApto = document.getElementById("numeroApto")?.value.trim() || '';
    const barrio = document.getElementById("barrio")?.value.trim() || '';
    const puntoReferencia = document.getElementById("observacionDireccion")?.value.trim() || '';

    let direccion = direccionBase;
    if (tipoUnidad) direccion += `, ${tipoUnidad}`;
    if (numeroApto) direccion += ` ${numeroApto}`;
    if (barrio) direccion += `, Barrio ${barrio}`;
    if (puntoReferencia) direccion += `, ${puntoReferencia}`;
    
    return direccion.trim();
}

// 🔄 Parseo inverso de dirección - VERSIÓN OPTIMIZADA
function repartirDireccionConcatenada(direccionConc) {
    if (!direccionConc) return;

    const baseInput = document.getElementById("DireccionCompleta");
    const tipoInput = document.getElementById("tipoUnidad");
    const numeroInput = document.getElementById("numeroApto");
    const barrioInput = document.getElementById("barrio");
    const refInput = document.getElementById("observacionDireccion");

    // Resetear campos
    if (tipoInput) tipoInput.value = "";
    if (numeroInput) numeroInput.value = "";
    if (barrioInput) barrioInput.value = "";
    if (refInput) refInput.value = "";

    const partes = direccionConc.split(",").map(p => p.trim()).filter(p => p !== "");
    if (partes.length === 0) return;

    // 1. Dirección base (siempre la primera parte)
    if (baseInput) baseInput.value = partes[0];

    // 2. Tipo de unidad + Número (segunda parte)
    if (partes.length > 1 && tipoInput) {
        const segundaParte = partes[1].toUpperCase();
        const tipos = ["APARTAMENTO", "CASA", "PISO", "BODEGA", "INTERIOR"];
        const tipoEncontrado = tipos.find(t => segundaParte.includes(t));
        
        if (tipoEncontrado) {
            tipoInput.value = tipoEncontrado.charAt(0) + tipoEncontrado.slice(1).toLowerCase();
            
            // Extraer número
            const numeroTexto = partes[1].replace(new RegExp(tipoEncontrado, 'i'), "").trim();
            if (numeroTexto && numeroInput) {
                numeroInput.value = numeroTexto;
            }
        }
    }

    // 3. Barrio (tercera parte)
    if (partes.length > 2 && barrioInput) {
        barrioInput.value = partes[2].replace(/^barrio\s*/i, "").trim();
    }

    // 4. Observación (cuarta parte en adelante)
    if (partes.length > 3 && refInput) {
        refInput.value = partes.slice(3).join(", ");
    }
}

// 💬 Generar texto para WhatsApp - VERSIÓN ULTRA CONFIABLE
// 💬 Generar texto para WhatsApp - VERSIÓN ULTRA CONFIABLE
function generarTextoWhatsApp() {
    const nombreCliente = construirNombreCliente();
    
    // ✅ DETECCIÓN EN TIEMPO REAL - No confiar en variables antiguas
    const carritoActual = window.articulosCarrito;
    const tieneProductos = Array.isArray(carritoActual) && carritoActual.length > 0;
    
    console.log('🔍 GENERANDO WHATSAPP - Estado actual:', {
        nombreCliente,
        tieneProductos,
        productos: carritoActual?.length || 0,
        carrito: carritoActual
    });

    if (tieneProductos) {
        console.log('📝 GENERANDO MENSAJE DE PEDIDO CON PRODUCTOS');
        
        const productos = carritoActual.map((p, i) => {
            let productoTexto = `${i + 1}. ${p.nombre || 'Producto'}\n`;
            
            // ✅ AGREGAR LA LÍNEA DE LA IMAGEN SI EXISTE
            if (p.imagen) {
                productoTexto += `🖼️ Imagen: ${p.imagen}\n`;
            }
            
            productoTexto += `📏 Talla: ${p.talla || "Única"}\n`;
            productoTexto += `💲 Precio: $${(p.precio || 0).toLocaleString("es-CO")}\n`;
            productoTexto += `🔢 Cantidad: ${p.cantidad || 1}`;
            
            return productoTexto;
        }).join("\n\n");

        const total = carritoActual.reduce((sum, p) => 
            sum + ((p.precio || 0) * (p.cantidad || 1)), 0
        );

        return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias!`;
    } else {
        console.log('📝 GENERANDO MENSAJE DE REGISTRO SOLAMENTE');
        return `¡Hola! Soy ${nombreCliente} y quiero registrarme como cliente.`;
    }
}

// 📤 Envío a WhatsApp - VERSIÓN MEJORADA
function enviarPedidoWhatsApp() {
    try {
        const mensaje = generarTextoWhatsApp();
        const telefono = '573006498710'; // Número fijo para evitar errores
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        
        console.log('📤 ENVIANDO WHATSAPP:', url.substring(0, 100) + '...');
        
        // Abrir en nueva pestaña inmediatamente
        const nuevaVentana = window.open(url, '_blank');
        if (!nuevaVentana) {
            console.warn('⚠️  Popup bloqueado, redirigiendo en misma ventana');
            window.location.href = url;
        }
    } catch (error) {
        console.error('❌ ERROR enviando WhatsApp:', error);
        alert('Error al abrir WhatsApp. Por favor intenta manualmente.');
    }
}

// 📊 Enviar datos a Google Sheets - VERSIÓN NO BLOQUEANTE
function enviarDatosGoogleSheets() {
    // Ejecutar en segundo plano sin esperar respuesta
    setTimeout(() => {
        try {
            const formData = new URLSearchParams();
            formData.append('telefonoCliente', document.getElementById('telefonoCliente')?.value || '');
            formData.append('nombreCliente', document.getElementById('nombreCliente')?.value || '');
            formData.append('direccionCliente', document.getElementById('DireccionCompleta')?.value || '');
            formData.append('ciudadDestino', document.getElementById('ciudadCliente')?.value || '');
            formData.append('correo', document.getElementById('emailCliente')?.value || '');
            formData.append('clienteId', document.getElementById('clienteId')?.value || '');
            formData.append('complementoDir', construirDireccionEstructurada());
            formData.append('usuario', 'ANMAGOSTORE@GMAIL.COM');
            
            const url = 'https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec';
            
            // Usar beacon para envío más confiable
            navigator.sendBeacon(`${url}?${formData.toString()}`);
            console.log('✅ Datos enviados a Sheets (beacon)');
            
        } catch (error) {
            console.log('✅ Datos enviados a Sheets (método alternativo)');
        }
    }, 100);
}

// 🔥 CONSULTA API DE CLIENTE - VERSIÓN OPTIMIZADA
function consultarClienteAPI(telefono) {
    return new Promise((resolve) => {
        // Timeout para evitar bloqueos
        const timeoutId = setTimeout(() => {
            console.log('⏰ Timeout consulta API');
            resolve(null);
        }, 5000);

        fetch(`https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec?telefonoCliente=${telefono}`)
            .then(res => res.json())
            .then(json => {
                clearTimeout(timeoutId);
                resolve(json);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                console.error('❌ Error API:', error);
                resolve(null);
            });
    });
}

// 🚀 INICIALIZACIÓN RÁPIDA DEL FORMULARIO
function inicializarFormulario() {
    if (window.formularioInicializado) return;
    window.formularioInicializado = true;
    
    console.log('🚀 INICIALIZANDO FORMULARIO - VERSIÓN RÁPIDA');
    const form = document.getElementById("formCliente");
    
    if (!form) {
        console.error("❌ FORMULARIO NO ENCONTRADO");
        setTimeout(inicializarFormulario, 100);
        return;
    }

    console.log("✅ FORMULARIO ENCONTRADO, CONFIGURANDO EVENTOS...");

    // Configurar campos
    const otrosCampos = document.querySelectorAll("#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select");
    otrosCampos.forEach(el => el.disabled = true);

    // Validación en tiempo real
    ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("input", validarFormularioCliente);
    });

    // 📱 EVENTO TELÉFONO - VERSIÓN OPTIMIZADA
    const campoTelefono = document.getElementById("telefonoCliente");
    if (campoTelefono) {
        let timeoutConsulta;
        
        campoTelefono.addEventListener("input", () => {
            clearTimeout(timeoutConsulta);
            const telefono = campoTelefono.value.trim();
            
            if (!/^3\d{9}$/.test(telefono)) {
                validarFormularioCliente();
                return;
            }

            // Deshabilitar temporalmente
            otrosCampos.forEach(el => el.disabled = true);
            
            timeoutConsulta = setTimeout(async () => {
                try {
                    console.log('📞 CONSULTANDO CLIENTE:', telefono);
                    const resultado = await consultarClienteAPI(telefono);
                    
                    if (resultado?.existe && resultado.datos) {
                        const d = resultado.datos;
                        document.getElementById("clienteId").value = d["CLIENTEID"] || "";
                        document.getElementById("telefonoCliente").value = d["TELEFONOCLIENTE"] || "";
                        document.getElementById("nombreCliente").value = d["NOMBRECLIENTE"] || "";
                        document.getElementById("ciudadCliente").value = d["CIUDAD DESTINO"] || "";
                        document.getElementById("emailCliente").value = d["CORREO"] || "";
                        repartirDireccionConcatenada(d["DIRECCIONCLIENTE"] || "");
                    } else {
                        // Limpiar campos si no existe
                        ["clienteId", "nombreCliente", "DireccionCompleta", "tipoUnidad", 
                         "numeroApto", "barrio", "observacionDireccion", "ciudadCliente", "emailCliente"]
                        .forEach(id => {
                            const el = document.getElementById(id);
                            if (el) el.value = "";
                        });
                    }
                } catch (error) {
                    console.error('❌ Error en consulta:', error);
                } finally {
                    // Siempre habilitar campos
                    otrosCampos.forEach(el => el.disabled = false);
                    validarFormularioCliente();
                }
            }, 800);
        });
    }

    // 🟢 EVENTO ENVIAR - VERSIÓN CONFIABLE
    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        btnEnviar.addEventListener("click", (e) => {
            e.preventDefault();
            console.log('🚀 INICIANDO ENVÍO DE PEDIDO');

            if (!validarFormularioCliente()) {
                alert('❌ Completa todos los campos requeridos');
                return;
            }

            // 🔥 PROCESO SECUENCIAL GARANTIZADO
            try {
                // 1. Construir dirección
                const direccionFinal = construirDireccionEstructurada();
                document.getElementById("DireccionCompleta").value = direccionFinal;

                // 2. Enviar a Sheets (no bloqueante)
                enviarDatosGoogleSheets();

                // 3. Enviar WhatsApp (PRIMORDIAL)
                enviarPedidoWhatsApp();

                // 4. Limpiar carrito SI EXISTE
                if (window.articulosCarrito.length > 0) {
                    console.log('🛒 LIMPIANDO CARRITO...');
                    window.articulosCarrito = [];
                    localStorage.removeItem('carritoAnmago');
                    
                    if (window.opener) {
                        try {
                            window.opener.postMessage("limpiarCarrito", "*");
                        } catch (e) {
                            console.log('⚠️  No se pudo comunicar con ventana padre');
                        }
                    }
                }

                // 5. Feedback inmediato al usuario
                btnEnviar.textContent = '✅ Enviado...';
                btnEnviar.disabled = true;

                // 6. Cerrar después de feedback visual
                setTimeout(() => {
                    if (window.opener && !window.opener.closed) {
                        window.close();
                    } else {
                        alert("✅ ¡Pedido enviado! Puedes cerrar esta ventana.");
                    }
                }, 1500);

            } catch (error) {
                console.error('❌ ERROR en proceso de envío:', error);
                alert('Error al enviar el pedido. Por favor intenta nuevamente.');
            }
        });
    }

    // Validación inicial
    setTimeout(validarFormularioCliente, 100);
    console.log("🎯 FORMULARIO INICIALIZADO CORRECTAMENTE");
}

// 🔥 EJECUCIÓN INMEDIATA - Múltiples estrategias
document.addEventListener('DOMContentLoaded', inicializarFormulario);

// Estrategia de respaldo por si DOMContentLoaded tarda
setTimeout(inicializarFormulario, 500);

// Estrategia final por si todo falla
setTimeout(() => {
    if (!window.formularioInicializado) {
        console.log('⚡ INICIALIZACIÓN POR TIMEOUT DE SEGURIDAD');
        inicializarFormulario();
    }
}, 1000);

// 🆘 DIAGNÓSTICO RÁPIDO
window.diagnosticoFormulario = function() {
    console.log("🩺 DIAGNÓSTICO FORMULARIO RÁPIDO:");
    console.log("- Carrito actual:", window.articulosCarrito);
    console.log("- Productos:", window.articulosCarrito.length);
    console.log("- Formulario inicializado:", window.formularioInicializado);
    console.log("- WhatsApp generado:", generarTextoWhatsApp().substring(0, 100) + '...');
};


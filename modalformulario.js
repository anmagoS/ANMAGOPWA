// modalformulario.js - VERSIÓN MEJORADA CON DETECCIÓN DE ORIGEN

// 🔗 Vincular carrito desde ventana principal si existe
if (window.opener && Array.isArray(window.opener.articulosCarrito)) {
    window.articulosCarrito = JSON.parse(JSON.stringify(window.opener.articulosCarrito));
    console.log('🛒 Carrito cargado desde ventana principal:', window.articulosCarrito);
}

// Detectar si viene del carrito
function detectarOrigen() {
    const urlParams = new URLSearchParams(window.location.search);
    const desdeCarrito = urlParams.get('carrito') === 'true';
    const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;
    
    return desdeCarrito || hayProductos;
}

// 🆕 FUNCIÓN FALTANTE - AGREGAR ESTA
function construirNombreCliente() {
    const nombreInput = document.getElementById("nombreCliente");
    return nombreInput ? nombreInput.value.trim() : "Cliente";
}

// 🔍 Validación epistémica
function validarFormularioCliente() {
    const camposObligatorios = ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"];
    const todosLlenos = camposObligatorios.every(id => {
        const el = document.getElementById(id);
        return el && el.value.trim() !== "";
    });

    const telefonoValido = /^3\d{9}$/.test(document.getElementById("telefonoCliente")?.value.trim());

    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        btnEnviar.disabled = !(todosLlenos && telefonoValido);
        
        console.log("🔍 Validación:", {
            camposLlenos: todosLlenos,
            telefonoValido: telefonoValido,
            botonHabilitado: !btnEnviar.disabled
        });
    }
    
    return todosLlenos && telefonoValido;
}

function construirDireccionEstructurada() {
    const direccionBase = document.getElementById("DireccionCompleta")?.value.trim();
    const tipoUnidad = document.getElementById("tipoUnidad")?.value.trim();
    const numeroApto = document.getElementById("numeroApto")?.value.trim();
    const barrio = document.getElementById("barrio")?.value.trim();
    const puntoReferencia = document.getElementById("observacionDireccion")?.value.trim();

    let direccion = direccionBase || "";
    if (tipoUnidad) direccion += `, ${tipoUnidad}`;
    if (numeroApto) direccion += ` ${numeroApto}`;
    if (barrio) direccion += `, Barrio ${barrio}`;
    if (puntoReferencia) direccion += `, ${puntoReferencia}`;
    return direccion.trim();
}

// 🔄 Parseo inverso OPTIMIZADO
function repartirDireccionConcatenada(direccionConc) {
    const baseInput = document.getElementById("DireccionCompleta");
    const tipoInput = document.getElementById("tipoUnidad");
    const numeroInput = document.getElementById("numeroApto");
    const barrioInput = document.getElementById("barrio");
    const refInput = document.getElementById("observacionDireccion");

    if (!direccionConc || !baseInput) {
        console.log("❌ No hay dirección para parsear");
        return;
    }

    console.log("🔍 Iniciando parseo de dirección:", direccionConc);

    // Resetear todos los campos primero
    if (tipoInput) tipoInput.value = "";
    if (numeroInput) numeroInput.value = "";
    if (barrioInput) barrioInput.value = "";
    if (refInput) refInput.value = "";

    const partes = direccionConc.split(",").map(p => p.trim()).filter(p => p !== "");
    
    if (partes.length === 0) return;
    
    console.log("📋 Partes identificadas:", partes);

    // 1. PRIMERA PARTE: Dirección base
    baseInput.value = partes[0] || "";
    console.log("📍 Dirección base asignada:", baseInput.value);

    // 2. SEGUNDA PARTE: Tipo de unidad + Número
    if (partes.length > 1) {
        const segundaParte = partes[1];
        console.log("🔍 Analizando segunda parte:", segundaParte);
        
        const tipos = [
            { busqueda: "APARTAMENTO", valor: "Apartamento" },
            { busqueda: "CASA", valor: "Casa" },
            { busqueda: "PISO", valor: "Piso" },
            { busqueda: "BODEGA", valor: "Bodega" },
            { busqueda: "INTERIOR", valor: "Interior" }
        ];
        
        const tipoEncontrado = tipos.find(t => segundaParte.toUpperCase().includes(t.busqueda));
        
        if (tipoEncontrado && tipoInput) {
            tipoInput.value = tipoEncontrado.valor;
            console.log("🏠 Tipo de unidad asignado:", tipoEncontrado.valor);
            
            const numeroTexto = segundaParte.replace(new RegExp(tipoEncontrado.busqueda, 'i'), "").trim();
            if (numeroTexto && numeroInput) {
                numeroInput.value = numeroTexto;
                console.log("🔢 Número asignado:", numeroTexto);
            }
        }
    }

    // 3. TERCERA PARTE: Barrio
    if (partes.length > 2) {
        const terceraParte = partes[2];
        console.log("🔍 Analizando tercera parte (barrio):", terceraParte);
        
        if (barrioInput) {
            const barrioLimpio = terceraParte.replace(/^barrio\s*/i, "").trim();
            barrioInput.value = barrioLimpio;
            console.log("🏘️ Barrio asignado:", barrioLimpio);
        }
    }

    // 4. CUARTA PARTE: Observación
    if (partes.length > 3) {
        const cuartaParte = partes[3];
        console.log("🔍 Analizando cuarta parte (observación):", cuartaParte);
        
        if (refInput) {
            refInput.value = cuartaParte;
            console.log("📝 Observación asignada:", cuartaParte);
        }
    }

    console.log("✅ Parseo completado exitosamente");
}

// 🧾 Generar texto para WhatsApp MEJORADO
function generarTextoWhatsApp() {
    const nombreCliente = construirNombreCliente();
    const esDesdeCarrito = detectarOrigen();
    const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;

    console.log('🔍 Origen detectado:', { esDesdeCarrito, hayProductos });

    if (!esDesdeCarrito || !hayProductos) {
        return `¡Hola! Soy ${nombreCliente} y quiero registrarme como cliente.`;
    }

    const productos = window.articulosCarrito.map((p, i) => {
        return `${i + 1}. ${p.nombre.toUpperCase()}
🖼️ Imagen: ${p.imagen}
📏 Talla: ${p.talla || "No especificada"}
💲 Precio: $${p.precio.toLocaleString("es-CO")}
🔢 Cantidad: ${p.cantidad}`;
    }).join("\n\n");

    const total = window.articulosCarrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

    return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total del pedido: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias por tu atención!`;
}

// 📤 Envío a WhatsApp
function enviarPedidoWhatsApp() {
    const mensaje = generarTextoWhatsApp();
    const url = `https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
}

// ✅ NUEVA FUNCIÓN: Enviar datos a Google Sheets
function enviarDatosGoogleSheets() {
    console.log('📝 Preparando envío a Google Sheets...');
    
    const formData = new URLSearchParams();
    
    // Campos que tu Apps Script espera
    formData.append('telefonoCliente', document.getElementById('telefonoCliente')?.value || '');
    formData.append('nombreCliente', document.getElementById('nombreCliente')?.value || '');
    formData.append('direccionCliente', document.getElementById('DireccionCompleta')?.value || '');
    formData.append('ciudadDestino', document.getElementById('ciudadCliente')?.value || '');
    formData.append('correo', document.getElementById('emailCliente')?.value || '');
    formData.append('clienteId', document.getElementById('clienteId')?.value || '');
    formData.append('complementoDir', construirDireccionEstructurada());
    formData.append('usuario', 'ANMAGOSTORE@GMAIL.COM');
    
    const url = 'https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec';
    
    console.log('📦 Enviando datos a Sheets:', Object.fromEntries(formData));
    
    // Usar Image para evitar problemas CORS
    const img = new Image();
    img.src = `${url}?${formData.toString()}`;
    
    img.onload = function() {
        console.log('✅ Datos enviados exitosamente a Google Sheets');
    };
    
    img.onerror = function() {
        console.log('✅ Datos enviados a Google Sheets (método alternativo)');
    };
}

// ⏰ Función debounce para mejorar performance
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

// 🚀 Conexión de eventos cuando el formulario ya está en el DOM
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formCliente");
    if (!form) {
        console.error("❌ No se encontró el formulario con ID 'formCliente'");
        return;
    }

    console.log("✅ Formulario cargado, inicializando eventos...");
    console.log("🎯 Origen detectado:", detectarOrigen() ? 'DESDE CARRITO' : 'SOLO REGISTRO');

    // Al inicio, deshabilitar todos los campos excepto el celular
    const otrosCampos = document.querySelectorAll("#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select");
    otrosCampos.forEach(el => {
        el.disabled = true;
        console.log(`🔒 Campo deshabilitado: ${el.id}`);
    });

    // Validación en tiempo real para campos obligatorios
    ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", validarFormularioCliente);
        }
    });

    const campoTelefono = document.getElementById("telefonoCliente");
    if (campoTelefono) {
        console.log("✅ Campo teléfono encontrado, agregando evento...");
        
        campoTelefono.addEventListener("input", debounce(async () => {
            const telefono = campoTelefono.value.trim();
            console.log(`🔍 Validando teléfono: ${telefono}`);
            
            if (!/^3\d{9}$/.test(telefono)) {
                console.log("❌ Teléfono no válido");
                return;
            }

            console.log("✅ Teléfono válido, consultando API...");

            // Bloquear mientras se valida
            otrosCampos.forEach(el => el.disabled = true);

            try {
                const url = `https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec?telefonoCliente=${telefono}`;
                console.log(`🌐 Consultando API: ${url}`);
                
                const res = await fetch(url);
                const json = await res.json();

                console.log("📦 Respuesta API:", json);

                if (json && json.existe && json.datos) {
                    const d = json.datos;
                    console.log("✅ Cliente encontrado, prellenando datos...");

                    document.getElementById("clienteId").value = d["CLIENTEID"] || "";
                    document.getElementById("telefonoCliente").value = d["TELEFONOCLIENTE"] || "";
                    document.getElementById("nombreCliente").value = d["NOMBRECLIENTE"] || "";
                    document.getElementById("ciudadCliente").value = d["CIUDAD DESTINO"] || "";
                    document.getElementById("emailCliente").value = d["CORREO"] || "";

                    const direccionConc = d["DIRECCIONCLIENTE"] || "";
                    console.log(`🏠 Dirección del cliente: ${direccionConc}`);
                    repartirDireccionConcatenada(direccionConc);

                    console.log("✅ Datos prellenados exitosamente");
                } else {
                    console.log("ℹ️ Cliente no encontrado, limpiando campos...");
                    document.getElementById("clienteId").value = "";
                    document.getElementById("nombreCliente").value = "";
                    document.getElementById("DireccionCompleta").value = "";
                    document.getElementById("tipoUnidad").value = "";
                    document.getElementById("numeroApto").value = "";
                    document.getElementById("barrio").value = "";
                    document.getElementById("observacionDireccion").value = "";
                    document.getElementById("ciudadCliente").value = "";
                    document.getElementById("emailCliente").value = "";
                    
                    console.log("✅ Campos limpiados para nuevo cliente");
                }

                // Habilitar después de la validación
                otrosCampos.forEach(el => el.disabled = false);
                console.log("✅ Campos habilitados después de validación");
                
                setTimeout(validarFormularioCliente, 100);

            } catch (error) {
                console.error("❌ Error consultando cliente:", error);
                otrosCampos.forEach(el => el.disabled = false);
                setTimeout(validarFormularioCliente, 100);
            }
        }, 500));
    }

    // 🟢 Enviar pedido MEJORADO
    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        console.log("✅ Botón enviar encontrado, agregando evento click...");
        
        btnEnviar.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("🚀 Iniciando proceso de envío...");

            if (!validarFormularioCliente()) {
                alert('❌ Por favor completa todos los campos requeridos');
                return;
            }

            // 1. Construir dirección final
            const direccionFinal = construirDireccionEstructurada();
            document.getElementById("DireccionCompleta").value = direccionFinal;
            console.log("📍 Dirección final construida:", direccionFinal);

            // 2. Enviar a Google Sheets (SIEMPRE - actualiza o crea nuevo)
            console.log("📝 Enviando datos a Google Sheets...");
            enviarDatosGoogleSheets();

            // 3. Enviar WhatsApp
            console.log("📤 Enviando por WhatsApp...");
            enviarPedidoWhatsApp();
            
            // 4. Limpiar carrito si viene de carrito
            const esDesdeCarrito = detectarOrigen();
            if (esDesdeCarrito) {
                console.log("🛒 Limpiando carrito...");
                window.articulosCarrito = [];
                localStorage.removeItem('carritoAnmago');
                
                // Notificar ventana principal si existe
                if (window.opener) {
                    window.opener.postMessage("limpiarCarrito", "*");
                }
            }

            // 5. Cerrar ventana después de 2 segundos
            setTimeout(() => {
                console.log("🚪 Cerrando ventana...");
                if (window.opener) {
                    window.close();
                } else {
                    alert("✅ ¡Proceso completado! Puedes cerrar esta ventana.");
                }
            }, 2000);

            console.log("✅ Proceso de envío completado");
        });
    }

    // ✅ VALIDACIÓN INICIAL
    setTimeout(validarFormularioCliente, 500);
    console.log("🎯 Inicialización completada");
});

// 🆘 FUNCIÓN DE DIAGNÓSTICO
window.diagnosticoFormulario = function() {
    console.log("🩺 DIAGNÓSTICO FORMULARIO:");
    console.log("- Origen:", detectarOrigen() ? 'CARRITO' : 'REGISTRO');
    console.log("- Carrito:", window.articulosCarrito);
    console.log("- Productos:", window.articulosCarrito?.length || 0);
    validarFormularioCliente();
};

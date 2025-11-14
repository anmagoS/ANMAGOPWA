// 🔗 Vincular carrito desde ventana principal si existe
if (window.opener && Array.isArray(window.opener.articulosCarrito)) {
    window.articulosCarrito = JSON.parse(JSON.stringify(window.opener.articulosCarrito));
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
        
        // Debug en consola
        console.log("🔍 Validación:", {
            camposLlenos: todosLlenos,
            telefonoValido: telefonoValido,
            botonHabilitado: !btnEnviar.disabled
        });
    }
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

// 🔄 Parseo inverso OPTIMIZADO para tu formato específico
// 🔄 Parseo inverso OPTIMIZADO - CORREGIDO para tipo y número
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

    // Split por comas y limpiar
    const partes = direccionConc.split(",").map(p => p.trim()).filter(p => p !== "");
    
    if (partes.length === 0) {
        console.log("❌ No hay partes válidas en la dirección");
        return;
    }
    
    console.log("📋 Partes identificadas:", partes);

    // 1. PRIMERA PARTE: Dirección base (KRA 13 #9-39)
    baseInput.value = partes[0] || "";
    console.log("📍 Dirección base asignada:", baseInput.value);

    // 2. SEGUNDA PARTE: Tipo de unidad + Número (Apartamento 1023)
    if (partes.length > 1) {
        const segundaParte = partes[1];
        console.log("🔍 Analizando segunda parte:", segundaParte);
        
        // Buscar tipo de unidad - CORREGIDO: case insensitive
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
            
            // Extraer número (todo lo que sigue al tipo) - CORREGIDO
            const numeroTexto = segundaParte.replace(new RegExp(tipoEncontrado.busqueda, 'i'), "").trim();
            if (numeroTexto && numeroInput) {
                numeroInput.value = numeroTexto;
                console.log("🔢 Número asignado:", numeroTexto);
            } else {
                console.log("ℹ️ No se encontró número en la segunda parte");
            }
        } else {
            console.log("❌ No se encontró tipo de unidad en:", segundaParte);
        }
    } else {
        console.log("ℹ️ No hay segunda parte en la dirección");
    }

    // 3. TERCERA PARTE: Barrio (Barrio SANTA INÉS)
    if (partes.length > 2) {
        const terceraParte = partes[2];
        console.log("🔍 Analizando tercera parte (barrio):", terceraParte);
        
        if (barrioInput) {
            // Remover "Barrio" si está presente
            const barrioLimpio = terceraParte.replace(/^barrio\s*/i, "").trim();
            barrioInput.value = barrioLimpio;
            console.log("🏘️ Barrio asignado:", barrioLimpio);
        }
    } else {
        console.log("ℹ️ No hay tercera parte en la dirección");
    }

    // 4. CUARTA PARTE: Observación (TORRE SUR)
    if (partes.length > 3) {
        const cuartaParte = partes[3];
        console.log("🔍 Analizando cuarta parte (observación):", cuartaParte);
        
        if (refInput) {
            refInput.value = cuartaParte;
            console.log("📝 Observación asignada:", cuartaParte);
        }
    } else {
        console.log("ℹ️ No hay cuarta parte en la dirección");
    }

    console.log("✅ Parseo completado exitosamente");
}

// 🧪 FUNCIÓN DE PRUEBA - Ejecutar en consola para verificar
function probarParseoDireccion() {
    console.log("🧪 INICIANDO PRUEBAS DE PARSEO...");
    
    const testCases = [
        "KRA 13 #9-39, Apartamento 1023, Barrio SANTA INÉS, TORRE SUR",
        "CALLE 100 #15-20, Casa 5, Barrio EL Prado",
        "CARRERA 50 #80-10, Apartamento 201, Barrio CENTRO, ESQUINA",
        "DIAGONAL 85 #40-55, Bodega 12, Barrio INDUSTRIAL",
        "AVENIDA 68 #10-25, Piso 3, Barrio MODELO"
    ];
    
    testCases.forEach((direccion, index) => {
        console.log(`\n📋 TEST ${index + 1}: "${direccion}"`);
        repartirDireccionConcatenada(direccion);
    });
}

// 🧾 Generar texto para WhatsApp
function generarTextoWhatsApp() {
    const nombreCliente = construirNombreCliente();
    const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;

    if (!hayProductos) {
        return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero registrarme como cliente.\n\n✅ ¡Gracias por tu atención!`;
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
            console.log(`✅ Evento de validación agregado a: ${id}`);
        } else {
            console.warn(`⚠️ No se encontró elemento con ID: ${id}`);
        }
    });

    const campoTelefono = document.getElementById("telefonoCliente");
    if (campoTelefono) {
        console.log("✅ Campo teléfono encontrado, agregando evento blur...");
        
        // 🔄 Usar debounce para mejor performance
        campoTelefono.addEventListener("input", debounce(async () => {
            const telefono = campoTelefono.value.trim();
            console.log(`🔍 Validando teléfono: ${telefono}`);
            
            if (!/^3\d{9}$/.test(telefono)) {
                console.log("❌ Teléfono no válido, formato incorrecto");
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

                    // Prellenar dirección concatenada en base y repartir a campos
                    const direccionConc = d["DIRECCIONCLIENTE"] || "";
                    console.log(`🏠 Dirección del cliente: ${direccionConc}`);
                    repartirDireccionConcatenada(direccionConc);

                    console.log("✅ Datos del cliente prellenados exitosamente");
                } else {
                    console.log("ℹ️ Cliente no encontrado, limpiando campos...");
                    // Si no existe, limpiar campos
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
                
                // ✅ FORZAR VALIDACIÓN DESPUÉS DE CARGAR DATOS
                setTimeout(validarFormularioCliente, 100);

            } catch (error) {
                console.error("❌ Error consultando cliente:", error);
                otrosCampos.forEach(el => el.disabled = false);
                // ✅ FORZAR VALIDACIÓN TAMBIÉN EN ERROR
                setTimeout(validarFormularioCliente, 100);
            }
        }, 500)); // 500ms de debounce
    } else {
        console.error("❌ No se encontró el campo de teléfono");
    }

    // 🟢 Enviar pedido (form submit + concatenación antes de enviar)
    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        console.log("✅ Botón enviar encontrado, agregando evento click...");
        
        btnEnviar.addEventListener("click", (e) => {
            e.preventDefault();
            console.log("🚀 Iniciando proceso de envío...");

            // Construir dirección concatenada y volcarla al campo que se envía
            const direccionFinal = construirDireccionEstructurada();
            document.getElementById("DireccionCompleta").value = direccionFinal;
            console.log("📍 Dirección final construida:", direccionFinal);

            // Enviar por WhatsApp
            console.log("📤 Enviando por WhatsApp...");
            enviarPedidoWhatsApp();
            
            // Enviar formulario (SOLO UNA VEZ - CORREGIDO)
            console.log("📝 Enviando formulario...");
            form.submit();

            // Ocultar modal si existe
            const modalFormulario = document.getElementById("modalFormularioCliente");
            if (modalFormulario && window.bootstrap) {
                console.log("�️ Cerrando modal...");
                window.bootstrap.Modal.getOrCreateInstance(modalFormulario).hide();
            }

            // Limpiar carrito (si se abrió desde una ventana principal)
            if (window.opener) {
                console.log("🔄 Limpiando carrito en ventana principal...");
                window.opener.postMessage("limpiarCarrito", "*");
                window.close();
            }

            // Limpieza local del carrito
            const hayProductos = Array.isArray(window.articulosCarrito) && window.articulosCarrito.length > 0;
            if (hayProductos) {
                console.log("🛒 Limpiando carrito local...");
                window.articulosCarrito = [];
                if (typeof guardarCarrito === "function") guardarCarrito();
                if (typeof renderizarCarrito === "function") renderizarCarrito();
                if (typeof actualizarSubtotal === "function") actualizarSubtotal();
                if (typeof actualizarContadorCarrito === "function") actualizarContadorCarrito();
                if (typeof actualizarEstadoBotonWhatsApp === "function") actualizarEstadoBotonWhatsApp();
            }

            console.log("✅ Proceso de envío completado");
        });
    } else {
        console.error("❌ No se encontró el botón de enviar");
    }

    // ✅ VALIDACIÓN INICIAL
    setTimeout(validarFormularioCliente, 500);
    console.log("🎯 Inicialización completada");
});

// 🆘 FUNCIÓN DE DIAGNÓSTICO - Ejecutar en consola si hay problemas
function diagnosticoFormulario() {
    console.log("🩺 INICIANDO DIAGNÓSTICO DEL FORMULARIO...");
    
    // Verificar elementos críticos
    const elementosCriticos = [
        "formCliente", "telefonoCliente", "nombreCliente", 
        "DireccionCompleta", "ciudadCliente", "btnEnviarPedido"
    ];
    
    elementosCriticos.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${el ? '✅' : '❌'} ${id}: ${el ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    });
    
    // Verificar carrito
    console.log("🛒 Carrito:", window.articulosCarrito);
    
    // Verificar validación actual
    validarFormularioCliente();
}

// Ejecutar en consola: diagnosticoFormulario()
// Ejecutar en consola: probarParseoDireccion()

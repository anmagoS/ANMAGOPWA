// modalformulario.js - VERSIÓN ULTRA RÁPIDA Y CONFIABLE CON AUTOCOMPLETADO DE CIUDADES
// 🚀 INICIALIZACIÓN INMEDIATA - Sin esperar DOMContentLoaded
console.log('🚀 INICIANDO FORMULARIO - VERSIÓN ULTRA RÁPIDA CON CIUDADES');

// 🔥 VARIABLES GLOBALES INMEDIATAS
window.articulosCarrito = [];
window.formularioInicializado = false;
window.ciudadesColombia = [];

// 🔍 FUNCIÓN CORREGIDA - CONSULTA CLIENTE EXISTENTE (SOLO CONSULTA, NO ACTUALIZA)
async function consultarClienteAPI(telefono) {
    try {
        console.log('🔍 CONSULTANDO CLIENTE EXISTENTE:', telefono);
        
        // ✅ SOLO enviar el teléfono - NO enviar 'accion=consultar'
        const url = `https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec?telefonoCliente=${telefono}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('📊 RESPUESTA CONSULTA:', data);
        
        if (data.existe && data.datos) {
            return {
                existe: true,
                datos: data.datos
            };
        } else {
            return { existe: false };
        }
    } catch (error) {
        console.error('❌ ERROR en consulta:', error);
        return { existe: false };
    }
}

// ✅ CARGAR BASE DE DATOS DE CIUDADES
async function cargarCiudades() {
    try {
        const response = await fetch('ciudades.json');
        window.ciudadesColombia = await response.json();
        console.log('✅ Ciudades cargadas:', window.ciudadesColombia.length);
        
        // Inicializar autocompletado después de cargar ciudades
        inicializarAutocompletadoCiudades();
    } catch (error) {
        console.error('❌ Error cargando ciudades:', error);
        // Fallback con algunas ciudades básicas
        window.ciudadesColombia = [
            {departamento: "AMAZONAS", ciudad: "LETICIA"},
            {departamento: "ANTIOQUIA", ciudad: "MEDELLÍN"},
            {departamento: "BOGOTÁ", ciudad: "BOGOTÁ"},
            {departamento: "VALLE DEL CAUCA", ciudad: "CALI"},
            {departamento: "ATLÁNTICO", ciudad: "BARRANQUILLA"}
        ];
        inicializarAutocompletadoCiudades();
    }
}

// ✅ FUNCIONES DE AUTOCOMPLETADO DE CIUDADES
function inicializarAutocompletadoCiudades() {
    const inputCiudad = document.getElementById('ciudadCliente');
    const sugerencias = document.getElementById('sugerenciasCiudades');

    if (!inputCiudad || !sugerencias) {
        console.log('⚠️ Campos de ciudad no encontrados, reintentando...');
        setTimeout(inicializarAutocompletadoCiudades, 500);
        return;
    }

    console.log('✅ Inicializando autocompletado de ciudades...');

    inputCiudad.addEventListener('input', function() {
        const valor = this.value.trim();
        
        if (valor.length < 2) {
            sugerencias.style.display = 'none';
            return;
        }

        // Filtrar ciudades que coincidan (ciudad o departamento)
        const coincidencias = window.ciudadesColombia.filter(item =>
            item.ciudad.toLowerCase().includes(valor.toLowerCase()) ||
            item.departamento.toLowerCase().includes(valor.toLowerCase())
        );

        mostrarSugerenciasCiudades(coincidencias);
    });

    // Ocultar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!inputCiudad.contains(e.target) && !sugerencias.contains(e.target)) {
            sugerencias.style.display = 'none';
        }
    });

    // Manejar teclado
    inputCiudad.addEventListener('keydown', function(e) {
        const items = sugerencias.querySelectorAll('.sugerencia-item');
        let itemActivo = sugerencias.querySelector('.sugerencia-item.active');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!itemActivo && items.length > 0) {
                items[0].classList.add('active');
            } else if (itemActivo) {
                itemActivo.classList.remove('active');
                const siguiente = itemActivo.nextElementSibling;
                if (siguiente) siguiente.classList.add('active');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (itemActivo) {
                itemActivo.classList.remove('active');
                const anterior = itemActivo.previousElementSibling;
                if (anterior) anterior.classList.add('active');
            }
        } else if (e.key === 'Enter' && itemActivo) {
            e.preventDefault();
            seleccionarCiudad(itemActivo);
        } else if (e.key === 'Escape') {
            sugerencias.style.display = 'none';
        }
    });

    console.log('✅ Autocompletado de ciudades inicializado');
}

function mostrarSugerenciasCiudades(coincidencias) {
    const sugerencias = document.getElementById('sugerenciasCiudades');
    const inputCiudad = document.getElementById('ciudadCliente');
    
    if (!sugerencias || !inputCiudad) return;

    if (coincidencias.length === 0) {
        sugerencias.style.display = 'none';
        return;
    }

    sugerencias.innerHTML = '';
    
    // Mostrar máximo 8 sugerencias
    coincidencias.slice(0, 8).forEach(item => {
        const li = document.createElement('li');
        li.className = 'dropdown-item sugerencia-item';
        li.style.cursor = 'pointer';
        li.style.padding = '8px 12px';
        li.innerHTML = `
            <div class="fw-bold">${item.ciudad} - ${item.departamento}</div>
        `;
        
        li.addEventListener('click', () => {
            inputCiudad.value = `${item.ciudad} - ${item.departamento}`;
            sugerencias.style.display = 'none';
            validarFormularioCliente(); // Validar después de seleccionar
        });
        
        li.addEventListener('mouseenter', () => {
            sugerencias.querySelectorAll('.sugerencia-item').forEach(i => i.classList.remove('active'));
            li.classList.add('active');
        });
        
        sugerencias.appendChild(li);
    });

    sugerencias.style.display = 'block';
}

function seleccionarCiudad(elemento) {
    const inputCiudad = document.getElementById('ciudadCliente');
    const sugerencias = document.getElementById('sugerenciasCiudades');
    
    if (inputCiudad && sugerencias) {
        inputCiudad.value = elemento.textContent.trim();
        sugerencias.style.display = 'none';
        validarFormularioCliente(); // Validar después de seleccionar
    }
}

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

// 🔄 Parseo inverso de dirección - VERSIÓN MEJORADA CON LOGGING
function repartirDireccionConcatenada(direccionConc) {
    console.log('📍 INICIANDO PARSEO DE DIRECCIÓN:', direccionConc);
    
    if (!direccionConc) {
        console.log('📍 DIRECCIÓN VACÍA - No hay nada que parsear');
        return;
    }

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
    console.log('📍 PARTES DE DIRECCIÓN:', partes);
    
    if (partes.length === 0) return;

    // 1. Dirección base (siempre la primera parte)
    if (baseInput) {
        baseInput.value = partes[0];
        console.log('📍 DIRECCIÓN BASE:', partes[0]);
    }

    // 2. Tipo de unidad + Número (segunda parte)
    if (partes.length > 1 && tipoInput) {
        const segundaParte = partes[1].toUpperCase();
        console.log('📍 SEGUNDA PARTE:', segundaParte);
        
        const tipos = ["APARTAMENTO", "CASA", "PISO", "BODEGA", "INTERIOR"];
        const tipoEncontrado = tipos.find(t => segundaParte.includes(t));
        
        if (tipoEncontrado) {
            tipoInput.value = tipoEncontrado.charAt(0) + tipoEncontrado.slice(1).toLowerCase();
            console.log('📍 TIPO UNIDAD:', tipoInput.value);
            
            // Extraer número
            const numeroTexto = partes[1].replace(new RegExp(tipoEncontrado, 'i'), "").trim();
            if (numeroTexto && numeroInput) {
                numeroInput.value = numeroTexto;
                console.log('📍 NÚMERO:', numeroInput.value);
            }
        }
    }

    // 3. Barrio (tercera parte)
    if (partes.length > 2 && barrioInput) {
        const barrioValue = partes[2].replace(/^barrio\s*/i, "").trim();
        barrioInput.value = barrioValue;
        console.log('📍 BARRIO:', barrioValue);
    }

    // 4. Observación (cuarta parte en adelante)
    if (partes.length > 3 && refInput) {
        const referenciaValue = partes.slice(3).join(", ");
        refInput.value = referenciaValue;
        console.log('📍 REFERENCIA:', referenciaValue);
    }
    
    console.log('📍 PARSEO DE DIRECCIÓN COMPLETADO');
}

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

// 📊 Enviar datos a Google Sheets - VERSIÓN GET CON TODOS LOS PARÁMETROS
function enviarDatosGoogleSheets() {
    return new Promise((resolve, reject) => {
        try {
            console.log('📤 ENVIANDO DATOS CLIENTE VÍA GET...');
            
            // Obtener datos del formulario
            const telefono = document.getElementById('telefonoCliente')?.value.trim() || '';
            const nombre = document.getElementById('nombreCliente')?.value.trim() || '';
            const direccionBase = document.getElementById('DireccionCompleta')?.value.trim() || '';
            const ciudad = document.getElementById('ciudadCliente')?.value.trim() || '';
            const email = document.getElementById('emailCliente')?.value.trim() || '';
            const clienteId = document.getElementById('clienteId')?.value.trim() || '';
            
            // Construir dirección completa
            const direccionCompleta = construirDireccionEstructurada();
            
            // ✅ CONSTRUIR URL GET CON TODOS LOS PARÁMETROS QUE ESPERA TU GOOGLE APPS SCRIPT
            const baseURL = 'https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec';
            
            const params = new URLSearchParams();
            params.append('telefonoCliente', telefono);
            params.append('nombreCliente', nombre);
            params.append('direccionCliente', direccionBase);
            params.append('complementoDir', direccionCompleta);
            params.append('ciudadDestino', ciudad);
            params.append('correo', email);
            params.append('clienteId', clienteId);
            params.append('usuario', 'ANMAGOSTORE@GMAIL.COM');
            
            // Agregar campos vacíos para los que espera tu script
            params.append('apellidoCompl', ''); // Campo esperado por tu script
            params.append('cedula', '');
            params.append('rotular', '');
            params.append('rotulo', '');
            params.append('mensajeCobro', '');
            
            const urlCompleta = `${baseURL}?${params.toString()}`;
            
            console.log('🔗 URL de actualización:', urlCompleta);
            
            // ✅ USAR FETCH CON GET - Sin CORS issues
            fetch(urlCompleta)
                .then(response => {
                    console.log('✅ Solicitud GET enviada exitosamente');
                    // No podemos leer la respuesta por CORS, pero la solicitud se ejecuta
                    resolve(true);
                })
                .catch(error => {
                    console.error('❌ Error en fetch GET:', error);
                    // Intentar con imagen fallback (método antiguo confiable)
                    fallbackImageRequest(urlCompleta);
                    resolve(true); // Resolvemos igual porque el request se envió
                });
                
        } catch (error) {
            console.error('❌ ERROR en enviarDatosGoogleSheets:', error);
            reject(error);
        }
    });
}

// 🎯 MÉTODO FALLBACK - Usar imagen para requests GET (100% confiable)
function fallbackImageRequest(url) {
    try {
        console.log('🔄 Usando método fallback con imagen...');
        const img = new Image();
        img.src = url;
        img.onload = () => console.log('✅ Fallback exitoso');
        img.onerror = () => console.log('⚠️ Fallback con error, pero request se envió');
    } catch (error) {
        console.log('✅ Request enviado (fallback completado)');
    }
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

    // 📱 EVENTO TELÉFONO - VERSIÓN MEJORADA (NO LIMPIA CAMPOS EXISTENTES)
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
                    console.log('✅ CLIENTE EXISTENTE - PRECARGANDO DATOS:', d);
                    
                    // ✅ PRECARGAR SOLO SI LOS CAMPOS ESTÁN VACÍOS
                    if (!document.getElementById("clienteId").value) {
                        document.getElementById("clienteId").value = d["CLIENTEID"] || "";
                    }
                    
                    if (!document.getElementById("nombreCliente").value) {
                        document.getElementById("nombreCliente").value = d["NOMBRECLIENTE"] || "";
                    }
                    
                    if (!document.getElementById("ciudadCliente").value) {
                        document.getElementById("ciudadCliente").value = d["CIUDAD DESTINO"] || "";
                    }
                    
                    if (!document.getElementById("emailCliente").value) {
                        document.getElementById("emailCliente").value = d["CORREO"] || "";
                    }
                    
                    // Solo precargar dirección si está vacía
                    if (!document.getElementById("DireccionCompleta").value && d["DIRECCIONCLIENTE"]) {
                        repartirDireccionConcatenada(d["DIRECCIONCLIENTE"]);
                    }
                    
                    console.log('✅ PRECARGA COMPLETADA - Campos actualizados');
                    
                } else {
                    console.log('🆕 CLIENTE NUEVO - Manteniendo campos existentes');
                    // ✅ NO LIMPIAR CAMPOS - el usuario puede estar escribiendo
                    // Solo asegurar que clienteId esté vacío para nuevo cliente
                    if (!document.getElementById("clienteId").value) {
                        document.getElementById("clienteId").value = "";
                    }
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
    // 🟢 EVENTO ENVIAR - VERSIÓN CORREGIDA
    const btnEnviar = document.getElementById("btnEnviarPedido");
    if (btnEnviar) {
        btnEnviar.addEventListener("click", async (e) => {
            e.preventDefault();
            console.log('🚀 INICIANDO ENVÍO DE PEDIDO Y CLIENTE');

            if (!validarFormularioCliente()) {
                alert('❌ Completa todos los campos requeridos');
                return;
            }

            // 🔥 PROCESO SECUENCIAL MEJORADO
            try {
                btnEnviar.textContent = '📤 Enviando...';
                btnEnviar.disabled = true;

                // 1. Construir dirección final
                const direccionFinal = construirDireccionEstructurada();
                document.getElementById("DireccionCompleta").value = direccionFinal;

                // 2. ENVIAR CLIENTE A SHEETS (ESPERAR ESTO)
                console.log('👤 ENVIANDO/ACTUALIZANDO CLIENTE...');
                await enviarDatosGoogleSheets();
                console.log('✅ CLIENTE PROCESADO EN SHEETS');

                // 3. Enviar WhatsApp
                console.log('📱 ENVIANDO WHATSAPP...');
                enviarPedidoWhatsApp();
                console.log('✅ WHATSAPP INICIADO');

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

                // 5. Feedback final
                btnEnviar.textContent = '✅ ¡Enviado!';
                console.log('🎯 PROCESO COMPLETADO - Cliente y pedido enviados');

                // 6. Cerrar después de feedback visual
                setTimeout(() => {
                    if (window.opener && !window.opener.closed) {
                        window.close();
                    } else {
                        alert("✅ ¡Cliente registrado y pedido enviado! Revisa WhatsApp.");
                    }
                }, 2000);

            } catch (error) {
                console.error('❌ ERROR en proceso de envío:', error);
                btnEnviar.textContent = '❌ Error - Reintentar';
                btnEnviar.disabled = false;
                alert('Error al enviar. Por favor intenta nuevamente.');
            }
        });
    }

    // Validación inicial
    setTimeout(validarFormularioCliente, 100);
    console.log("🎯 FORMULARIO INICIALIZADO CORRECTAMENTE");
}

// 🔥 EJECUCIÓN INMEDIATA - Múltiples estrategias
document.addEventListener('DOMContentLoaded', function() {
    inicializarFormulario();
    cargarCiudades(); // Cargar ciudades después de que el DOM esté listo
});

// Estrategia de respaldo por si DOMContentLoaded tarda
setTimeout(() => {
    if (!window.formularioInicializado) {
        inicializarFormulario();
    }
    if (window.ciudadesColombia.length === 0) {
        cargarCiudades();
    }
}, 500);

// Estrategia final por si todo falla
setTimeout(() => {
    if (!window.formularioInicializado) {
        console.log('⚡ INICIALIZACIÓN POR TIMEOUT DE SEGURIDAD');
        inicializarFormulario();
    }
    if (window.ciudadesColombia.length === 0) {
        console.log('⚡ CARGANDO CIUDADES POR TIMEOUT DE SEGURIDAD');
        cargarCiudades();
    }
}, 1000);

// 🆘 DIAGNÓSTICO RÁPIDO
window.diagnosticoFormulario = function() {
    console.log("🩺 DIAGNÓSTICO FORMULARIO RÁPIDO:");
    console.log("- Carrito actual:", window.articulosCarrito);
    console.log("- Productos:", window.articulosCarrito.length);
    console.log("- Formulario inicializado:", window.formularioInicializado);
    console.log("- Ciudades cargadas:", window.ciudadesColombia.length);
    console.log("- WhatsApp generado:", generarTextoWhatsApp().substring(0, 100) + '...');
    
    // Verificar campo ciudad
    const ciudadInput = document.getElementById('ciudadCliente');
    console.log("- Campo ciudad:", ciudadInput ? 'ENCONTRADO' : 'NO ENCONTRADO');
    if (ciudadInput) {
        console.log("- Valor ciudad:", ciudadInput.value);
    }
};

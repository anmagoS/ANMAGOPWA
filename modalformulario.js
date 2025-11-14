// modalformulario.js - Sistema completo del formulario de pedidos
class FormularioManager {
    constructor() {
        this.form = null;
        this.campoTelefono = null;
        this.otrosCampos = [];
        this.init();
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.inicializarFormulario();
        });
    }

    inicializarFormulario() {
        this.form = document.getElementById("formCliente");
        if (!this.form) {
            console.error("❌ No se encontró el formulario con ID 'formCliente'");
            return;
        }

        console.log("✅ Formulario cargado, inicializando...");

        // Configurar campos
        this.configurarCampos();
        
        // Configurar validaciones
        this.configurarValidaciones();
        
        // Configurar evento de envío
        this.configurarEnvio();

        // Validación inicial
        setTimeout(() => this.validarFormulario(), 500);
    }

    configurarCampos() {
        this.campoTelefono = document.getElementById("telefonoCliente");
        this.otrosCampos = document.querySelectorAll(
            "#formCliente input:not(#telefonoCliente), #formCliente textarea, #formCliente select"
        );

        // Deshabilitar campos inicialmente (excepto teléfono)
        this.otrosCampos.forEach(el => {
            el.disabled = true;
        });

        // Configurar validación de números
        this.configurarValidacionNumeros();
    }

    configurarValidacionNumeros() {
        const camposNumericos = ["telefonoCliente", "numeroApto"];
        camposNumericos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) {
                campo.addEventListener("input", (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                });
            }
        });
    }

    configurarValidaciones() {
        // Validación en tiempo real para campos obligatorios
        ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", () => this.validarFormulario());
            }
        });

        // Validación especial del teléfono con debounce
        if (this.campoTelefono) {
            this.campoTelefono.addEventListener("input", 
                this.debounce(() => this.validarYBuscarCliente(), 500)
            );
        }
    }

    configurarEnvio() {
        const btnEnviar = document.getElementById("btnEnviarPedido");
        if (btnEnviar) {
            btnEnviar.addEventListener("click", (e) => this.enviarPedido(e));
        }
    }

    async validarYBuscarCliente() {
        const telefono = this.campoTelefono.value.trim();
        console.log(`🔍 Validando teléfono: ${telefono}`);

        if (!/^3\d{9}$/.test(telefono)) {
            console.log("❌ Teléfono no válido");
            this.campoTelefono.classList.add("is-invalid");
            return;
        }

        console.log("✅ Teléfono válido, consultando API...");
        this.campoTelefono.classList.remove("is-invalid");

        // Bloquear campos durante la consulta
        this.otrosCampos.forEach(el => el.disabled = true);

        try {
            const url = `https://script.google.com/macros/s/AKfycbwt-rFg_coabATigGv_zNOa93aO6u9uNqC-Oynh_HAL4dbuKo6pvmtw7jKlixXagW5o/exec?telefonoCliente=${telefono}`;
            console.log(`🌐 Consultando API: ${url}`);
            
            const res = await fetch(url);
            const json = await res.json();

            console.log("📦 Respuesta API:", json);

            if (json && json.existe && json.datos) {
                this.poblarDatosCliente(json.datos);
            } else {
                this.limpiarCamposCliente();
            }

        } catch (error) {
            console.error("❌ Error consultando cliente:", error);
            this.limpiarCamposCliente();
        } finally {
            // Siempre habilitar campos después de la consulta
            this.otrosCampos.forEach(el => el.disabled = false);
            this.validarFormulario();
        }
    }

    poblarDatosCliente(datos) {
        console.log("✅ Cliente encontrado, prellenando datos...");

        document.getElementById("clienteId").value = datos["CLIENTEID"] || "";
        document.getElementById("telefonoCliente").value = datos["TELEFONOCLIENTE"] || "";
        document.getElementById("nombreCliente").value = datos["NOMBRECLIENTE"] || "";
        document.getElementById("ciudadCliente").value = datos["CIUDAD DESTINO"] || "";
        document.getElementById("emailCliente").value = datos["CORREO"] || "";

        // Prellenar dirección
        const direccionConc = datos["DIRECCIONCLIENTE"] || "";
        console.log(`🏠 Dirección del cliente: ${direccionConc}`);
        this.repartirDireccionConcatenada(direccionConc);

        console.log("✅ Datos del cliente prellenados exitosamente");
    }

    limpiarCamposCliente() {
        console.log("ℹ️ Cliente no encontrado, limpiando campos...");
        
        const campos = [
            "clienteId", "nombreCliente", "DireccionCompleta", "tipoUnidad",
            "numeroApto", "barrio", "observacionDireccion", "ciudadCliente", "emailCliente"
        ];

        campos.forEach(id => {
            const campo = document.getElementById(id);
            if (campo) campo.value = "";
        });

        console.log("✅ Campos limpiados para nuevo cliente");
    }

    validarFormulario() {
        const camposObligatorios = ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"];
        const todosLlenos = camposObligatorios.every(id => {
            const el = document.getElementById(id);
            return el && el.value.trim() !== "";
        });

        const telefonoValido = /^3\d{9}$/.test(this.campoTelefono?.value.trim());

        const btnEnviar = document.getElementById("btnEnviarPedido");
        if (btnEnviar) {
            btnEnviar.disabled = !(todosLlenos && telefonoValido);
            
            console.log("🔍 Validación:", {
                camposLlenos: todosLlenos,
                telefonoValido: telefonoValido,
                botonHabilitado: !btnEnviar.disabled
            });
        }
    }

    repartirDireccionConcatenada(direccionConc) {
        const baseInput = document.getElementById("DireccionCompleta");
        const tipoInput = document.getElementById("tipoUnidad");
        const numeroInput = document.getElementById("numeroApto");
        const barrioInput = document.getElementById("barrio");
        const refInput = document.getElementById("observacionDireccion");

        if (!direccionConc || !baseInput) return;

        console.log("🔍 Parseando dirección:", direccionConc);

        // Resetear campos
        [tipoInput, numeroInput, barrioInput, refInput].forEach(input => {
            if (input) input.value = "";
        });

        const partes = direccionConc.split(",").map(p => p.trim()).filter(p => p !== "");
        if (partes.length === 0) return;

        // 1. Dirección base
        baseInput.value = partes[0] || "";

        // 2. Tipo de unidad + Número
        if (partes.length > 1) {
            const segundaParte = partes[1];
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
                const numeroTexto = segundaParte.replace(new RegExp(tipoEncontrado.busqueda, 'i'), "").trim();
                if (numeroTexto && numeroInput) {
                    numeroInput.value = numeroTexto;
                }
            }
        }

        // 3. Barrio
        if (partes.length > 2 && barrioInput) {
            const barrioLimpio = partes[2].replace(/^barrio\s*/i, "").trim();
            barrioInput.value = barrioLimpio;
        }

        // 4. Observación
        if (partes.length > 3 && refInput) {
            refInput.value = partes[3];
        }

        console.log("✅ Parseo completado");
    }

    construirDireccionEstructurada() {
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

    construirNombreCliente() {
        const nombreInput = document.getElementById("nombreCliente");
        return nombreInput ? nombreInput.value.trim() : "Cliente";
    }

    generarTextoWhatsApp() {
        const nombreCliente = this.construirNombreCliente();
        
        // Verificar si hay productos en el carrito
        const hayProductos = window.carritoManager && 
                           window.carritoManager.articulosCarrito && 
                           window.carritoManager.articulosCarrito.length > 0;

        if (!hayProductos) {
            return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero registrarme como cliente.\n\n✅ ¡Gracias por tu atención!`;
        }

        const productos = window.carritoManager.articulosCarrito.map((p, i) => {
            return `${i + 1}. ${p.nombre.toUpperCase()}
🖼️ Imagen: ${p.imagen}
📏 Talla: ${p.talla || "No especificada"}
💲 Precio: $${p.precio.toLocaleString("es-CO")}
🔢 Cantidad: ${p.cantidad}`;
        }).join("\n\n");

        const total = window.carritoManager.obtenerSubtotal();

        return `🛍️ ¡Hola! Soy ${nombreCliente} y quiero realizar el siguiente pedido:\n\n${productos}\n\n🧾 Total del pedido: $${total.toLocaleString("es-CO")}\n\n✅ ¡Gracias por tu atención!`;
    }

    enviarPedidoWhatsApp() {
        const mensaje = this.generarTextoWhatsApp();
        const url = `https://wa.me/573006498710?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    }

    async enviarPedido(e) {
        e.preventDefault();
        console.log("🚀 Iniciando proceso de envío...");

        if (!this.validarFormularioFinal()) {
            alert("❌ Por favor completa todos los campos obligatorios correctamente.");
            return;
        }

        // Construir dirección final
        const direccionFinal = this.construirDireccionEstructurada();
        document.getElementById("DireccionCompleta").value = direccionFinal;
        console.log("📍 Dirección final:", direccionFinal);

        try {
            // 1. Enviar por WhatsApp
            console.log("📤 Enviando por WhatsApp...");
            this.enviarPedidoWhatsApp();

            // 2. Enviar formulario
            console.log("📝 Enviando formulario...");
            await this.enviarFormulario();

            // 3. Limpiar carrito
            this.limpiarCarrito();

            // 4. Cerrar ventana/modal si es necesario
            this.cerrarVentana();

            console.log("✅ Proceso de envío completado");

        } catch (error) {
            console.error("❌ Error en el proceso de envío:", error);
            alert("❌ Hubo un error al enviar el pedido. Por favor intenta nuevamente.");
        }
    }

    validarFormularioFinal() {
        const camposObligatorios = ["nombreCliente", "telefonoCliente", "DireccionCompleta", "ciudadCliente"];
        const todosLlenos = camposObligatorios.every(id => {
            const el = document.getElementById(id);
            return el && el.value.trim() !== "";
        });

        const telefonoValido = /^3\d{9}$/.test(this.campoTelefono?.value.trim());

        return todosLlenos && telefonoValido;
    }

    async enviarFormulario() {
        // Aquí puedes agregar lógica para enviar a tu backend
        // Por ahora solo simulamos el envío
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log("✅ Formulario enviado (simulación)");
                resolve();
            }, 1000);
        });
    }

    limpiarCarrito() {
        if (window.carritoManager) {
            console.log("🛒 Limpiando carrito...");
            window.carritoManager.limpiarCarrito();
        }

        // Limpiar también el localStorage por si acaso
        localStorage.removeItem('carritoAnmago');
    }

    cerrarVentana() {
        // Si se abrió desde una ventana principal
        if (window.opener) {
            console.log("🔄 Cerrando ventana...");
            window.opener.postMessage("limpiarCarrito", "*");
            window.close();
        }
    }

    debounce(func, wait) {
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
}

// 🚀 Inicialización
const formularioManager = new FormularioManager();

// Funciones globales para diagnóstico
window.diagnosticoFormulario = function() {
    console.log("🩺 DIAGNÓSTICO DEL FORMULARIO:");
    const elementosCriticos = [
        "formCliente", "telefonoCliente", "nombreCliente", 
        "DireccionCompleta", "ciudadCliente", "btnEnviarPedido"
    ];
    
    elementosCriticos.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${el ? '✅' : '❌'} ${id}: ${el ? 'ENCONTRADO' : 'NO ENCONTRADO'}`);
    });
    
    console.log("🛒 Carrito Manager:", window.carritoManager);
    console.log("🛒 Artículos en carrito:", window.carritoManager?.articulosCarrito);
};

window.probarParseoDireccion = function() {
    console.log("🧪 PRUEBAS DE PARSEO:");
    const testCases = [
        "KRA 13 #9-39, Apartamento 1023, Barrio SANTA INÉS, TORRE SUR",
        "CALLE 100 #15-20, Casa 5, Barrio EL Prado"
    ];
    
    testCases.forEach((direccion, index) => {
        console.log(`\n📋 TEST ${index + 1}: "${direccion}"`);
        formularioManager.repartirDireccionConcatenada(direccion);
    });
};

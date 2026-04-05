// ========== SISTEMA DE PLANES Y LÍMITES ==========
// Versión: 8.0
// Autor: DARIEN TATTOO

const PLANES = {
    GRATIS: {
        nombre: "Gratis",
        duracion_dias: 25,
        max_productos: 7,
        max_fotos_galeria: 5,
        cambiar_fotos_por_dia: 1,
        puede_editar: true,
        destacado: false,
        precio: "0 CUP"
    },
    BASICO: {
        nombre: "Básico",
        duracion_dias: 30,
        max_productos: 7,
        max_fotos_galeria: 6,
        cambiar_fotos_por_dia: 3,
        puede_editar: true,
        destacado: true,
        destacado_dias: 15,
        precio: "1000 CUP"
    },
    PREMIUM: {
        nombre: "Premium",
        duracion_dias: 30,
        max_productos: 15,
        max_fotos_galeria: 8,
        cambiar_fotos_por_dia: 5,
        puede_editar: true,
        destacado: true,
        destacado_dias: 30,
        precio: "2000 CUP"
    },
    EXITO_LOCAL: {
        nombre: "Éxito Local",
        duracion_dias: 40,
        max_productos: 15,
        max_fotos_galeria: 10,
        cambiar_fotos_por_dia: 10,
        puede_editar: true,
        destacado: true,
        destacado_dias: 40,
        precio: "3000 CUP",
        exclusivo: true,
        cupos_totales: 5
    }
};

// ========== CONTROL DE LANZAMIENTO ==========
let totalTiendasGlobal = 0;

function actualizarTotalTiendas(total) {
    totalTiendasGlobal = total;
}

function estaEnFaseLanzamiento() {
    return totalTiendasGlobal < 30;
}

// ========== FUNCIONES DE CONTROL DIARIO ==========
function obtenerFechaHoy() {
    return new Date().toISOString().split('T')[0];
}

function puedeBorrarFotoHoy(negocioId, planTipo) {
    const hoy = obtenerFechaHoy();
    const key = `borrados_${negocioId}_${hoy}`;
    const borradosHoy = parseInt(localStorage.getItem(key) || '0');
    
    const limites = {
        gratis: 1,
        basico: 3,
        premium: 5,
        exito_local: 10
    };
    
    const maxBorrar = limites[planTipo] || 1;
    return borradosHoy < maxBorrar;
}

function registrarBorradoFoto(negocioId) {
    const hoy = obtenerFechaHoy();
    const key = `borrados_${negocioId}_${hoy}`;
    const borradosHoy = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, borradosHoy + 1);
}

function puedeAgregarFotoHoy(negocioId, planTipo) {
    const hoy = obtenerFechaHoy();
    const key = `agregados_${negocioId}_${hoy}`;
    const agregadosHoy = parseInt(localStorage.getItem(key) || '0');
    
    const limites = {
        gratis: 1,
        basico: 3,
        premium: 5,
        exito_local: 10
    };
    
    const maxAgregar = limites[planTipo] || 1;
    return agregadosHoy < maxAgregar;
}

function registrarAgregadoFoto(negocioId) {
    const hoy = obtenerFechaHoy();
    const key = `agregados_${negocioId}_${hoy}`;
    const agregadosHoy = parseInt(localStorage.getItem(key) || '0');
    localStorage.setItem(key, agregadosHoy + 1);
}

// ========== FUNCIONES DE PLANES ==========
function guardarFechaRegistro(negocioId) {
    const hoy = new Date().toISOString();
    localStorage.setItem(`fecha_registro_${negocioId}`, hoy);
    return hoy;
}

function obtenerPlanStorage(negocioId) {
    // ========== FASE DE LANZAMIENTO (menos de 30 tiendas) ==========
    if (estaEnFaseLanzamiento()) {
        return {
            nombre: "🔥 LANZAMIENTO",
            diasRestantes: null,
            puedeEditar: true,
            maxProductos: 15,
            maxFotosGaleria: 8,
            cambiarFotosPorDia: 5,
            destacado: true,
            esLanzamiento: true,
            mensaje: "🔥 Beneficios máximos hasta llegar a 30 tiendas"
        };
    }
    
    // ========== FASE NORMAL ==========
    const fechaRegistro = localStorage.getItem(`fecha_registro_${negocioId}`);
    if (!fechaRegistro) return { 
        nombre: "Gratis", 
        diasRestantes: 25, 
        puedeEditar: true, 
        maxProductos: 7, 
        maxFotosGaleria: 5,
        cambiarFotosPorDia: 1,
        destacado: false 
    };
    
    const registro = new Date(fechaRegistro);
    const hoy = new Date();
    const diasTranscurridos = Math.floor((hoy - registro) / (1000 * 60 * 60 * 24));
    const planActivo = localStorage.getItem(`plan_${negocioId}`);
    
    // Planes pagados
    if (planActivo === 'basico') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) {
            return { 
                nombre: "Básico", 
                diasRestantes, 
                puedeEditar: true, 
                maxProductos: 7, 
                maxFotosGaleria: 6,
                cambiarFotosPorDia: 3,
                destacado: true 
            };
        }
    }
    
    if (planActivo === 'premium') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) {
            return { 
                nombre: "Premium", 
                diasRestantes, 
                puedeEditar: true, 
                maxProductos: 15, 
                maxFotosGaleria: 8,
                cambiarFotosPorDia: 5,
                destacado: true 
            };
        }
    }
    
    if (planActivo === 'exito_local') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 40 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) {
            return { 
                nombre: "Éxito Local", 
                diasRestantes, 
                puedeEditar: true, 
                maxProductos: 15, 
                maxFotosGaleria: 10,
                cambiarFotosPorDia: 10,
                destacado: true 
            };
        }
    }
    
    // Plan Gratis (25 días)
    if (diasTranscurridos < 25) {
        return { 
            nombre: "Gratis", 
            diasRestantes: 25 - diasTranscurridos, 
            puedeEditar: true, 
            maxProductos: 7, 
            maxFotosGaleria: 5,
            cambiarFotosPorDia: 1,
            destacado: false 
        };
    }
    
    // Después de los 25 días - Sigue visible pero limitado
    return { 
        nombre: "Gratis (Vencido)", 
        diasRestantes: 0, 
        puedeEditar: true, 
        maxProductos: 7, 
        maxFotosGaleria: 5,
        cambiarFotosPorDia: 1,
        destacado: false 
    };
}

function obtenerPlan(negocioId) {
    const plan = obtenerPlanStorage(negocioId);
    if (plan.nombre === "🔥 LANZAMIENTO") return PLANES.PREMIUM;
    if (plan.nombre === "Gratis" || plan.nombre === "Gratis (Vencido)") return PLANES.GRATIS;
    if (plan.nombre === "Básico") return PLANES.BASICO;
    if (plan.nombre === "Premium") return PLANES.PREMIUM;
    if (plan.nombre === "Éxito Local") return PLANES.EXITO_LOCAL;
    return PLANES.GRATIS;
}

function obtenerLimites(negocioId) {
    const plan = obtenerPlanStorage(negocioId);
    return {
        max_productos: plan.maxProductos,
        max_fotos: plan.maxFotosGaleria,
        cambiar_fotos_por_dia: plan.cambiarFotosPorDia,
        puede_actualizar: plan.puedeEditar,
        destacado: plan.destacado,
        esLanzamiento: plan.esLanzamiento || false,
        mensaje: plan.esLanzamiento ? 
            "🔥 FASE DE LANZAMIENTO: Beneficios máximos hasta 30 tiendas" :
            `📋 Plan: ${plan.nombre} | Productos: ${plan.maxProductos} | Fotos: ${plan.maxFotosGaleria} | Cambiar: ${plan.cambiarFotosPorDia}/día`
    };
}

function renovarPlan(negocioId, tipo) {
    const planesMap = {
        basico: { nombre: "Básico", precio: "1000 CUP", duracion: 30, maxProductos: 7, maxFotos: 6, cambiarPorDia: 3 },
        premium: { nombre: "Premium", precio: "2000 CUP", duracion: 30, maxProductos: 15, maxFotos: 8, cambiarPorDia: 5 },
        exito_local: { nombre: "Éxito Local", precio: "3000 CUP", duracion: 40, maxProductos: 15, maxFotos: 10, cambiarPorDia: 10 }
    };
    
    const plan = planesMap[tipo];
    if (!plan) return;
    
    if (confirm(`¿Renovar ${plan.nombre} por ${plan.precio}?\n\n📆 ${plan.duracion} días\n📦 ${plan.maxProductos} productos\n📸 ${plan.maxFotos} fotos\n🔄 Cambiar ${plan.cambiarPorDia} fotos/día`)) {
        localStorage.setItem(`plan_${negocioId}`, tipo);
        localStorage.setItem(`fecha_pago_${negocioId}`, new Date().toISOString());
        if (typeof mostrarToast === 'function') mostrarToast(`✅ ${plan.nombre} activado por ${plan.duracion} días`);
        location.reload();
    }
}

function getCuposExitoLocal() {
    const usados = parseInt(localStorage.getItem('cupos_exito_local_usados') || '0');
    return 5 - usados;
}

function hayCuposExitoLocal() {
    return getCuposExitoLocal() > 0;
}

function activarPlanExitoLocal(negocioId) {
    if (!hayCuposExitoLocal()) {
        if (typeof mostrarToast === 'function') mostrarToast("❌ Cupos agotados para el Plan Éxito Local");
        return false;
    }
    
    localStorage.setItem(`plan_${negocioId}`, 'exito_local');
    localStorage.setItem(`fecha_pago_${negocioId}`, new Date().toISOString());
    
    const usados = parseInt(localStorage.getItem('cupos_exito_local_usados') || '0');
    localStorage.setItem('cupos_exito_local_usados', usados + 1);
    
    if (typeof mostrarToast === 'function') mostrarToast(`✅ Plan Éxito Local activado. Cupos restantes: ${getCuposExitoLocal()}`);
    return true;
}

// ========== EXPORTAR ==========
if (typeof window !== 'undefined') {
    window.PLANES = PLANES;
    window.guardarFechaRegistro = guardarFechaRegistro;
    window.obtenerPlan = obtenerPlan;
    window.obtenerPlanStorage = obtenerPlanStorage;
    window.obtenerLimites = obtenerLimites;
    window.renovarPlan = renovarPlan;
    window.puedeBorrarFotoHoy = puedeBorrarFotoHoy;
    window.registrarBorradoFoto = registrarBorradoFoto;
    window.puedeAgregarFotoHoy = puedeAgregarFotoHoy;
    window.registrarAgregadoFoto = registrarAgregadoFoto;
    window.getCuposExitoLocal = getCuposExitoLocal;
    window.hayCuposExitoLocal = hayCuposExitoLocal;
    window.activarPlanExitoLocal = activarPlanExitoLocal;
    window.actualizarTotalTiendas = actualizarTotalTiendas;
    window.estaEnFaseLanzamiento = estaEnFaseLanzamiento;
                            }

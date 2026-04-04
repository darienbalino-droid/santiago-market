// ========== SISTEMA DE PLANES Y LÍMITES ==========
// Versión: 7.0
// Autor: DARIEN TATTOO

const PLANES = {
    GRATIS_PRUEBA: {
        nombre: "Prueba Gratis",
        duracion_dias: 20,
        max_productos: 7,
        max_fotos: 0,
        puede_editar: true,
        destacado: false,
        destacado_gratis_dias: 0
    },
    BASICO: {
        nombre: "Plan Básico",
        duracion_dias: 30,
        max_productos: 7,
        max_fotos: 0,
        puede_editar: true,
        destacado: true,
        destacado_gratis_dias: 15,
        precio: "1000 CUP"
    },
    PREMIUM: {
        nombre: "Plan Premium",
        duracion_dias: 30,
        max_productos: 15,
        max_fotos: 0,
        puede_editar: true,
        destacado: true,
        destacado_gratis_dias: 0,
        precio: "2000 CUP"
    },
    EXITO_LOCAL: {
        nombre: "Éxito Local",
        duracion_dias: 40,
        max_productos: 15,
        max_fotos: 10,
        puede_editar: true,
        destacado: true,
        destacado_gratis_dias: 0,
        precio: "3000 CUP",
        exclusivo: true,
        cupos_totales: 5
    }
};

// ========== FUNCIONES DE PLANES ==========

function guardarFechaRegistro(negocioId) {
    const hoy = new Date().toISOString();
    localStorage.setItem(`fecha_registro_${negocioId}`, hoy);
    return hoy;
}

function obtenerPlan(negocioId) {
    const fechaRegistro = localStorage.getItem(`fecha_registro_${negocioId}`);
    if (!fechaRegistro) return PLANES.GRATIS_PRUEBA;
    
    const fechaRegistroDate = new Date(fechaRegistro);
    const hoy = new Date();
    const diasTranscurridos = Math.floor((hoy - fechaRegistroDate) / (1000 * 60 * 60 * 24));
    
    const planActivo = localStorage.getItem(`plan_${negocioId}`);
    
    if (planActivo === 'basico') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) return PLANES.BASICO;
    }
    
    if (planActivo === 'premium') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) return PLANES.PREMIUM;
    }
    
    if (planActivo === 'exito_local') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 40 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) return PLANES.EXITO_LOCAL;
    }
    
    if (diasTranscurridos < 20) {
        return PLANES.GRATIS_PRUEBA;
    }
    
    return PLANES.GRATIS_PRUEBA;
}

function obtenerPlanStorage(negocioId) {
    const fechaRegistro = localStorage.getItem(`fecha_registro_${negocioId}`);
    if (!fechaRegistro) return { nombre: "Prueba Gratis", diasRestantes: 20, puedeEditar: true, maxProductos: 7, maxFotos: 0, destacado: false };
    
    const registro = new Date(fechaRegistro);
    const hoy = new Date();
    const diasTranscurridos = Math.floor((hoy - registro) / (1000 * 60 * 60 * 24));
    const planActivo = localStorage.getItem(`plan_${negocioId}`);
    
    if (planActivo === 'basico') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) {
            return { nombre: "Plan Básico", diasRestantes, puedeEditar: true, maxProductos: 7, maxFotos: 0, destacado: true, destacadoGratisDias: 15 };
        }
    }
    
    if (planActivo === 'premium') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 30 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) {
            return { nombre: "Plan Premium", diasRestantes, puedeEditar: true, maxProductos: 15, maxFotos: 0, destacado: true };
        }
    }
    
    if (planActivo === 'exito_local') {
        const fechaPago = new Date(localStorage.getItem(`fecha_pago_${negocioId}`));
        const diasRestantes = 40 - Math.floor((hoy - fechaPago) / (1000 * 60 * 60 * 24));
        if (diasRestantes > 0) {
            return { nombre: "Éxito Local", diasRestantes, puedeEditar: true, maxProductos: 15, maxFotos: 10, destacado: true };
        }
    }
    
    if (diasTranscurridos < 20) {
        return { nombre: "Prueba Gratis", diasRestantes: 20 - diasTranscurridos, puedeEditar: true, maxProductos: 7, maxFotos: 0, destacado: false };
    }
    
    return { nombre: "Vencido", diasRestantes: 0, puedeEditar: false, maxProductos: 0, maxFotos: 0, destacado: false };
}

// ========== CUPOS LIMITADOS PARA PLAN ÉXITO LOCAL ==========
function getCuposExitoLocal() {
    const usados = parseInt(localStorage.getItem('cupos_exito_local_usados') || '0');
    const total = 5;
    return total - usados;
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

// ========== FUNCIONES GENERALES ==========
function puedeAgregarProducto(negocioId, productosActuales) {
    const plan = obtenerPlan(negocioId);
    return productosActuales.length < plan.max_productos;
}

function puedeAgregarFoto(negocioId, fotosActuales) {
    const plan = obtenerPlan(negocioId);
    return fotosActuales.length < plan.max_fotos;
}

function obtenerLimites(negocioId) {
    const plan = obtenerPlan(negocioId);
    return {
        max_productos: plan.max_productos,
        max_fotos: plan.max_fotos,
        puede_actualizar: plan.puede_editar,
        destacado: plan.destacado,
        mensaje: `📋 Plan: ${plan.nombre} | Productos: ${plan.max_productos} | Fotos: ${plan.max_fotos}`
    };
}

function renovarPlan(negocioId, tipo) {
    const planesMap = {
        basico: { nombre: "Básico", precio: "500 CUP", duracion: 30, maxProductos: 7, maxFotos: 0 },
        premium: { nombre: "Premium", precio: "1500 CUP", duracion: 30, maxProductos: 15, maxFotos: 0 }
    };
    
    const plan = planesMap[tipo];
    if (!plan) return;
    
    if (confirm(`¿Renovar Plan ${plan.nombre} por ${plan.precio}? (${plan.duracion} días, ${plan.maxProductos} productos)`)) {
        localStorage.setItem(`plan_${negocioId}`, tipo);
        localStorage.setItem(`fecha_pago_${negocioId}`, new Date().toISOString());
        if (typeof mostrarToast === 'function') mostrarToast(`✅ Plan ${plan.nombre} activado por ${plan.duracion} días`);
        location.reload();
    }
}

function renovarPlanPremium(negocioId) {
    renovarPlan(negocioId, 'premium');
}

// ========== EXPORTAR ==========
if (typeof window !== 'undefined') {
    window.PLANES = PLANES;
    window.guardarFechaRegistro = guardarFechaRegistro;
    window.obtenerPlan = obtenerPlan;
    window.obtenerPlanStorage = obtenerPlanStorage;
    window.puedeAgregarProducto = puedeAgregarProducto;
    window.puedeAgregarFoto = puedeAgregarFoto;
    window.obtenerLimites = obtenerLimites;
    window.renovarPlan = renovarPlan;
    window.renovarPlanPremium = renovarPlanPremium;
    window.getCuposExitoLocal = getCuposExitoLocal;
    window.hayCuposExitoLocal = hayCuposExitoLocal;
    window.activarPlanExitoLocal = activarPlanExitoLocal;
}
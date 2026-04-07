// ========== VARIABLES GLOBALES ==========
let todosLosNegocios = [];
let datosCargados = false;

// ========== LIMPIAR NÚMEROS ==========
function limpiarNumero(numero) {
    if (!numero) return "";
    return numero.toString().replace(/\D/g, '');
}

// ========== ESCAPE HTML ==========
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== CACHÉ DESACTIVADO (siempre datos frescos desde Supabase) ==========
function guardarNegociosEnCache(negocios) {
    // CACHÉ DESACTIVADO - No guardamos nada en local
    console.log("🗑️ Caché desactivado - no se guardan datos locales");
    return;
}

function cargarNegociosDesdeCache() {
    // CACHÉ DESACTIVADO - Siempre carga desde Supabase
    console.log("🗑️ Caché desactivado - cargando datos frescos desde Supabase...");
    return null;
}

// ========== RATING ==========
function obtenerRating(id) {
    const saved = localStorage.getItem(`rating_${id}`);
    if (saved) return JSON.parse(saved);
    return { promedio: 0, total: 0, suma: 0 };
}

function guardarRating(id, valor) {
    const data = obtenerRating(id);
    const userVoteKey = `user_vote_${id}`;
    const votoAnterior = localStorage.getItem(userVoteKey);
    if (votoAnterior) { data.suma -= parseInt(votoAnterior); data.total -= 1; }
    data.suma = (data.suma || 0) + valor;
    data.total = (data.total || 0) + 1;
    data.promedio = data.suma / data.total;
    localStorage.setItem(`rating_${id}`, JSON.stringify(data));
    localStorage.setItem(userVoteKey, valor);
}

async function votarEstrella(id, valor, event) {
    if (event) event.stopPropagation();
    guardarRating(id, valor);
    if (typeof guardarValoracionEnSupabase === 'function') {
        await guardarValoracionEnSupabase(id, valor);
    }
    if (typeof renderizarNegocios === 'function') renderizarNegocios();
    mostrarToast(`⭐ Calificaste con ${valor} estrellas`);
}

// ========== VISITAS GLOBALES CON SUPABASE ==========
async function registrarVisita(idNegocio, nombreNegocio) {
    // Registrar visita al negocio específico (opcional, se puede implementar después)
    // Por ahora solo registramos la visita global de la app
    
    // Obtener estadísticas actuales
    const visitasGlobales = await obtenerVisitasGlobales();
    
    return {
        total: visitasGlobales,
        hoy: visitasGlobales,
        semana: visitasGlobales,
        ultimaVisita: new Date().toLocaleString()
    };
}

async function getVisits() {
    return await obtenerVisitasGlobales();
}

async function incrementVisits() {
    const nuevasVisitas = await incrementarVisitasGlobales();
    return nuevasVisitas;
}

// ========== TOAST ==========
function mostrarToast(mensaje, duracion = 2500) {
    const toastAnterior = document.querySelector('.toast-message');
    if (toastAnterior) toastAnterior.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<span style="flex:1; text-align:center;">${mensaje}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
    document.body.appendChild(toast);
    
    setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
        }
    }, duracion);
}

// ========== NOTIFICACIONES ==========
async function solicitarPermisoNotificaciones() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') mostrarToast('✅ Notificaciones activadas');
    }
}

function mostrarNotificacion(nombreNegocio) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🆕 Nuevo negocio en Santiago Market', {
            body: `${nombreNegocio} se ha registrado. ¡Revísalo ahora!`,
            icon: IMAGEN_POR_DEFECTO
        });
    }
}

// ========== CORREGIR LINKS ==========
function corregirLinkDrive(url) {
    if (!url) return IMAGEN_POR_DEFECTO;
    var urlStr = url.toString();
    
    if (urlStr.includes("postimg.cc") && !urlStr.includes("i.postimg.cc")) {
        return urlStr.replace("postimg.cc", "i.postimg.cc") + ".jpg";
    }
    if (urlStr.includes('open?id=')) {
        var id = urlStr.split('open?id=')[1].split('&')[0];
        return "https://lh3.googleusercontent.com/u/0/d/" + id;
    }
    if (urlStr.includes('drive.google.com')) {
        var match = urlStr.match(/[-\w]{25,}/);
        if (match) return "https://lh3.googleusercontent.com/u/0/d/" + match[0];
    }
    return urlStr;
}

function limpiarCategoria(cat) {
    if (!cat) return "todos";
    let c = cat.toString().toLowerCase();
    if (c.includes("mypime") || c.includes("mipime")) return "mypime";
    if (c.includes("moda") || c.includes("ropa")) return "moda";
    if (c.includes("ferreteria") || c.includes("ferretería")) return "ferreteria";
    if (c.includes("restaurante") || c.includes("cafetería") || c.includes("cafeteria")) return "restaurante";
    if (c.includes("taller") || c.includes("celulares")) return "taller";
    if (c.includes("venta") || c.includes("casa")) return "ventacasa";
    if (c.includes("otros")) return "otros";
    if (c.includes("oferta")) return "ofertas";
    return "todos";
}

// ========== INICIALIZACIÓN SIN CACHÉ (siempre desde Supabase) ==========
async function cargarNegociosInteligente() {
    console.log("🔄 Cargando datos frescos desde Supabase (caché desactivado)...");
    
    // Cargar directamente desde Supabase
    if (typeof cargarNegociosDesdeSupabase === 'function') {
        try {
            const negociosNuevos = await cargarNegociosDesdeSupabase();
            if (negociosNuevos && negociosNuevos.length > 0) {
                todosLosNegocios = negociosNuevos;
                if (typeof renderizarNegocios === 'function') renderizarNegocios();
                mostrarToast(`✅ ${negociosNuevos.length} negocios cargados`);
                datosCargados = true;
                
                // Actualizar contador para fase de lanzamiento
                if (typeof actualizarTotalTiendas === 'function') {
                    actualizarTotalTiendas(todosLosNegocios.length);
                }
            } else {
                todosLosNegocios = [];
                if (typeof renderizarNegocios === 'function') renderizarNegocios();
                datosCargados = true;
            }
        } catch (error) {
            console.error("Error cargando desde Supabase:", error);
            mostrarToast("⚠️ Error de conexión, intenta de nuevo");
            if (!datosCargados) {
                todosLosNegocios = [];
                if (typeof renderizarNegocios === 'function') renderizarNegocios();
            }
        }
    }
}

// ========== ABRIR NEGOCIO DIRECTO DESDE URL ==========
function abrirNegocioPorUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const negocioId = urlParams.get('negocio');
    
    if (negocioId) {
        const esperar = setInterval(() => {
            if (todosLosNegocios && todosLosNegocios.length > 0) {
                clearInterval(esperar);
                const negocio = todosLosNegocios.find(n => n.id == negocioId);
                if (negocio) {
                    setTimeout(() => {
                        if (typeof abrirModalMenu === 'function') {
                            abrirModalMenu(negocio.id);
                        }
                    }, 800);
                    console.log("📱 Abriendo negocio directo:", negocio.nombre);
                }
            }
        }, 300);
        
        setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 1000);
    }
}

async function inicializarApp() {
    try {
        console.log("🚀 Iniciando Santiago Market v8.0 (sin caché)...");
        
        // Mostrar splash y progreso
        const progressFill = document.getElementById('progressFill');
        if (progressFill) progressFill.style.width = "30%";
        
        // Limpiar cualquier caché residual
        localStorage.removeItem('santiago_market_cache');
        localStorage.removeItem('santiago_market_cache_v2');
        console.log("🗑️ Caché residual limpiado");
        
        // Cargar negocios desde Supabase
        await cargarNegociosInteligente();
        
        // Incrementar contador global de visitas
        await incrementVisits();
        
        // Abrir negocio directo si viene por URL
        abrirNegocioPorUrl();
        
        if (progressFill) progressFill.style.width = "100%";
        
        // Ocultar splash y mostrar app
        setTimeout(() => {
            const splash = document.getElementById('splash');
            const main = document.getElementById('mainContent');
            if (splash) splash.style.display = 'none';
            if (main) main.style.display = 'block';
        }, 500);
        
    } catch (error) {
        console.error("Error al arrancar la App:", error);
        mostrarToast("❌ Error al conectar, revisa tu conexión");
        
        setTimeout(() => {
            const splash = document.getElementById('splash');
            const main = document.getElementById('mainContent');
            if (splash) splash.style.display = 'none';
            if (main) main.style.display = 'block';
        }, 500);
    }
}

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);

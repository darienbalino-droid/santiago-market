// ========== VARIABLES GLOBALES ==========
let todosLosNegocios = [];

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

// ========== VISITAS ==========
function registrarVisita(idNegocio, nombreNegocio) {
    const hoy = new Date().toISOString().split('T')[0];
    const fechaCompleta = new Date().toLocaleString();
    let data = localStorage.getItem(`visitas_${idNegocio}`);
    if (!data) {
        data = { total: 0, hoy: 0, semana: 0, ultimaVisita: null, historial: {} };
    } else {
        data = JSON.parse(data);
    }
    data.total++;
    data.hoy = (data.historial[hoy] || 0) + 1;
    data.historial[hoy] = data.hoy;
    const semanaKeys = Object.keys(data.historial).filter(fecha => {
        const diff = (new Date() - new Date(fecha)) / (1000 * 60 * 60 * 24);
        return diff <= 7;
    });
    data.semana = semanaKeys.reduce((sum, key) => sum + data.historial[key], 0);
    data.ultimaVisita = fechaCompleta;
    localStorage.setItem(`visitas_${idNegocio}`, JSON.stringify(data));
    return data;
}

function getVisits() {
    let visits = localStorage.getItem('app_visits');
    return visits === null ? 0 : parseInt(visits);
}

function incrementVisits() {
    let visits = getVisits();
    visits++;
    localStorage.setItem('app_visits', visits);
    return visits;
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

// ========== INICIALIZACIÓN ==========
async function inicializarApp() {
    try {
        console.log("🚀 Iniciando Santiago Market...");
        const progressFill = document.getElementById('progressFill');
        if (progressFill) progressFill.style.width = "30%";

        if (typeof cargarNegociosDesdeSupabase === 'function') {
            todosLosNegocios = await cargarNegociosDesdeSupabase();
        }

        if (progressFill) progressFill.style.width = "100%";
        if (typeof renderizarNegocios === 'function') renderizarNegocios();

        setTimeout(() => {
            const splash = document.getElementById('splash');
            const main = document.getElementById('mainContent');
            if (splash) splash.style.display = 'none';
            if (main) main.style.display = 'block';
        }, 500);
    } catch (error) {
        console.error("Error al arrancar la App:", error);
        mostrarToast("❌ Error al conectar con la base de datos");
    }
}

document.addEventListener('DOMContentLoaded', inicializarApp);
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

// ========== CACHÉ DE NEGOCIOS ==========
function guardarNegociosEnCache(negocios) {
    try {
        const cacheData = {
            negocios: negocios,
            timestamp: Date.now(),
            version: "v8.0"
        };
        localStorage.setItem('santiago_market_cache_v8', JSON.stringify(cacheData));
        console.log("💾 Negocios guardados en caché");
    } catch (error) {
        console.error("Error guardando caché:", error);
    }
}

function cargarNegociosDesdeCache() {
    try {
        const cacheData = localStorage.getItem('santiago_market_cache_v8');
        if (!cacheData) return null;
        
        const data = JSON.parse(cacheData);
        const tiempoTranscurrido = Date.now() - data.timestamp;
        const UNA_HORA = 60 * 60 * 1000; // 1 hora
        
        if (tiempoTranscurrido < UNA_HORA) {
            console.log("📦 Usando caché de negocios (menos de 1 hora)");
            return data.negocios;
        } else {
            console.log("🕐 Caché expirado (más de 1 hora)");
            return null;
        }
    } catch (error) {
        console.error("Error cargando caché:", error);
        return null;
    }
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

// ========== VISITAS POR NEGOCIO CON SUPABASE ==========
async function registrarVisita(idNegocio, nombreNegocio) {
    try {
        const { data: existente, error: errorGet } = await db
            .from('visitas_negocios')
            .select('visitas')
            .eq('negocio_id', idNegocio)
            .single();
        
        let nuevasVisitas = 1;
        
        if (existente) {
            nuevasVisitas = (existente.visitas || 0) + 1;
            await db
                .from('visitas_negocios')
                .update({ visitas: nuevasVisitas, ultima_visita: new Date() })
                .eq('negocio_id', idNegocio);
        } else {
            await db
                .from('visitas_negocios')
                .insert({ negocio_id: idNegocio, visitas: 1, ultima_visita: new Date() });
        }
        
        const { data: actualizado } = await db
            .from('visitas_negocios')
            .select('visitas')
            .eq('negocio_id', idNegocio)
            .single();
        
        const visitasActuales = actualizado?.visitas || nuevasVisitas;
        
        return {
            total: visitasActuales,
            hoy: visitasActuales,
            semana: visitasActuales,
            ultimaVisita: new Date().toLocaleString()
        };
    } catch (error) {
        console.error("Error registrando visita:", error);
        return {
            total: 0,
            hoy: 0,
            semana: 0,
            ultimaVisita: 'Sin visitas aún'
        };
    }
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

// ========== INICIALIZACIÓN CON CACHÉ ==========
async function cargarNegociosInteligente() {
    console.log("🔄 Cargando negocios...");
    
    const negociosCache = cargarNegociosDesdeCache();
    if (negociosCache && negociosCache.length > 0) {
        todosLosNegocios = negociosCache;
        if (typeof renderizarNegocios === 'function') renderizarNegocios();
        mostrarToast(`✅ ${negociosCache.length} negocios (caché)`);
        datosCargados = true;
        
        if (typeof actualizarTotalTiendas === 'function') {
            actualizarTotalTiendas(todosLosNegocios.length);
        }
        
        actualizarNegociosEnSegundoPlano();
        return;
    }
    
    if (typeof cargarNegociosDesdeSupabase === 'function') {
        try {
            const negociosNuevos = await cargarNegociosDesdeSupabase();
            if (negociosNuevos && negociosNuevos.length > 0) {
                todosLosNegocios = negociosNuevos;
                guardarNegociosEnCache(negociosNuevos);
                if (typeof renderizarNegocios === 'function') renderizarNegocios();
                mostrarToast(`✅ ${negociosNuevos.length} negocios cargados`);
                datosCargados = true;
                
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
            mostrarToast("⚠️ Error de conexión, usando datos guardados");
            if (!datosCargados) {
                todosLosNegocios = [];
                if (typeof renderizarNegocios === 'function') renderizarNegocios();
            }
        }
    }
}

async function actualizarNegociosEnSegundoPlano() {
    try {
        if (typeof cargarNegociosDesdeSupabase === 'function') {
            const negociosNuevos = await cargarNegociosDesdeSupabase();
            if (negociosNuevos && negociosNuevos.length > 0) {
                todosLosNegocios = negociosNuevos;
                guardarNegociosEnCache(negociosNuevos);
                if (typeof renderizarNegocios === 'function') renderizarNegocios();
                console.log("🔄 Negocios actualizados en segundo plano");
            }
        }
    } catch (error) {
        console.error("Error actualizando en segundo plano:", error);
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
        console.log("🚀 Iniciando Santiago Market v8.0...");
        
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        let progreso = 0;
        const intervalo = setInterval(() => {
            progreso += Math.random() * 20;
            if (progreso >= 90) progreso = 90;
            if (progressFill) progressFill.style.width = progreso + '%';
            if (progressText) progressText.innerText = `Cargando ${Math.floor(progreso)}%`;
        }, 50);
        
        await cargarNegociosInteligente();
        
        clearInterval(intervalo);
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.innerText = 'Cargando 100%';
        
        await incrementVisits();
        
        abrirNegocioPorUrl();
        
        setTimeout(() => {
            const splash = document.getElementById('splash');
            const main = document.getElementById('mainContent');
            if (splash) splash.style.display = 'none';
            if (main) main.style.display = 'block';
        }, 300);
        
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

document.addEventListener('DOMContentLoaded', inicializarApp);

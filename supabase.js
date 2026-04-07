// ========== CONEXIÓN A SUPABASE ==========
const SUPABASE_URL = "https://kospieqzqwbjkjljchlu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wlulCYK54_osTvkhq5oNuA_PtRS5apR";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("✅ Supabase conectado");

// ========== CARGAR NEGOCIOS ==========
async function cargarNegociosDesdeSupabase() {
    try {
        console.log("🔄 Cargando negocios desde Supabase...");
        
        const { data: negocios, error: errorNegocios } = await db
            .from('negocios')
            .select('*');
        
        if (errorNegocios) {
            console.error("❌ Error cargando negocios:", errorNegocios);
            throw errorNegocios;
        }
        
        if (!negocios || negocios.length === 0) {
            console.log("📭 No hay negocios registrados");
            return [];
        }
        
        console.log(`📦 ${negocios.length} negocios encontrados`);
        
        for (let negocio of negocios) {
            // Cargar productos
            const { data: productos, error: errorProductos } = await db
                .from('Productos')
                .select('*')
                .eq('negocio_id', negocio.id);
            
            negocio.productos = (!errorProductos) ? (productos || []) : [];
            
            // Construir galería desde foto1 a foto10
            const galeria = [];
            for (let i = 1; i <= 10; i++) {
                const fotoKey = `foto${i}`;
                if (negocio[fotoKey] && negocio[fotoKey].trim() !== "" && negocio[fotoKey] !== "null") {
                    galeria.push(negocio[fotoKey]);
                }
            }
            negocio.galeria = galeria;
            
            // Foto principal
            if (negocio.foto1 && negocio.foto1 !== "null") {
                negocio.imagen = negocio.foto1;
            }
        }
        
        console.log(`✅ ${negocios.length} negocios listos`);
        return negocios;
        
    } catch (error) {
        console.error("❌ Error en Supabase:", error);
        return [];
    }
}

// ========== GUARDAR VALORACIÓN DE NEGOCIO ==========
async function guardarValoracionEnSupabase(negocioId, estrellas) {
    try {
        const { error } = await db
            .from('Valoraciones')
            .insert([{
                negocio_id: negocioId,
                estrellas: estrellas,
                fecha: new Date().toISOString()
            }]);
        
        if (error) throw error;
        console.log(`✅ Valoración de ${estrellas} estrellas guardada`);
        return true;
    } catch (error) {
        console.error("❌ Error valorando:", error);
        return false;
    }
}

// ========== SUBIR FOTO ==========
async function subirFotoSupabase(file, carpeta) {
    if (!file) return null;
    
    try {
        const fotoComprimida = await comprimirFoto(file);
        const nombreArchivo = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const ruta = `${carpeta}/${nombreArchivo}`;
        
        const { error } = await db.storage
            .from('negocios')
            .upload(ruta, fotoComprimida);
        
        if (error) throw error;
        
        const { data: urlData } = db.storage
            .from('negocios')
            .getPublicUrl(ruta);
            
        return urlData.publicUrl;
    } catch (error) {
        console.error("❌ Error subiendo imagen:", error);
        return null;
    }
}

// ========== COMPRIMIR FOTO ==========
function comprimirFoto(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > 600) {
                    height = (height * 600) / width;
                    width = 600;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.5);
            };
        };
    });
}

// ========== CONTADOR GLOBAL DE LA APP (SUPABASE) ==========
async function obtenerVisitasGlobales() {
    try {
        const { data, error } = await db
            .from('estadisticas')
            .select('visitas_totales')
            .eq('id', 1)
            .single();
        
        if (error) throw error;
        return data?.visitas_totales || 0;
    } catch (error) {
        console.error("Error obteniendo visitas globales:", error);
        return 0;
    }
}

async function incrementarVisitasGlobales() {
    try {
        const { data, error } = await db
            .from('estadisticas')
            .select('visitas_totales')
            .eq('id', 1)
            .single();
        
        if (error) throw error;
        
        const nuevasVisitas = (data?.visitas_totales || 0) + 1;
        
        const { error: updateError } = await db
            .from('estadisticas')
            .update({ visitas_totales: nuevasVisitas })
            .eq('id', 1);
        
        if (updateError) throw updateError;
        
        console.log(`📊 Visitas totales: ${nuevasVisitas}`);
        return nuevasVisitas;
    } catch (error) {
        console.error("Error incrementando visitas globales:", error);
        return 0;
    }
}

// ========== VALORACIONES DE LA APP ==========
async function guardarValoracionApp(puntuacion) {
    try {
        const { error } = await db
            .from('valoraciones_app')
            .insert([{
                puntuacion: puntuacion,
                fecha: new Date().toISOString(),
                user_agent: navigator.userAgent
            }]);
        
        if (error) throw error;
        console.log(`✅ Valoración de la APP: ${puntuacion} estrellas`);
        return true;
    } catch (error) {
        console.error("❌ Error guardando valoración de la APP:", error);
        return false;
    }
}

async function obtenerEstadisticasApp() {
    try {
        const { data, error } = await db
            .from('estadisticas_app')
            .select('*')
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        return {
            total_valoraciones: 0,
            promedio: 0,
            estrellas_5: 0,
            estrellas_4: 0,
            estrellas_3: 0,
            estrellas_2: 0,
            estrellas_1: 0
        };
    }
}

// ========== EXPORTAR ==========
if (typeof window !== 'undefined') {
    window.db = db;
    window.cargarNegociosDesdeSupabase = cargarNegociosDesdeSupabase;
    window.guardarValoracionEnSupabase = guardarValoracionEnSupabase;
    window.subirFotoSupabase = subirFotoSupabase;
    window.comprimirFoto = comprimirFoto;
    window.obtenerVisitasGlobales = obtenerVisitasGlobales;
    window.incrementarVisitasGlobales = incrementarVisitasGlobales;
    window.guardarValoracionApp = guardarValoracionApp;
    window.obtenerEstadisticasApp = obtenerEstadisticasApp;
    console.log("✅ Supabase.js cargado correctamente");
            }

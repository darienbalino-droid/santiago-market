// ========== CONEXIÓN A SUPABASE ==========
const SUPABASE_URL = "https://kospieqzqwbjkjljchlu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wlulCYK54_osTvkhq5oNuA_PtRS5apR";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========== CARGAR NEGOCIOS ==========
async function cargarNegociosDesdeSupabase() {
    try {
        if (typeof mostrarToast === 'function') mostrarToast("🔄 Cargando datos...");
        
        const { data: negocios, error: errorNegocios } = await db
            .from('negocios')
            .select('*');
        
        if (errorNegocios) throw errorNegocios;
        
        if (!negocios || negocios.length === 0) return [];
        
        for (let negocio of negocios) {
            const { data: productos, error: errorProductos } = await db
                .from('Productos')
                .select('*')
                .eq('negocio_id', negocio.id);
            
            negocio.productos = (!errorProductos) ? (productos || []) : [];
            
            const galeria = [
                negocio.foto1, negocio.foto2, negocio.foto3, 
                negocio.foto4, negocio.foto5
            ].filter(f => f && f.trim() !== "");
            negocio.galeria = galeria;
        }
        
        if (typeof mostrarToast === 'function') mostrarToast(`✅ ${negocios.length} negocios listos`);
        return negocios;
        
    } catch (error) {
        console.error("Error en Supabase:", error);
        return [];
    }
}

// ========== GUARDAR VALORACIÓN ==========
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
        return true;
    } catch (error) {
        console.error("Error valorando:", error);
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
        console.error("Error subiendo imagen:", error);
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
                if (width > 800) {
                    height = (height * 800) / width;
                    width = 800;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
            };
        };
    });
}

// Exportar
if (typeof window !== 'undefined') {
    window.db = db;
    window.cargarNegociosDesdeSupabase = cargarNegociosDesdeSupabase;
    window.guardarValoracionEnSupabase = guardarValoracionEnSupabase;
    window.subirFotoSupabase = subirFotoSupabase;
    window.comprimirFoto = comprimirFoto;
}
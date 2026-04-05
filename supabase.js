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
            // Cargar productos
            const { data: productos, error: errorProductos } = await db
                .from('Productos')
                .select('*')
                .eq('negocio_id', negocio.id);
            
            negocio.productos = (!errorProductos) ? (productos || []) : [];
            
            // Cargar galería (hasta foto10)
            const galeria = [];
            for (let i = 1; i <= 10; i++) {
                const fotoKey = `foto${i}`;
                if (negocio[fotoKey] && negocio[fotoKey].trim() !== "" && negocio[fotoKey] !== "null") {
                    galeria.push(negocio[fotoKey]);
                }
            }
            negocio.galeria = galeria;
            
            // Log para depuración
            console.log(`📸 ${negocio.nombre}: ${galeria.length} fotos cargadas`);
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

// ========== ACTUALIZAR FOTO DE NEGOCIO ==========
async function actualizarFotoNegocio(negocioId, fotoUrl, numeroFoto = 1) {
    try {
        const updateData = {};
        updateData[`foto${numeroFoto}`] = fotoUrl;
        
        const { error } = await db
            .from('negocios')
            .update(updateData)
            .eq('id', negocioId);
        
        if (error) throw error;
        console.log(`✅ Foto ${numeroFoto} actualizada para negocio ${negocioId}`);
        return true;
    } catch (error) {
        console.error("Error actualizando foto:", error);
        return false;
    }
}

// ========== SUBIR Y ASIGNAR FOTO A NEGOCIO ==========
async function subirYAsignarFoto(file, negocioId, numeroFoto = 1) {
    const fotoUrl = await subirFotoSupabase(file, `negocios/${negocioId}`);
    if (fotoUrl) {
        await actualizarFotoNegocio(negocioId, fotoUrl, numeroFoto);
        return fotoUrl;
    }
    return null;
}

// Exportar
if (typeof window !== 'undefined') {
    window.db = db;
    window.cargarNegociosDesdeSupabase = cargarNegociosDesdeSupabase;
    window.guardarValoracionEnSupabase = guardarValoracionEnSupabase;
    window.subirFotoSupabase = subirFotoSupabase;
    window.comprimirFoto = comprimirFoto;
    window.actualizarFotoNegocio = actualizarFotoNegocio;
    window.subirYAsignarFoto = subirYAsignarFoto;
}

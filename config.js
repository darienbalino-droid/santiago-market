// ========== CONFIGURACIÓN CENTRAL DE SANTIAGO MARKET ==========
// Versión: 7.0
// Autor: DARIEN TATTOO

const CONFIG = {
    VERSION: "v7.0",
    AUTOR: "DARIEN TATTOO",
    
    URL_GOOGLE: "https://script.google.com/macros/s/AKfycbyGjQj08RP1XegmezDRrOfYQrgc2q3Duao2u921M5JCWwwAG6wyySfQoTZo9J7lq2Zu/exec",
    
    WHATSAPP_SOPORTE: "5352466224",
    NUMERO_SOPORTE: "+53 52466224",
    
    MAX_FOTOS_POR_NEGOCIO: 5,
    MAX_PRODUCTOS_POR_NEGOCIO: 10,
    CALIDAD_COMPRESION: 0.7,
    ANCHO_MAXIMO_FOTO: 800,
    
    CATEGORIAS: [
        { id: "todos", nombre: "📱 Todos", icono: "📱" },
        { id: "mypime", nombre: "🏪 Mypimes", icono: "🏪" },
        { id: "moda", nombre: "👕 Ropa y Moda", icono: "👕" },
        { id: "ferreteria", nombre: "🔧 Ferreterías", icono: "🔧" },
        { id: "restaurante", nombre: "🍽️ Restaurantes y Cafetería", icono: "🍽️" },
        { id: "taller", nombre: "📱 Talleres Celulares", icono: "📱" },
        { id: "ventacasa", nombre: "🏠 Ventas de Casa", icono: "🏠" },
        { id: "otros", nombre: "📦 Otros", icono: "📦" },
        { id: "ofertas", nombre: "🔥 Ofertas del día", icono: "🔥" }
    ],
    
    PLANES: [
        { nombre: "GRATIS", precio: "0 CUP", duracion: "Ilimitado", badge: "🆓", fotos: 5, destacado: false },
        { nombre: "DESTACADO", precio: "500 CUP", duracion: "30 días", badge: "🔥", fotos: 20, destacado: true },
        { nombre: "PREMIUM", precio: "1500 CUP", duracion: "30 días", badge: "👑", fotos: 100, destacado: true }
    ],
    
    NEGOCIOS_LOCALES: []
};

// ========== ÚNICA DECLARACIÓN DE IMAGEN POR DEFECTO ==========
const IMAGEN_POR_DEFECTO = "https://i.postimg.cc/RZTS3mg7/1774530222644.png";

if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.IMAGEN_POR_DEFECTO = IMAGEN_POR_DEFECTO;
}
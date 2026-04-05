// ========== CONFIGURACIÓN CENTRAL DE SANTIAGO MARKET ==========
// Versión: 8.0
// Autor: DARIEN TATTOO

const CONFIG = {
    VERSION: "v8.0",
    AUTOR: "DARIEN TATTOO",
    
    URL_GOOGLE: "https://script.google.com/macros/s/AKfycbyGjQj08RP1XegmezDRrOfYQrgc2q3Duao2u921M5JCWwwAG6wyySfQoTZo9J7lq2Zu/exec",
    
    WHATSAPP_SOPORTE: "5352466224",
    NUMERO_SOPORTE: "+53 52466224",
    
    MAX_FOTOS_POR_NEGOCIO: 10,
    MAX_PRODUCTOS_POR_NEGOCIO: 15,
    CALIDAD_COMPRESION: 0.5,
    ANCHO_MAXIMO_FOTO: 600,
    
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
    
    // ========== PLANES DEFINITIVOS ==========
    PLANES: [
        { 
            nombre: "GRATIS", 
            precio: "0 CUP", 
            duracion: "25 días", 
            productos: 7, 
            fotos: 5,
            cambiar_fotos_dia: 1,
            destacado: false,
            badge: "🆓"
        },
        { 
            nombre: "BÁSICO", 
            precio: "1000 CUP", 
            duracion: "30 días", 
            productos: 7, 
            fotos: 6,
            cambiar_fotos_dia: 3,
            destacado: true,
            destacado_dias: 15,
            badge: "🔥"
        },
        { 
            nombre: "PREMIUM", 
            precio: "2000 CUP", 
            duracion: "30 días", 
            productos: 15, 
            fotos: 8,
            cambiar_fotos_dia: 5,
            destacado: true,
            destacado_dias: 30,
            badge: "👑"
        },
        { 
            nombre: "ÉXITO LOCAL", 
            precio: "3000 CUP", 
            duracion: "40 días", 
            productos: 15, 
            fotos: 10,
            cambiar_fotos_dia: 10,
            destacado: true,
            destacado_dias: 40,
            badge: "✨",
            exclusivo: true,
            cupos: 5
        }
    ],
    
    NEGOCIOS_LOCALES: []
};

const IMAGEN_POR_DEFECTO = "https://i.postimg.cc/RZTS3mg7/1774530222644.png";

if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.IMAGEN_POR_DEFECTO = IMAGEN_POR_DEFECTO;
}

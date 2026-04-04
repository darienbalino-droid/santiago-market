// ========== EVENT LISTENERS ==========
function inicializarEventListeners() {
    document.getElementById('btnAyuda')?.addEventListener('click', toggleAyuda);
    document.getElementById('btnSettings')?.addEventListener('click', toggleSettings);
    document.getElementById('closeAyuda')?.addEventListener('click', toggleAyuda);
    document.getElementById('btnEntendido')?.addEventListener('click', toggleAyuda);
    document.getElementById('closeMenu')?.addEventListener('click', cerrarModalMenu);
    document.getElementById('closeSettings')?.addEventListener('click', toggleSettings);
    document.getElementById('optionTheme')?.addEventListener('click', toggleTheme);
    document.getElementById('optionRating')?.addEventListener('click', mostrarValoracionApp);
    document.getElementById('optionReset')?.addEventListener('click', reiniciarValoraciones);
    document.getElementById('optionShare')?.addEventListener('click', compartirApp);
    document.getElementById('optionSupport')?.addEventListener('click', contactarSoporte);
    document.getElementById('optionAbout')?.addEventListener('click', acercaDe);
    document.getElementById('optionCredits')?.addEventListener('click', mostrarCreditos);
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const categoria = chip.getAttribute('data-cat');
            filtrarPorCategoria(categoria, chip);
        });
    });
    document.getElementById('buscador')?.addEventListener('input', filtrarNegocios);
    document.querySelectorAll('#appStars .app-star').forEach(star => {
        star.addEventListener('click', () => valorarApp(parseInt(star.getAttribute('data-value'))));
    });
    
    window.onclick = (event) => {
        if (event.target === document.getElementById('modalMenu')) document.getElementById('modalMenu').style.display = 'none';
        if (event.target === document.getElementById('modalAyuda')) document.getElementById('modalAyuda').style.display = 'none';
        if (event.target === document.getElementById('settingsPanel')) document.getElementById('settingsPanel').style.display = 'none';
    };
}

function iniciarSplash() {
    let progreso = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const interval = setInterval(() => {
        progreso += Math.random() * 15;
        if (progreso >= 100) { progreso = 100; clearInterval(interval); }
        progressFill.style.width = progreso + '%';
        progressText.innerText = `Cargando ${Math.floor(progreso)}%`;
        if (progreso >= 100) {
            setTimeout(() => {
                document.getElementById('splash').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('splash').style.display = 'none';
                    document.getElementById('mainContent').style.display = 'block';
                    document.getElementById('visitCountDisplay').innerText = incrementVisits() + ' visitas';
                    setTimeout(() => mostrarToast('✨ ¡Bienvenido a Santiago Market v7.0! ✨'), 500);
                    setTimeout(() => solicitarPermisoNotificaciones(), 2000);
                }, 500);
            }, 500);
        }
    }, 100);
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('themeStatus').innerText = '☀️ Claro';
    }
    
    const appRated = localStorage.getItem('app_rated');
    if (appRated === 'true') {
        const rating = parseInt(localStorage.getItem('app_rating') || '0');
        if (rating > 0) {
            setTimeout(() => {
                document.querySelectorAll('#appStars .app-star').forEach((star, index) => {
                    if (index < rating) star.classList.add('active');
                });
                document.getElementById('ratingMessage').innerText = `¡Gracias por tu valoración de ${rating} estrellas! 🌟`;
            }, 100);
        }
    }
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        document.getElementById('visitCountDisplay').innerText = getVisits() + ' visitas';
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeStatus = document.getElementById('themeStatus');
    if (document.body.classList.contains('light-mode')) {
        themeStatus.innerText = '☀️ Claro';
        localStorage.setItem('theme', 'light');
        mostrarToast('☀️ Modo claro activado');
    } else {
        themeStatus.innerText = '🌙 Oscuro';
        localStorage.setItem('theme', 'dark');
        mostrarToast('🌙 Modo oscuro activado');
    }
}

function toggleAyuda() {
    const modal = document.getElementById('modalAyuda');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function mostrarValoracionApp() {
    const section = document.getElementById('appRatingSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

function valorarApp(puntuacion) {
    localStorage.setItem('app_rating', puntuacion);
    localStorage.setItem('app_rated', 'true');
    document.querySelectorAll('#appStars .app-star').forEach((star, index) => {
        if (index < puntuacion) star.classList.add('active');
        else star.classList.remove('active');
    });
    document.getElementById('ratingMessage').innerText = `¡Gracias por tu valoración de ${puntuacion} estrellas! 🌟`;
    mostrarToast(`⭐ Valoraste la app con ${puntuacion} estrellas`);
    setTimeout(() => document.getElementById('ratingMessage').innerText = 'Toca las estrellas para valorar', 3000);
}

function reiniciarValoraciones() {
    if (confirm('¿Reiniciar todas las valoraciones?')) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => { if (key.startsWith('rating_') || key.startsWith('user_vote_')) localStorage.removeItem(key); });
        renderizarNegocios();
        mostrarToast('✅ Valoraciones reiniciadas');
    }
}

function compartirApp() {
    if (navigator.share) {
        navigator.share({ title: 'Santiago Market v7.0', url: window.location.href });
    } else {
        navigator.clipboard.writeText(window.location.href);
        mostrarToast('📋 Enlace copiado');
    }
    toggleSettings();
}

function contactarSoporte() { 
    window.open('https://wa.me/5352466224?text=Hola%20necesito%20ayuda%20con%20Santiago%20Market%20v7.0', '_blank'); 
    toggleSettings();
}

function acercaDe() { 
    alert('Santiago Market v7.0\n\n✅ Buscador con subrayado\n✅ Filtros por categoría\n✅ Panel de control\n✅ Sistema de planes\n✅ Conectado a Supabase\n\nPlataforma para conectar la comunidad con los negocios locales.\n\nDesarrollado con ❤️ para Santiago de las Vegas.'); 
    toggleSettings();
}

function mostrarCreditos() { 
    alert('✨ Créditos v7.0 ✨\n\nDesarrollado por: Darien Tattoo\n\nAgradecimientos: Negocios que confían en nosotros\nComunidad de Santiago\nSupabase Database\n\nGracias a todos los que hacen esto posible.'); 
    toggleSettings();
}

async function inicializarApp() {
    let negociosSupabase = [];
    let negociosGoogle = [];
    
    if (typeof cargarNegociosDesdeSupabase === 'function') {
        negociosSupabase = await cargarNegociosDesdeSupabase();
    }
    
    if (typeof cargarNegociosDesdeGoogle === 'function') {
        negociosGoogle = await cargarNegociosDesdeGoogle();
    }
    
    if (negociosSupabase && negociosSupabase.length > 0) {
        todosLosNegocios = negociosSupabase;
    } else if (negociosGoogle && negociosGoogle.length > 0) {
        todosLosNegocios = negociosGoogle;
    } else if (CONFIG && CONFIG.NEGOCIOS_LOCALES) {
        todosLosNegocios = [...CONFIG.NEGOCIOS_LOCALES];
    } else {
        todosLosNegocios = [];
    }
    
    if (typeof renderizarNegocios === 'function') {
        renderizarNegocios();
    }
    
    iniciarSplash();
    inicializarEventListeners();
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});
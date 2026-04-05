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

// APLICAR TEMA ANTES DE QUE CARGUE EL SPLASH
function aplicarTemaInicial() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        document.body.style.backgroundColor = '#ffffff';
    } else {
        // PRIMERA VEZ O TEMA OSCURO
        document.body.classList.add('dark-mode');
        document.body.style.backgroundColor = '#0f172a';
        if (!savedTheme) {
            localStorage.setItem('theme', 'dark');
        }
    }
    
    const themeStatus = document.getElementById('themeStatus');
    if (themeStatus) {
        if (document.body.classList.contains('dark-mode')) {
            themeStatus.innerText = '🌙 Oscuro';
        } else {
            themeStatus.innerText = '☀️ Claro';
        }
    }
}

function iniciarSplash() {
    // APLICAR TEMA INMEDIATAMENTE
    aplicarTemaInicial();
    
    let progreso = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const interval = setInterval(() => {
        progreso += Math.random() * 15;
        if (progreso >= 100) { progreso = 100; clearInterval(interval); }
        if (progressFill) progressFill.style.width = progreso + '%';
        if (progressText) progressText.innerText = `Cargando ${Math.floor(progreso)}%`;
        if (progreso >= 100) {
            setTimeout(() => {
                const splash = document.getElementById('splash');
                const main = document.getElementById('mainContent');
                if (splash) splash.style.opacity = '0';
                setTimeout(() => {
                    if (splash) splash.style.display = 'none';
                    if (main) main.style.display = 'block';
                    const visitDisplay = document.getElementById('visitCountDisplay');
                    if (visitDisplay) visitDisplay.innerText = incrementVisits() + ' visitas';
                    setTimeout(() => mostrarToast('✨ ¡Bienvenido a Santiago Market v8.0! ✨'), 500);
                    setTimeout(() => solicitarPermisoNotificaciones(), 2000);
                }, 500);
            }, 500);
        }
    }, 100);
    
    const appRated = localStorage.getItem('app_rated');
    if (appRated === 'true') {
        const rating = parseInt(localStorage.getItem('app_rating') || '0');
        if (rating > 0) {
            setTimeout(() => {
                document.querySelectorAll('#appStars .app-star').forEach((star, index) => {
                    if (index < rating) star.classList.add('active');
                });
                const ratingMsg = document.getElementById('ratingMessage');
                if (ratingMsg) ratingMsg.innerText = `¡Gracias por tu valoración de ${rating} estrellas! 🌟`;
            }, 100);
        }
    }
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel) {
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
            const visitDisplay = document.getElementById('visitCountDisplay');
            if (visitDisplay) visitDisplay.innerText = getVisits() + ' visitas';
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeStatus = document.getElementById('themeStatus');
    if (document.body.classList.contains('dark-mode')) {
        if (themeStatus) themeStatus.innerText = '🌙 Oscuro';
        localStorage.setItem('theme', 'dark');
        document.body.style.backgroundColor = '#0f172a';
        mostrarToast('🌙 Modo oscuro activado');
    } else {
        if (themeStatus) themeStatus.innerText = '☀️ Claro';
        localStorage.setItem('theme', 'light');
        document.body.style.backgroundColor = '#ffffff';
        mostrarToast('☀️ Modo claro activado');
    }
}

function toggleAyuda() {
    const modal = document.getElementById('modalAyuda');
    if (modal) {
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    }
}

function mostrarValoracionApp() {
    const section = document.getElementById('appRatingSection');
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

function valorarApp(puntuacion) {
    localStorage.setItem('app_rating', puntuacion);
    localStorage.setItem('app_rated', 'true');
    document.querySelectorAll('#appStars .app-star').forEach((star, index) => {
        if (index < puntuacion) star.classList.add('active');
        else star.classList.remove('active');
    });
    const ratingMsg = document.getElementById('ratingMessage');
    if (ratingMsg) ratingMsg.innerText = `¡Gracias por tu valoración de ${puntuacion} estrellas! 🌟`;
    mostrarToast(`⭐ Valoraste la app con ${puntuacion} estrellas`);
    setTimeout(() => {
        const msg = document.getElementById('ratingMessage');
        if (msg) msg.innerText = 'Toca las estrellas para valorar';
    }, 3000);
}

function reiniciarValoraciones() {
    if (confirm('¿Reiniciar todas las valoraciones de negocios?')) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => { 
            if (key.startsWith('rating_') || key.startsWith('user_vote_')) localStorage.removeItem(key); 
        });
        if (typeof renderizarNegocios === 'function') renderizarNegocios();
        mostrarToast('✅ Valoraciones de negocios reiniciadas');
    }
}

function compartirApp() {
    const url = 'https://darienbalino-droid.github.io/santiago-market/';
    if (navigator.share) {
        navigator.share({ title: 'Santiago Market', url: url });
    } else {
        navigator.clipboard.writeText(url);
        mostrarToast('📋 Enlace copiado');
    }
    toggleSettings();
}

function contactarSoporte() { 
    window.open('https://wa.me/5352466224?text=Hola%20necesito%20ayuda%20con%20Santiago%20Market', '_blank'); 
    toggleSettings();
}

function acercaDe() { 
    alert('Santiago Market v8.0\n\nPlataforma para conectar la comunidad con los negocios locales.\n\n✨ Novedades:\n• ❤️ Sistema de favoritos\n• 🏆 Top 10 mejor valorados\n• 📦 Carga rápida con caché local\n• 🗺️ Ubicación por dirección escrita\n\nDesarrollado con ❤️ para Santiago de las Vegas.'); 
    toggleSettings();
}

function mostrarCreditos() { 
    alert('✨ CRÉDITOS ✨\n\n📱 Desarrollo: Darien Tattoo\n💡 Idea original: Comunidad de Santiago\n🗄️ Base de datos: Supabase\n🎨 Diseño: Santiago Market Team\n\n🙏 Gracias a todos los negocios que confían en nosotros\ny a la comunidad que hace crecer esto cada día.\n\n🌟 Santiago de las Vegas, Cuba 🌟'); 
    toggleSettings();
}

// ========== EVITAR REINICIO AL DESLIZAR HACIA ATRÁS ==========
window.addEventListener('popstate', function(event) {
    event.preventDefault();
});

// ========== INICIALIZACIÓN ÚNICA ==========
async function inicializarAppEvents() {
    setTimeout(() => {
        inicializarEventListeners();
    }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarAppEvents();
});

let currentCategory = "todos";

function resaltarTexto(texto, busqueda) {
    if (!busqueda || !texto) return escapeHtml(texto);
    const regex = new RegExp(`(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(texto).replace(regex, `<mark style="background-color: #f1c40f; color: #0f172a; padding: 0 2px; border-radius: 4px;">$1</mark>`);
}

function renderizarNegocios() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;
    if (!todosLosNegocios || todosLosNegocios.length === 0) {
        grid.innerHTML = `<div class="no-results">🔄 Cargando negocios...</div>`;
        return;
    }
    
    let filtered = todosLosNegocios;
    if (currentCategory !== "todos") {
        if (currentCategory === "ofertas") filtered = filtered.filter(n => n.oferta === true);
        else if (currentCategory === "otros") filtered = filtered.filter(n => !['restaurante','ferreteria','taller','ventacasa','moda','mypime'].includes(n.categoria));
        else filtered = filtered.filter(n => n.categoria === currentCategory);
    }
    
    const busqueda = document.getElementById('buscador')?.value.toLowerCase() || "";
    if (busqueda) {
        filtered = filtered.filter(n => {
            if (n.nombre?.toLowerCase().includes(busqueda)) return true;
            if (n.direccion?.toLowerCase().includes(busqueda)) return true;
            if (n.descripcion?.toLowerCase().includes(busqueda)) return true;
            if (n.productos && n.productos.length > 0) {
                for (let p of n.productos) {
                    if (p.nombre?.toLowerCase().includes(busqueda)) return true;
                }
            }
            return false;
        });
    }
    
    if (filtered.length === 0) { 
        grid.innerHTML = '<div class="no-results">🔍 No encontramos negocios aquí.<br><br>¡Sé el primero en inscribir tu negocio!</div>'; 
        return; 
    }
    
    grid.innerHTML = filtered.map(n => {
        const rating = obtenerRating(n.id);
        const catLabel = { restaurante: '🍽️ RESTAURANTE', ferreteria: '🔧 FERRETERÍA', taller: '📱 TALLER', ventacasa: '🏠 VENTA DE CASA', moda: '👕 MODA', mypime: '🏪 MYPIME', otros: '📦 OTROS' }[n.categoria] || '🏪 NEGOCIO';
        let fotoPrincipal = n.oferta && n.foto_dia ? n.foto_dia : (n.imagen || n.foto1 || '');
        if (fotoPrincipal.includes("postimg.cc") && !fotoPrincipal.includes("i.postimg.cc")) {
            fotoPrincipal = fotoPrincipal.replace("postimg.cc", "i.postimg.cc") + ".jpg";
        }
        if (!fotoPrincipal) fotoPrincipal = IMAGEN_POR_DEFECTO;
        const tieneGaleria = n.galeria?.length > 0;
        const esOferta = n.oferta === true;
        let estrellasHtml = '';
        for (let i = 1; i <= 5; i++) {
            const isActive = i <= Math.round(rating.promedio);
            estrellasHtml += `<span class="star ${isActive ? 'active' : ''}" onclick="votarEstrella('${n.id}', ${i}, event)">★</span>`;
        }
        const waLink = n.whatsapp ? `https://wa.me/${limpiarNumero(n.whatsapp)}` : '#';
        return `
            <div class="card">
                <div style="position: relative;">
                    <img loading="lazy" src="${fotoPrincipal}" class="card-img" onclick="toggleGaleria('gal-${n.id}')" onerror="this.onerror=null; this.src='${IMAGEN_POR_DEFECTO}';">
                    <div class="badge">${esOferta ? '🔥 OFERTA' : catLabel}</div>
                </div>
                <div class="card-content">
                    <div class="card-title">${resaltarTexto(n.nombre, busqueda)} ${esOferta ? '<span style="color:#f1c40f;">🔥</span>' : ''}</div>
                    <div class="card-loc">📍 ${resaltarTexto(n.direccion, busqueda)}</div>
                    <div class="card-desc">${resaltarTexto(n.descripcion || '', busqueda)}</div>
                    <div class="horario" onclick="mostrarHorario('${escapeHtml(n.horario || 'Consultar')}')">🕒 ${escapeHtml(n.horario || 'Consultar')}</div>
                    <div class="rating-container">
                        <div class="stars" onclick="event.stopPropagation()">${estrellasHtml}</div>
                        <div class="rating-average">(${rating.total || 0})</div>
                    </div>
                    <div class="btn-menu-precios" onclick="abrirModalMenu('${n.id}')">🍽️ MENÚ Y PRECIOS</div>
                    <div class="btn-group">
                        ${n.whatsapp ? `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn-action">💬 WhatsApp</a>` : ''}
                        <a href="${n.maps || '#'}" target="_blank" rel="noopener noreferrer" class="btn-maps">🗺️ GPS</a>
                        ${n.telefono ? `<a href="tel:${limpiarNumero(n.telefono)}" class="btn-call">📞 Llamar</a>` : ''}
                        <button class="btn-share" onclick="compartirNegocio('${escapeHtml(n.nombre)}', '${escapeHtml(n.direccion)}', '${n.whatsapp}')">📤 Compartir</button>
                    </div>
                </div>
                ${tieneGaleria ? `<div id="gal-${n.id}" class="galeria"><div class="grid-fotos">${n.galeria.map(img => {
                    let f = img;
                    if (f.includes("postimg.cc") && !f.includes("i.postimg.cc")) f = f.replace("postimg.cc", "i.postimg.cc") + ".jpg";
                    return `<img loading="lazy" src="${f}" onclick="window.open(this.src)" onerror="this.src='${IMAGEN_POR_DEFECTO}'">`;
                }).join('')}</div></div>` : ''}
            </div>
        `;
    }).join('');
}

function filtrarPorCategoria(categoria, elemento) {
    currentCategory = categoria;
    document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
    if (elemento) elemento.classList.add('active');
    renderizarNegocios();
    mostrarToast('Categoría: ' + (elemento ? elemento.innerText : categoria));
}

function filtrarNegocios() { renderizarNegocios(); }
function toggleGaleria(id) { const g = document.getElementById(id); if (g) g.style.display = g.style.display === 'block' ? 'none' : 'block'; }

function abrirModalMenu(id) {
    const negocio = todosLosNegocios.find(n => n.id === id);
    if (!negocio) return;
    const stats = registrarVisita(id, negocio.nombre);
    
    document.getElementById('modalNombre').innerHTML = `${escapeHtml(negocio.nombre)} <span style="float: right; cursor: pointer; font-size: 22px; background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 30px;" onclick="pedirCodigoEdicion('${negocio.codigo}', '${negocio.id}')">⚙️</span>`;
    document.getElementById('modalDireccion').innerHTML = `📍 ${escapeHtml(negocio.direccion)}`;
    
    const statsHtml = `<div style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 12px; margin-bottom: 16px;"><div style="display: flex; justify-content: space-around; gap: 10px;"><div style="text-align: center;"><strong style="font-size: 20px; color: #28a745;">${stats.total}</strong><br><span style="font-size: 10px;">👁️ Total</span></div><div style="text-align: center;"><strong style="font-size: 20px; color: #28a745;">${stats.hoy}</strong><br><span style="font-size: 10px;">📅 Hoy</span></div><div style="text-align: center;"><strong style="font-size: 20px; color: #28a745;">${stats.semana}</strong><br><span style="font-size: 10px;">📆 Semana</span></div></div><div style="font-size: 10px; text-align: center; margin-top: 8px; color: #94a3b8;">🕒 Última visita: ${stats.ultimaVisita || 'Sin visitas aún'}</div></div>`;
    
    const productosDiv = document.getElementById('modalProductos');
    if (negocio.productos && negocio.productos.length > 0) {
        productosDiv.innerHTML = '<h4 style="color:var(--oro-market); margin-bottom:10px;">🍽️ Menú</h4>' + negocio.productos.map(p => `<li><span class="producto-nombre">${escapeHtml(p.nombre)}</span><span class="producto-precio">${escapeHtml(p.precio)}</span></li>`).join('');
    } else {
        productosDiv.innerHTML = '<p style="color:var(--texto-gris-oscuro); text-align:center;">📝 Próximamente más productos...<br>El dueño está actualizando el menú.</p>';
    }
    
    const galeriaDiv = document.getElementById('modalGaleria');
    if (negocio.galeria && negocio.galeria.length > 0) {
        galeriaDiv.innerHTML = negocio.galeria.map(img => { let f = img; if (f.includes("postimg.cc") && !f.includes("i.postimg.cc")) f = f.replace("postimg.cc", "i.postimg.cc") + ".jpg"; return `<img src="${f}" onclick="window.open(this.src)" onerror="this.src='${IMAGEN_POR_DEFECTO}'">`; }).join('');
    } else { galeriaDiv.innerHTML = ''; }
    
    const botonesDiv = document.getElementById('modalBotones');
    const numeroSoporte = "5352466224";
    const mensajeWhatsApp = `🎯 SANTIAGO MARKET - PLANES DE DESTACADO 🎯

📌 PLAN BÁSICO - 1000 CUP
30 días - 7 productos - 1 foto - 15 días destacado

👑 PLAN PREMIUM - 2000 CUP
30 días - 15 productos - 3 fotos - Destacado siempre

✨ PLAN ÉXITO LOCAL - 3000 CUP
40 días - 15 productos - 10 fotos - Destacado siempre
🎟️ SOLO 5 CUPOS DISPONIBLES

Responde con: Basico, Premium o Exito Local

Santiago Market`;
    
    botonesDiv.innerHTML = `
        <div style="display: flex; gap: 8px; flex-wrap: wrap; width: 100%;">
            ${negocio.whatsapp ? `<a href="https://wa.me/${limpiarNumero(negocio.whatsapp)}?text=Hola%20vi%20tu%20negocio%20${encodeURIComponent(negocio.nombre)}%20en%20Santiago%20Market" target="_blank" rel="noopener noreferrer" class="modal-btn modal-btn-wa">💬 WhatsApp</a>` : ''}
            <a href="${negocio.maps || '#'}" target="_blank" rel="noopener noreferrer" class="modal-btn modal-btn-maps">🗺️ GPS</a>
            ${negocio.telefono ? `<a href="tel:${limpiarNumero(negocio.telefono)}" class="modal-btn modal-btn-call">📞 Llamar</a>` : ''}
        </div>
        <a href="https://wa.me/${numeroSoporte}?text=${encodeURIComponent(mensajeWhatsApp)}" target="_blank" rel="noopener noreferrer" class="modal-btn modal-btn-destacar">🔥 QUIERO DESTACAR MI NEGOCIO</a>
    `;
    
    const modalBody = document.querySelector('#modalMenu .modal-body');
    let existingStats = document.getElementById('modalStats');
    if (existingStats) existingStats.remove();
    const statsContainer = document.createElement('div');
    statsContainer.id = 'modalStats';
    statsContainer.innerHTML = statsHtml;
    modalBody.prepend(statsContainer);
    document.getElementById('modalMenu').style.display = 'flex';
}

// ✅ FUNCIÓN AGREGADA - Cierra el modal de menú
function cerrarModalMenu() { 
    const modal = document.getElementById('modalMenu');
    if (modal) modal.style.display = 'none'; 
}

function pedirCodigoEdicion(codigoReal, negocioId) {
    const codigoIngresado = prompt("🔐 Ingresa el código de acceso para editar este negocio:");
    if (codigoIngresado === codigoReal) {
        localStorage.setItem('codigo_edicion_temp', codigoReal);
        localStorage.setItem('negocio_id_temp', negocioId);
        window.location.href = 'panel.html';
    } else if (codigoIngresado) { mostrarToast("❌ Código incorrecto"); }
}

function compartirNegocio(nombre, direccion, whatsapp) {
    const texto = `🌟 ${nombre} - Santiago Market 🌟\n📍 ${direccion}\n📞 ${whatsapp ? 'WhatsApp: +53' + limpiarNumero(whatsapp) : 'Contáctanos'}\n\nDescubre más en Santiago Market`;
    if (navigator.share) { navigator.share({ title: nombre, text: texto }); } 
    else { navigator.clipboard.writeText(texto); mostrarToast(`📋 Información de ${nombre} copiada`); }
}

function mostrarHorario(horario) { mostrarToast(`🕒 Horario: ${horario}`); }
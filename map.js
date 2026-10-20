// map.js — Leaflet map centered on São Luís historic center + painel "Por perto"
import { getHistoricalData } from './historical-data.js';

const DEFAULT_CENTER = [-2.5297, -44.2990];

let mapInstance = null;
let markers = {};          // place.key -> L.marker
let activeKey = null;      // place.key do pino destacado
let pendingFocus = false;  // destaque feito com o mapa oculto: centraliza ao abrir
let hasBeenShown = false;
let userMarker = null;
let userPosition = null;
let onSelectPlace = null;

// Um pino por local. `classes` lista as outras classes do modelo que ficam no mesmo lugar.
const PLACES = [
    { key: 'monumento_goncalves_dias', classes: ['goncalves_dias_rosto'], lat: -2.5288, lng: -44.2984 },
    // Todos os bustos ficam juntos na Praça do Panteon (Praça Deodoro)
    {
        key: 'praca_panteon',
        classes: [
            'maria_firmina_busto', 'maria_firmina_rosto',
            'ferreira_gullar_busto', 'Ferreira_Gullar_Rosto',
            'artur_azevedo_busto',
            'Aluizio_Busto',
            'josue_montello_Busto',
            'humberto_de_campos_busto',
            'sousandrade_busto', 'Sousandrade_rosto',
            'bandeira_tribuzzi_busto',
            'urbano_santos_busto',
            'gomes_sousa_busto',
        ],
        lat: -2.529568, lng: -44.295818,
    },
    { key: 'leoes',                    classes: ['postePalacio_leoes'],   lat: -2.5270, lng: -44.2990 },
    { key: 'pedra_memoria',            lat: -2.5340, lng: -44.2920 },
    { key: 'fonte_ribeirao',           lat: -2.5290, lng: -44.2970 },
    { key: 'daniel_touche',            lat: -2.5265, lng: -44.3010 },
    { key: 'benedicto_leite',          lat: -2.5275, lng: -44.3005 },
    { key: 'canhaoreviver',            lat: -2.5280, lng: -44.3020 },
    { key: 'pescadores',               lat: -2.5450, lng: -44.2850 },
].map((place, i) => {
    const data = getHistoricalData(place.key);
    return { ...place, number: i + 1, name: data.name, subtitle: data.location };
});

function placeForClass(classKey) {
    return PLACES.find(p => p.key === classKey || p.classes?.includes(classKey));
}

function pinIcon(number, active = false) {
    const size = active ? 40 : 30;
    return L.divIcon({
        className: '',
        html: `<span class="mm-pin${active ? ' mm-pin--active' : ''}">${number}</span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

const userIcon = () => L.divIcon({
    className: '',
    html: '<span class="mm-user-dot"></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
});

function isMapVisible() {
    return Boolean(mapInstance && mapInstance.getContainer().offsetWidth > 0);
}

// ---------- Painel retrátil ----------

function isSheetCollapsed(sheet) {
    return sheet.classList.contains('is-collapsed');
}

// Altura que fica visível com o painel recolhido: alça + busca + espaço da barra de abas
function sheetPeekHeight(sheet) {
    const search = sheet.querySelector('.search-field');
    const nav = document.getElementById('bottom-nav');
    const navClearance = nav ? window.innerHeight - nav.getBoundingClientRect().top : 0;
    return search.offsetTop + search.offsetHeight + 14 + navClearance;
}

// Quanto do mapa o painel cobre (no estado final, mesmo durante a animação)
function sheetCoveredHeight() {
    const sheet = document.getElementById('map-sheet');
    if (!sheet) return 0;
    return isSheetCollapsed(sheet) ? sheetPeekHeight(sheet) : sheet.offsetHeight;
}

function setSheetCollapsed(collapsed) {
    const sheet = document.getElementById('map-sheet');
    const toggle = document.getElementById('sheet-toggle');
    if (!sheet || isSheetCollapsed(sheet) === collapsed) return;

    if (collapsed) sheet.style.setProperty('--sheet-peek', `${sheetPeekHeight(sheet)}px`);
    sheet.classList.toggle('is-collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Expandir lista de monumentos' : 'Recolher lista de monumentos');
    // A lista fica fora da tela quando recolhida: tira do foco do teclado
    sheet.querySelector('.mm-list-scroll').inert = collapsed;
}

function initSheetToggle() {
    const toggle = document.getElementById('sheet-toggle');
    if (!toggle) return;
    const sheet = document.getElementById('map-sheet');

    let startY = null;
    let swiped = false;

    toggle.addEventListener('pointerdown', e => {
        startY = e.clientY;
        toggle.setPointerCapture(e.pointerId);
    });
    toggle.addEventListener('pointerup', e => {
        if (startY === null) return;
        const dy = e.clientY - startY;
        startY = null;
        if (Math.abs(dy) > 24) {
            swiped = true;
            setSheetCollapsed(dy > 0);
        }
    });
    toggle.addEventListener('pointercancel', () => { startY = null; });
    toggle.addEventListener('click', () => {
        if (swiped) { swiped = false; return; }
        setSheetCollapsed(!isSheetCollapsed(sheet));
    });

    // Buscar abre o painel de novo
    document.getElementById('monument-search')?.addEventListener('focus', () => setSheetCollapsed(false));

    window.addEventListener('resize', () => {
        if (isSheetCollapsed(sheet)) sheet.style.setProperty('--sheet-peek', `${sheetPeekHeight(sheet)}px`);
    });
}

// Centraliza um ponto na área do mapa que fica acima do painel inferior
function panToVisible(latlng, animate = true) {
    const offsetY = sheetCoveredHeight() / 2;
    const zoom = mapInstance.getZoom();
    const target = mapInstance.unproject(mapInstance.project(latlng, zoom).add([0, offsetY]), zoom);
    mapInstance.panTo(target, { animate, duration: 0.6 });
}

// ---------- Painel "Por perto" ----------

function normalize(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function distanceMeters(a, b) {
    const R = 6371000;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistance(m) {
    if (m < 1000) return `${Math.round(m / 10) * 10} m`;
    return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function setHint(text) {
    const hint = document.getElementById('nearby-hint');
    if (!hint) return;
    hint.textContent = text;
    hint.classList.toggle('hidden', !text);
}

function renderList() {
    const list = document.getElementById('nearby-list');
    if (!list) return;

    const query = normalize(document.getElementById('monument-search')?.value.trim() || '');
    let places = PLACES.filter(p => !query || normalize(`${p.name} ${p.subtitle}`).includes(query));

    if (userPosition) {
        places = places
            .map(p => ({ ...p, distance: distanceMeters(userPosition, p) }))
            .sort((a, b) => a.distance - b.distance);
    }

    list.replaceChildren();

    if (places.length === 0) {
        list.append(el('li', 'mm-list-empty', 'Nenhum monumento encontrado.'));
        return;
    }

    places.forEach(place => {
        const row = el('button', 'mm-list-row');
        row.type = 'button';
        row.classList.toggle('is-active', place.key === activeKey);
        row.addEventListener('click', () => selectPlace(place));

        const badge = el('span', 'mm-list-badge', String(place.number));
        badge.setAttribute('aria-hidden', 'true');

        const text = el('span', 'mm-list-text');
        text.append(el('span', 'mm-list-title', place.name), el('span', 'mm-list-sub', place.subtitle));

        row.append(badge, text);

        if (typeof place.distance === 'number') {
            row.append(el('span', 'mm-list-distance', formatDistance(place.distance)));
        } else {
            const chevron = el('span', 'mm-list-chevron');
            chevron.setAttribute('aria-hidden', 'true');
            chevron.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"></path></svg>';
            row.append(chevron);
        }

        const item = el('li');
        item.append(row);
        list.append(item);
    });
}

function setActive(key) {
    if (activeKey && markers[activeKey]) {
        const prev = PLACES.find(p => p.key === activeKey);
        markers[activeKey].setIcon(pinIcon(prev.number)).setZIndexOffset(0);
    }
    activeKey = key;
    const place = PLACES.find(p => p.key === key);
    if (place && markers[key]) {
        markers[key].setIcon(pinIcon(place.number, true)).setZIndexOffset(1000);
    }
    renderList();
}

function selectPlace(place) {
    setActive(place.key);
    panToVisible([place.lat, place.lng]);
    onSelectPlace?.(place.key);
}

function locateUser() {
    const btn = document.getElementById('map-locate-btn');

    if (!('geolocation' in navigator)) {
        setHint('Localização indisponível neste aparelho.');
        return;
    }

    btn?.setAttribute('aria-busy', 'true');
    navigator.geolocation.getCurrentPosition(
        pos => {
            btn?.removeAttribute('aria-busy');
            userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };

            if (userMarker) userMarker.setLatLng(userPosition);
            else userMarker = L.marker(userPosition, { icon: userIcon(), interactive: false, keyboard: false }).addTo(mapInstance);

            panToVisible(userPosition);
            document.getElementById('nearby-title').textContent = 'Por perto';
            setHint('');
            renderList();
        },
        () => {
            btn?.removeAttribute('aria-busy');
            setHint('Não foi possível obter sua localização.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
}

// ---------- API ----------

export function initMap({ onSelect } = {}) {
    if (mapInstance) return;
    onSelectPlace = onSelect;

    mapInstance = L.map('map-bg', {
        center: DEFAULT_CENTER,
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
    });

    L.control.attribution({ position: 'topleft', prefix: false }).addTo(mapInstance);

    // OpenStreetMap (os tiles do CARTO passaram a exigir chave de API)
    L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
    ).addTo(mapInstance);

    // Plot all monument markers
    PLACES.forEach(place => {
        const marker = L.marker([place.lat, place.lng], { icon: pinIcon(place.number), title: place.name });
        marker.on('click', () => selectPlace(place));
        marker.addTo(mapInstance);
        markers[place.key] = marker;
    });

    document.getElementById('monument-search')?.addEventListener('input', renderList);
    document.getElementById('map-locate-btn')?.addEventListener('click', locateUser);
    initSheetToggle();
    renderList();

    if (isMapVisible()) invalidateMapSize();
}

// Chamado quando a aba Mapa fica visível
export function invalidateMapSize() {
    if (!mapInstance) return;
    mapInstance.invalidateSize();

    const active = PLACES.find(p => p.key === activeKey);
    if (pendingFocus && active) {
        panToVisible([active.lat, active.lng], false);
    } else if (!hasBeenShown) {
        panToVisible(DEFAULT_CENTER, false);
    }
    pendingFocus = false;
    hasBeenShown = true;
}

export function highlightMonumentOnMap(classKey, force = false) {
    if (!mapInstance) return;

    const place = placeForClass(classKey);
    if (!place) return;
    if (place.key === activeKey && !force) return;

    setActive(place.key);

    if (isMapVisible()) panToVisible([place.lat, place.lng]);
    else pendingFocus = true;
}

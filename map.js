// map.js — Leaflet map centered on São Luís historic center

let mapInstance = null;
let monumentMarkers = {};
let activeMarker = null;

// Monument coordinates (São Luís, MA)
const MONUMENT_COORDS = {
    "goncalves_dias_rosto":      { lat: -2.5288, lng: -44.2984 },
    "monumento_goncalves_dias":  { lat: -2.5288, lng: -44.2984 },
    "maria_firmina_busto":       { lat: -2.5301, lng: -44.2960 },
    "maria_firmina_rosto":       { lat: -2.5301, lng: -44.2960 },
    "leoes":                     { lat: -2.5270, lng: -44.2990 },
    "postePalacio_leoes":        { lat: -2.5270, lng: -44.2990 },
    "pedra_memoria":             { lat: -2.5340, lng: -44.2920 },
    "fonte_ribeirao":            { lat: -2.5290, lng: -44.2970 },
    "daniel_touche":             { lat: -2.5265, lng: -44.3010 },
    "benedicto_leite":           { lat: -2.5275, lng: -44.3005 },
    "ferreira_gullar_busto":     { lat: -2.5310, lng: -44.2945 },
    "artur_azevedo_busto":       { lat: -2.5285, lng: -44.2975 },
    "canhaoreviver":             { lat: -2.5280, lng: -44.3020 },
    "pescadores":                { lat: -2.5450, lng: -44.2850 },
};

// Custom crimson marker
function createMarker(active = false) {
    const color = active ? '#C9960A' : '#1A2E1A';
    const ring  = active ? '#FFD700' : 'rgba(255,255,255,0.9)';
    const size  = active ? 14 : 10;
    return L.divIcon({
        className: '',
        html: `
            <svg width="${size * 3}" height="${size * 3.5}" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0 C6.7 0 0 6.7 0 15 C0 26 15 40 15 40 C15 40 30 26 30 15 C30 6.7 23.3 0 15 0Z"
                      fill="${color}" stroke="${ring}" stroke-width="2"/>
                <circle cx="15" cy="15" r="5" fill="white" opacity="0.95"/>
            </svg>`,
        iconSize:   [size * 3, size * 3.5],
        iconAnchor: [size * 1.5, size * 3.5],
    });
}

export function initMap() {
    if (mapInstance) return;

    mapInstance = L.map('map-bg', {
        center: [-2.5297, -44.2990],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
    });

    // CartoDB Voyager — colorful, bright, detailed
    L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { subdomains: 'abcd', maxZoom: 19 }
    ).addTo(mapInstance);

    // Plot all monument markers
    Object.entries(MONUMENT_COORDS).forEach(([key, coords]) => {
        const marker = L.marker([coords.lat, coords.lng], { icon: createMarker(false) });
        marker.addTo(mapInstance);
        monumentMarkers[key] = marker;
    });
}

export function highlightMonumentOnMap(classKey) {
    if (!mapInstance) return;

    // Reset previous active
    if (activeMarker) {
        const prevKey = activeMarker._classKey;
        if (prevKey && monumentMarkers[prevKey]) {
            monumentMarkers[prevKey].setIcon(createMarker(false));
        }
    }

    // Highlight new
    const marker = monumentMarkers[classKey];
    if (marker) {
        marker.setIcon(createMarker(true));
        activeMarker = marker;
        activeMarker._classKey = classKey;

        const coords = MONUMENT_COORDS[classKey];
        if (coords) {
            mapInstance.panTo([coords.lat, coords.lng], { animate: true, duration: 0.8 });
        }
    }
}

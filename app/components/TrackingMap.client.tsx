import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Need to fix default marker icons for Vite/Bundlers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for visited locations (green)
const VisitedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Custom icon for current location (blue pulsing)
const CurrentIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Custom icon for planned locations (grey)
const PlannedIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Mock coordinates for demo purposes
const PORTUGAL_COORDS: Record<string, [number, number]> = {
    "Lisboa": [38.7223, -9.1393],
    "Porto": [41.1579, -8.6291],
    "Faro": [37.0194, -7.9322],
    "Coimbra": [40.2056, -8.4195],
    "Braga": [41.5454, -8.4265],
    "Aveiro": [40.6405, -8.6538],
    "Viseu": [40.6566, -7.9125],
    "Vila Real": [40.9320, -7.8732],
    "Centro Logístico Norte": [41.15, -8.6],
    "Centro Logístico Sul": [38.7, -9.1],
    "Fábrica Central": [40.2, -8.4]
};

const getDefaultCoords = (locationName: string): [number, number] | null => {
    if (!locationName) return null;
    // Try exact match
    if (PORTUGAL_COORDS[locationName]) return PORTUGAL_COORDS[locationName];
    // Try partial match
    for (const [key, coords] of Object.entries(PORTUGAL_COORDS)) {
        if (locationName.toLowerCase().includes(key.toLowerCase())) {
            return coords;
        }
    }
    // Generate pseudo-random deterministic coordinates around central Portugal if no match
    let hash = 0;
    for (let i = 0; i < locationName.length; i++) hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
    const latOffset = (hash % 100) / 50.0;
    const lngOffset = ((hash >> 4) % 100) / 50.0;
    return [39.5 + latOffset, -8.2 + lngOffset];
};

interface ProductMapProps {
    produtos: any[];
    events?: any[];
}

export default function TrackingMap({ produtos, events = [] }: ProductMapProps) {
    // Determine center of map based on events or origin
    let center: [number, number] = [39.5, -8.2]; // Default center (Portugal)

    if (produtos.length > 0) {
        const p = produtos[0];
        const latestEvent = events.length > 0 ? events[0] : null;

        let activeCoords = null;
        if (latestEvent && latestEvent.localizacao) {
            activeCoords = getDefaultCoords(latestEvent.localizacao);
        } else if (p.origem) {
            activeCoords = getDefaultCoords(p.origem);
        }

        if (activeCoords) {
            center = activeCoords;
        }
    }

    return (
        <div className="h-full w-full rounded-xl border border-[var(--color-border)] overflow-hidden z-0 relative min-h-[300px]">
            <MapContainer
                center={center}
                zoom={6}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', backgroundColor: '#0a0a0f' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {produtos.map((produto) => {
                    // Start Origin
                    const startCoords = getDefaultCoords(produto.origem);

                    // Historical Path (Events)
                    // events are ordered by created_at desc, we need to reverse them for the line drawing (oldest first)
                    const sortedEvents = [...events].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                    const visitedLocations = sortedEvents
                        .filter(e => e.localizacao)
                        .map(e => ({ name: e.localizacao, coords: getDefaultCoords(e.localizacao), status: e.estado, date: e.created_at }))
                        .filter(e => e.coords !== null);

                    const visitedCoords = visitedLocations.map(e => e.coords as [number, number]);

                    let pathCoords: [number, number][] = [];
                    if (startCoords) pathCoords.push(startCoords);
                    pathCoords = [...pathCoords, ...visitedCoords];

                    // Planned Destinations
                    const destLocations = (produto.destinos_planeados || [])
                        .map((d: string) => ({ name: d, coords: getDefaultCoords(d) }))
                        .filter((d: any) => d.coords !== null);

                    const destCoords = destLocations.map((d: any) => d.coords as [number, number]);

                    // Create unvisited planned route
                    let plannedPathCoords: [number, number][] = [];
                    if (pathCoords.length > 0) {
                        // Connect last historical point to first future point
                        plannedPathCoords.push(pathCoords[pathCoords.length - 1]);
                    } else if (startCoords) {
                        plannedPathCoords.push(startCoords);
                    }
                    plannedPathCoords = [...plannedPathCoords, ...destCoords];

                    return (
                        <div key={produto.id}>
                            {/* Draw Visited Route Line */}
                            {pathCoords.length > 1 && (
                                <Polyline
                                    positions={pathCoords}
                                    pathOptions={{ color: 'var(--color-success)', weight: 3, opacity: 0.8 }}
                                />
                            )}

                            {/* Draw Future Route Line (Dashed) */}
                            {plannedPathCoords.length > 1 && (
                                <Polyline
                                    positions={plannedPathCoords}
                                    pathOptions={{ color: 'var(--color-accent)', weight: 2, opacity: 0.5, dashArray: '5, 10' }}
                                />
                            )}

                            {/* Origin Marker */}
                            {startCoords && (
                                <Marker position={startCoords} icon={visitedCoords.length === 0 ? CurrentIcon : VisitedIcon}>
                                    <Popup className="custom-popup">
                                        <div className="text-black p-1">
                                            <strong className="block mb-1">Origem: {produto.origem}</strong>
                                            <span className="text-xs text-gray-600 block">Produto: {produto.nome}</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Historical Event Markers */}
                            {visitedLocations.map((evt, idx) => {
                                const isCurrent = idx === visitedLocations.length - 1;
                                return (
                                    <Marker key={`evt-${idx}`} position={evt.coords as [number, number]} icon={isCurrent ? CurrentIcon : VisitedIcon}>
                                        <Popup className="custom-popup">
                                            <div className="text-black p-1">
                                                <strong className="block mb-1">{evt.name}</strong>
                                                <span className="text-xs text-gray-800 block">Status: {evt.status}</span>
                                                <span className="text-xs text-gray-500 block mt-1">{new Date(evt.date).toLocaleString('pt-PT')}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            })}

                            {/* Future Destinations Markers */}
                            {destLocations.map((dest: any, idx: number) => {
                                // Only show marker if not already a visited location
                                const alreadyVisited = visitedLocations.some(v => v.name.toLowerCase() === dest.name.toLowerCase());
                                if (alreadyVisited) return null;

                                return (
                                    <Marker key={`dest-${idx}`} position={dest.coords as [number, number]} icon={PlannedIcon}>
                                        <Popup className="custom-popup">
                                            <div className="text-black p-1">
                                                <strong className="block mb-1 font-medium italic">Destino: {dest.name}</strong>
                                                <span className="text-xs text-gray-600 block">(Planeado)</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            })}
                        </div>
                    );
                })}
            </MapContainer>
        </div>
    );
}

import { useEffect, useMemo } from "react";
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";

// Імпорт стилів Leaflet (ОБОВ'ЯЗКОВО для коректного відображення)
import "leaflet/dist/leaflet.css";

// Виправлення шляхів до іконок (стандартна проблема Leaflet + Webpack/Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Налаштування дефолтної іконки
const defaultMarkerIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Центр штату Нью-Йорк [lat, lng]
const DEFAULT_NY_CENTER: [number, number] = [42.9, -75.5];

// Межі штату Нью-Йорк (Southwest [lat, lng], Northeast [lat, lng])
const NY_STATE_BOUNDS: L.LatLngBoundsExpression = [
    [40.496, -79.762], // Southwest
    [45.015, -71.856], // Northeast
];

function parseNumber(value: string) {
    const n = parseFloat(value);
    return !isNaN(n) && isFinite(n) ? n : null;
}

/**
 * Компонент для примусового оновлення виду мапи при зміні координат ззовні
 */
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        // Дозволяємо Leaflet перерахувати розміри контейнера
        map.invalidateSize();
        // Плавно або миттєво переміщуємо камеру
        map.setView(center, zoom, { animate: true });
    }, [map, center, zoom]);

    return null;
}

/**
 * Обробник кліків по мапі
 */
function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

interface CoordinatePickerMapProps {
    lat: string;
    lon: string;
    onPick: (latitude: number, longitude: number) => void;
    heightClassName?: string;
}

export function CoordinatePickerMap({
    lat,
    lon,
    onPick,
    heightClassName = "h-80",
}: CoordinatePickerMapProps) {
    const latNumber = parseNumber(lat);
    const lonNumber = parseNumber(lon);
    const hasValidCoordinates = latNumber !== null && lonNumber !== null;

    // Використовуємо useMemo, щоб об’єкт center не перестворювався щоразу
    const center: [number, number] = useMemo(() => 
        hasValidCoordinates ? [latNumber!, lonNumber!] : DEFAULT_NY_CENTER,
    [latNumber, lonNumber, hasValidCoordinates]);

    const zoom = hasValidCoordinates ? 12 : 7;

    return (
        <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
            <div className={`${heightClassName} w-full`} style={{ minHeight: "300px" }}>
                <MapContainer
                    center={center}
                    zoom={zoom}
                    minZoom={6}
                    maxZoom={18}
                    maxBounds={NY_STATE_BOUNDS}
                    maxBoundsViscosity={1.0}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <MapRecenter center={center} zoom={zoom} />
                    <MapClickHandler onPick={onPick} />

                    {hasValidCoordinates && (
                        <Marker
                            position={center}
                            draggable={true}
                            icon={defaultMarkerIcon}
                            eventHandlers={{
                                dragend: (event) => {
                                    const marker = event.target as L.Marker;
                                    const pos = marker.getLatLng();
                                    onPick(pos.lat, pos.lng);
                                },
                            }}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
import { useEffect } from "react";
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DEFAULT_NY_CENTER: [number, number] = [42.9, -75.5];

const defaultMarkerIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function parseNumber(value: string) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function MapRecenter({
    center,
    zoom,
}: {
    center: [number, number];
    zoom: number;
}) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom, { animate: false });
    }, [map, center[0], center[1], zoom]);

    return null;
}

function MapClickHandler({
    onPick,
}: {
    onPick: (latitude: number, longitude: number) => void;
}) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });

    return null;
}

export function CoordinatePickerMap({
    lat,
    lon,
    onPick,
    heightClassName = "h-80",
}: {
    lat: string;
    lon: string;
    onPick: (latitude: number, longitude: number) => void;
    heightClassName?: string;
}) {
    const latNumber = parseNumber(lat);
    const lonNumber = parseNumber(lon);
    const hasValidCoordinates = latNumber !== null && lonNumber !== null;

    const center: [number, number] = hasValidCoordinates
        ? [latNumber, lonNumber]
        : DEFAULT_NY_CENTER;

    const zoom = hasValidCoordinates ? 12 : 7;

    return (
        <div className="rounded-lg overflow-hidden border border-dark-border">
            <div className={`${heightClassName} w-full`}>
                <MapContainer
                    center={center}
                    zoom={zoom}
                    scrollWheelZoom
                    className="h-full w-full"
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
                            draggable
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

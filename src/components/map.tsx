"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

interface MapProps {
    center?: [number, number]
    zoom?: number
    onLocationSelect?: (lat: number, lng: number) => void
    selectedLocation?: [number, number] | null
}

function LocationMarker({ onLocationSelect, position }: { onLocationSelect?: (lat: number, lng: number) => void, position: [number, number] | null }) {
    const map = useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect(e.latlng.lat, e.latlng.lng)
            }
        },
    })

    return position ? <Marker position={position} icon={icon} /> : null
}

export default function Map({
    center = [51.505, -0.09], // Default center (London) - should be campus coordinates
    zoom = 13,
    onLocationSelect,
    selectedLocation,
}: MapProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-[300px] w-full animate-pulse bg-muted" />
    }

    return (
        <div className="h-[300px] w-full overflow-hidden rounded-md border">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} position={selectedLocation || null} />
            </MapContainer>
        </div>
    )
}

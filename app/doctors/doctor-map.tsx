"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import { Icon, LatLngBounds } from "leaflet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Navigation, Phone, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import "leaflet/dist/leaflet.css"
import Link from "next/link";

// Fix for default markers in react-leaflet
const createCustomIcon = (color: string) =>
    new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `)}`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    })

const doctorIcon = createCustomIcon("#3b82f6")
const selectedDoctorIcon = createCustomIcon("#ef4444")

interface DoctorMapProps {
    doctors: any[]
    searchParameters: any
}

export default function DoctorMap({doctors, searchParameters}: DoctorMapProps) {
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")
    const mapRef = useRef<any>(null)
    const router = useRouter()
    const searchParams = JSON.parse(searchParameters.value)
    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords
                    setUserLocation([latitude, longitude])
                    setLocationPermission("granted")

                    // Update URL with user location if not already present
                    if (!searchParams.lat || !searchParams.lng) {
                        const params = new URLSearchParams(window.location.search)
                        params.set("lat", latitude.toString())
                        params.set("lng", longitude.toString())
                        if (!searchParams.radius) {
                            params.set("radius", "10") // Default radius if not set
                        }
                        router.push(`/doctors?${params.toString()}`)
                    }
                },
                (error) => {
                    console.error("Error getting location:", error)
                    setLocationPermission("denied")
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000, // 5 minutes
                },
            )
        }
    }, [searchParams.lat, searchParams.lng, router])

    // Default center (you can adjust this to your city/region)
    const defaultCenter: [number, number] = [33.5731, -7.5898] // Casablanca, Morocco
    console.log(searchParameters)
    console.log('these are search params in map', searchParams)
    console.log(searchParams["lat"], searchParams.lng, searchParams.location,typeof searchParams)
    const mapCenter =
        (searchParams.lat && searchParams.lng
            ? [Number.parseFloat(searchParams.lat), Number.parseFloat(searchParams.lng)]
            : defaultCenter)
    console.log("Map center:", mapCenter)

    const handleDoctorSelect = (doctor: any) => {
        setSelectedDoctor(doctor)
        if (mapRef.current) {
            mapRef.current.setView([doctor.location.latitude, doctor.location.longitude], 15)
        }
    }

    const handleGetDirections = (doctor: any) => {
        if (searchParams.lat && searchParams.lng) {
            const url = `https://www.google.com/maps/dir/${searchParams.lat},${searchParams.lng}/${doctor.location.latitude},${doctor.location.longitude}`
            window.open(url, "_blank")
        } else {
            const url = `https://www.google.com/maps/search/${doctor.location.address}`
            window.open(url, "_blank")
        }
    }

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords
                    setUserLocation([latitude, longitude])
                    setLocationPermission("granted")

                    const params = new URLSearchParams(window.location.search)
                    params.set("lat", latitude.toString())
                    params.set("lng", longitude.toString())
                    if (!searchParams.radius) {
                        params.set("radius", "10") // Default radius if not set
                    }
                    router.push(`/doctors?${params.toString()}`)
                },
                (error) => {
                    console.error("Error getting location:", error)
                    setLocationPermission("denied")
                },
            )
        }
    }

    // Filter doctors with valid locations
    const doctorsWithLocation = doctors.filter(
        (doctor) => doctor.location && doctor.location.latitude && doctor.location.longitude,
    )
    console.log("Doctors with location data:")
    console.dir(doctorsWithLocation, {depth: 3})

    // if (doctorsWithLocation.length === 0) {
    //     return (
    //         <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
    //             <div className="text-center">
    //                 <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    //                 <h3 className="text-lg font-medium mb-2">No doctors found with location data</h3>
    //                 <p className="text-muted-foreground">Try adjusting your search criteria</p>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="space-y-4">
            {/* Location permission banner */}
            {locationPermission === "denied" && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Navigation className="h-5 w-5 text-orange-600"/>
                            <div>
                                <p className="font-medium text-orange-800">Location access denied</p>
                                <p className="text-sm text-orange-600">Enable location to find doctors near you</p>
                            </div>
                        </div>
                        <Button onClick={requestLocation} variant="outline" size="sm">
                            Enable Location
                        </Button>
                    </CardContent>
                </Card>
            )}

            {locationPermission === "prompt" && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                            <Navigation className="h-5 w-5 text-blue-600"/>
                            <div>
                                <p className="font-medium text-blue-800">Find doctors near you</p>
                                <p className="text-sm text-blue-600">Allow location access for personalized results</p>
                            </div>
                        </div>
                        <Button onClick={requestLocation} size="sm">
                            Share Location
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2">
                    <div className="h-[600px] rounded-lg overflow-hidden border">
                        <MapContainer
                            center={mapCenter}
                            zoom={userLocation ? 13 : 10}
                            style={{height: "100%", width: "100%"}}
                            ref={mapRef}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* User location marker */}
                            {userLocation && (
                                <Marker position={userLocation} icon={createCustomIcon("#10b981")}>
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-medium">Your Location</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                            {/* Search location marker */}
                            {searchParams.lat && searchParams.lng && searchParams.location && (
                                <Marker
                                    position={[Number.parseFloat(searchParams.lat), Number.parseFloat(searchParams.lng)]}
                                    icon={createCustomIcon("#f97316")}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <p className="font-medium">Search Location:{searchParams.location}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {/* Doctor markers */}
                            {doctorsWithLocation.map((doctor) => (
                                <Marker
                                    key={doctor.id}
                                    position={[doctor.location.latitude, doctor.location.longitude]}
                                    icon={selectedDoctor?.id === doctor.id ? selectedDoctorIcon : doctorIcon}
                                    eventHandlers={{
                                        click: () => handleDoctorSelect(doctor),
                                    }}
                                >
                                    <Popup>
                                        <DoctorPopup doctor={doctor} onGetDirections={handleGetDirections}/>
                                    </Popup>
                                </Marker>
                            ))}

                            <MapBounds
                                doctors={doctorsWithLocation}
                                userLocation={userLocation}
                                searchLocation={
                                    searchParams.lat && searchParams.lng
                                        ? [Number.parseFloat(searchParams.lat), Number.parseFloat(searchParams.lng)]
                                        : null
                                }
                            />
                        </MapContainer>
                    </div>
                </div>

                {/* Doctor details sidebar */}
                <div className="lg:col-span-1">
                    {selectedDoctor ? (
                        <DoctorDetails doctor={selectedDoctor} onGetDirections={handleGetDirections}/>
                    ) : (
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Select a Doctor</h3>
                                <p className="text-sm text-muted-foreground">Click on a marker to view doctor
                                    details</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm">
                                        <span className="font-medium">{doctorsWithLocation.length}</span> doctors found
                                    </p>
                                    {userLocation && !searchParams.location &&
                                        <p className="text-sm text-muted-foreground">Showing results near your
                                            location</p>}
                                    {searchParams.location &&
                                        <p className="text-sm text-muted-foreground">Showing results
                                            near {searchParams.location}</p>}                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

function DoctorPopup({ doctor, onGetDirections }: { doctor: any; onGetDirections: (doctor: any) => void }) {
    return (
        <div className="w-64">
            <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={doctor.profileImage || "/placeholder.svg"} alt={doctor.name} />
                    <AvatarFallback>
                        {doctor.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-semibold text-sm">{doctor.name}</h4>
                    <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                        {doctor.acceptingNewPatients ? "Accepting Patients" : "Not Accepting"}
                    </Badge>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>{doctor.location.address}</span>
                </div>
                {doctor.distance && (
                    <div className="flex items-center gap-2 text-xs">
                        <Navigation className="h-3 w-3" />
                        <span>{doctor.distance.toFixed(1)} km away</span>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onGetDirections(doctor)}>
                    Directions
                </Button>
                <Link href={`/patient/appointments/new?doctorId=${doctor.id}`} className="w-full">
                    <Button size="sm" variant="outline">
                        Book
                    </Button>
                </Link>
            </div>
        </div>
    )
}

function DoctorDetails({ doctor, onGetDirections }: { doctor: any; onGetDirections: (doctor: any) => void }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={doctor.profileImage || "/placeholder.svg"} alt={doctor.name} />
                        <AvatarFallback>
                            {doctor.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        <p className="text-sm text-muted-foreground">{doctor.title}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">{doctor.specialty}</Badge>
                            {doctor.acceptingNewPatients && <Badge variant="secondary">Accepting Patients</Badge>}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm line-clamp-3">{doctor.bio}</p>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.location.address}</span>
                    </div>

                    {doctor.distance && (
                        <div className="flex items-center gap-2 text-sm">
                            <Navigation className="h-4 w-4 text-muted-foreground" />
                            <span>{doctor.distance.toFixed(1)} km away</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{doctor.experience} years experience</span>
                    </div>

                    {doctor.phone && (
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{doctor.phone}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-4">
                    <Button onClick={() => onGetDirections(doctor)} variant="outline" className="w-full">
                        <Navigation className="mr-2 h-4 w-4" />
                        Get Directions
                    </Button>
                    <Link href={`/patient/appointments/new?doctorId=${doctor.id}`} className="w-full">
                        <Button type="submit" className="w-full">
                            <Calendar className="mr-2 h-4 w-4" />
                            Book Appointment
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}

function MapBounds({ doctors, userLocation, searchLocation }: { doctors: any[]; userLocation: [number, number] | null; searchLocation: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (doctors.length === 0 && !userLocation && !searchLocation) return;

        const bounds = new LatLngBounds([]);

        // Add doctor locations to bounds
        doctors.forEach((doctor) => {
            if (doctor.location?.latitude && doctor.location?.longitude) {
                bounds.extend([doctor.location.latitude, doctor.location.longitude]);
            }
        });

        // Add user location to bounds if available


        // Add search location to bounds if available
        if (searchLocation) {
            bounds.extend(searchLocation);
        } else if (userLocation) {
            bounds.extend(userLocation);
        }

        // Fit map to bounds with padding
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [doctors, userLocation, searchLocation, map]);

    return null;
}

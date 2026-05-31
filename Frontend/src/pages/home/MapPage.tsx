import { useState, useEffect, useRef } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { usePublicVenues, useSportCategories } from '../../hooks/queries/usePublicQueries';
import { 
  Navigation, 
  Search, 
  SlidersHorizontal, 
  Star, 
  ArrowRight,
  Locate,
  Layers,
  Compass
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Type definitions
interface MapVenue {
  id: string;
  name: string;
  address: string;
  description: string;
  operatingStartHour: string;
  operatingEndHour: string;
  venueScale: number;
  contactPhone: string;
  sportTypes: string[];
  avatarUrl?: string;
  lat: number;
  lng: number;
  distance: number;
  minPrice: number;
  rating: number;
}

declare global {
  interface Window {
    initGoogleMap?: () => void;
    google?: any;
  }
}

export default function MapPage() {
  // 1. Coordinates and Location States (Default: HCMC Center)
  const [userCoords, setUserCoords] = useState({ lat: 10.8231, lng: 106.6297 });
  const [locating, setLocating] = useState(false);
  const [locationName, setLocationName] = useState("Trung tâm Thành phố Hồ Chí Minh");

  // 2. Google Maps API States
  const [mapApiLoaded, setMapApiLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const markersRef = useRef<any[]>([]);

  // 3. Search & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(5); // default 5km radius
  const [showFilters, setShowFilters] = useState(false);

  // 4. Details bottom sheet
  const [selectedVenue, setSelectedVenue] = useState<MapVenue | null>(null);

  // Fetch venues from backend
  const { data: rawVenues } = usePublicVenues();
  const { data: sportsData = [] } = useSportCategories();

  const fallbackSports = [
    { name: 'Pickleball', color: '#3b82f6', icon: '🎾' },
    { name: 'Cầu lông', color: '#10b981', icon: '🏸' },
    { name: 'Bóng đá', color: '#15803d', icon: '⚽' },
    { name: 'Tennis', color: '#d97706', icon: '🎾' },
  ];
  const sports = sportsData.length > 0 ? sportsData : fallbackSports;

  // Dynamic Google Maps Script Loader
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapApiLoaded(true);
      return;
    }

    // Check if script is already in the document
    const existingScript = document.getElementById('google-maps-api-script');
    if (existingScript) {
      return;
    }

    // Set callback globally
    window.initGoogleMap = () => {
      setMapApiLoaded(true);
    };

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''; // If empty, Google Map will run in developer mock mode
    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // GPS Location Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setUserCoords(newCoords);
        setLocationName(`Tọa độ: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`);
        setLocating(false);

        // Center map to new coordinates
        if (mapInstance) {
          mapInstance.panTo(newCoords);
          mapInstance.setZoom(15);
        }
      },
      (error) => {
        console.error(error);
        alert("Không thể định vị GPS. Sử dụng vị trí mô phỏng mặc định.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Generate stable mock coords around the user's coordinates for venues
  const getVenueCoords = (id: string, userLat: number, userLng: number) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate random but stable offsets around the user coordinates (within ~5km)
    const latFactor = (hash % 100) / 100;
    const lngFactor = ((hash >> 8) % 100) / 100;
    
    // Max offset around 0.035 degrees (~4km)
    const offsetLat = latFactor * 0.03; 
    const offsetLng = lngFactor * 0.03;
    
    const lat = userLat + offsetLat;
    const lng = userLng + offsetLng;
    
    // Haversine approximation
    const distance = Math.sqrt(offsetLat * offsetLat + offsetLng * offsetLng) * 111.32; 

    // Stable price and ratings
    const minPrice = 80000 + (Math.abs(hash) % 18) * 10000;
    const rating = 4.2 + (Math.abs(hash) % 9) * 0.1;

    return { lat, lng, distance, minPrice, rating };
  };

  // Compute final venues list with coordinates
  const venues: MapVenue[] = (rawVenues || []).map((v: any) => {
    const coords = getVenueCoords(v.id, userCoords.lat, userCoords.lng);
    return {
      id: v.id,
      name: v.name,
      address: v.address,
      description: v.description || 'Sân chơi chất lượng cao, đầy đủ tiện ích và dịch vụ hiện đại.',
      operatingStartHour: v.operatingStartHour || '06:00',
      operatingEndHour: v.operatingEndHour || '22:00',
      venueScale: v.venueScale || 3,
      contactPhone: v.contactPhone || '0901223344',
      sportTypes: v.sportTypes || ['Cầu lông'],
      avatarUrl: v.avatarUrl,
      lat: coords.lat,
      lng: coords.lng,
      distance: coords.distance,
      minPrice: coords.minPrice,
      rating: coords.rating
    };
  });

  // Filters calculation
  const filteredVenues = venues.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = !selectedSport || v.sportTypes.includes(selectedSport);
    const matchesDistance = v.distance <= maxDistance;
    return matchesSearch && matchesSport && matchesDistance;
  });

  // List of all sport options
  const allSports = sports.map((s: any) => s.name);

  // Helper colors and emojis for marker styling
  const getSportColor = (sportName: string) => {
    const found = sports.find((s: any) => s.name === sportName);
    if (found && found.color) return found.color;
    switch (sportName) {
      case 'Pickleball': return '#3b82f6';
      case 'Cầu lông': return '#10b981';
      case 'Bóng đá': return '#15803d';
      case 'Tennis': return '#d97706';
      default: return '#64748b';
    }
  };

  const getSportEmoji = (sportName: string) => {
    const found = sports.find((s: any) => s.name === sportName);
    if (found && found.icon) return found.icon;
    switch (sportName) {
      case 'Pickleball': return '🎾';
      case 'Cầu lông': return '🏸';
      case 'Bóng đá': return '⚽';
      case 'Tennis': return '🎾';
      default: return '📍';
    }
  };

  // Google Maps Instance initialization
  useEffect(() => {
    if (!mapApiLoaded || !mapRef.current || mapInstance) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: userCoords.lat, lng: userCoords.lng },
      zoom: 14,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi.business',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#e8f5e9' }]
        }
      ]
    });

    setMapInstance(map);

    // Initial User marker (Pulsing blue dot)
    new window.google.maps.Marker({
      position: { lat: userCoords.lat, lng: userCoords.lng },
      map: map,
      title: 'Vị trí của bạn',
      icon: {
        url: `data:image/svg+xml;utf-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#3b82f6" fill-opacity="0.2"/>
            <circle cx="12" cy="12" r="6" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
          </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(24, 24),
        anchor: new window.google.maps.Point(12, 12)
      }
    });
  }, [mapApiLoaded]);

  // Sync user location coordinates with Map pan
  useEffect(() => {
    if (mapInstance) {
      mapInstance.panTo(userCoords);
    }
  }, [userCoords, mapInstance]);

  // Update Markers dynamically when venues change or selectedVenue changes
  useEffect(() => {
    if (!mapInstance) return;

    // Remove old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Add new markers
    filteredVenues.forEach(venue => {
      const isSelected = selectedVenue?.id === venue.id;
      const primarySport = venue.sportTypes[0] || 'Cầu lông';
      const color = getSportColor(primarySport);
      const emoji = getSportEmoji(primarySport);

      const marker = new window.google.maps.Marker({
        position: { lat: venue.lat, lng: venue.lng },
        map: mapInstance,
        title: venue.name,
        icon: {
          url: `data:image/svg+xml;utf-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
              <path d="M18 0C8.1 0 0 8.1 0 18c0 14 18 28 18 28s18-14 18-28C36 8.1 27.9 0 18 0z" fill="${isSelected ? '#dc2626' : color}" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="18" cy="18" r="11" fill="white"/>
              <text x="18" y="22" font-size="12" text-anchor="middle" font-family="sans-serif">${emoji}</text>
            </svg>`
          )}`,
          scaledSize: new window.google.maps.Size(36, 46),
          anchor: new window.google.maps.Point(18, 46)
        }
      });

      marker.addListener('click', () => {
        setSelectedVenue(venue);
        mapInstance.panTo({ lat: venue.lat, lng: venue.lng });
      });

      markersRef.current.push(marker);
    });
  }, [filteredVenues, mapInstance, selectedVenue]);

  return (
    <MainLayout noPaddingBottom={true}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'relative',
        fontFamily: "'Montserrat', sans-serif"
      }}>
        
        {/* Google Map Container */}
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            maxWidth: 480,
            height: '100vh', 
            position: 'fixed', 
            top: 0, 
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1 
          }} 
        />

        {/* Fallback mockup UI if Google API is loading or not working */}
        {!mapApiLoaded && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 0,
            flexDirection: 'column',
            color: '#64748b',
            gap: 12
          }}>
            <Compass className="animate-spin" size={32} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Đang tải Bản đồ Google Maps...</span>
          </div>
        )}

        {/* 1. Floating Top Controls Overlay */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          pointerEvents: 'none'
        }}>
          {/* A. Search Bar Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 24,
            padding: '4px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            height: 48,
            pointerEvents: 'auto',
            gap: 10
          }}>
            {/* Custom Brand Logo */}
            <div style={{
              width: 24,
              height: 24,
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'white',
              fontSize: 12,
              fontStyle: 'italic'
            }}>
              S
            </div>
            
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sân quanh đây..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#1e293b',
                fontFamily: 'inherit'
              }}
            />

            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                border: 'none',
                background: 'none',
                color: showFilters ? '#10b981' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <SlidersHorizontal size={18} />
            </button>
            
            <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />

            <Search size={18} color="#64748b" />
          </div>

          {/* B. Sport Filter Pills Horizontal Row */}
          <div style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            pointerEvents: 'auto',
            scrollbarWidth: 'none'
          }}>
            {/* All Sports Pill */}
            <button
              onClick={() => setSelectedSport(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 20,
                border: selectedSport === null ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: selectedSport === null ? '#10b981' : '#1e293b',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            >
              Tất cả
            </button>

            {/* Sport Specific Pills */}
            {allSports.map(sport => {
              const active = selectedSport === sport;
              const color = getSportColor(sport);
              const emoji = getSportEmoji(sport);
              return (
                <button
                  key={sport}
                  onClick={() => setSelectedSport(sport)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: active ? `1.5px solid ${color}` : '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    color: active ? color : '#1e293b',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <span style={{ fontSize: 13 }}>{emoji}</span>
                  {sport}
                </button>
              );
            })}
          </div>

          {/* C. Hidden Distance Range Slider Panel */}
          {showFilters && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 14,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              pointerEvents: 'auto',
              border: '1px solid #e2e8f0',
              marginTop: -4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Bán kính tìm kiếm</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{maxDistance} km</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#10b981',
                  height: 4,
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginTop: 4 }}>
                <span>1 km</span>
                <span>5 km</span>
                <span>10 km</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Floating Action Controls Bottom-Right */}
        <div style={{
          position: 'absolute',
          bottom: selectedVenue ? 210 : 80, // Shift up if venue card details is visible
          right: 16,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Map Layer Mode Toggle Mock */}
          <button 
            onClick={() => {
              if (mapInstance) {
                const currentType = mapInstance.getMapTypeId();
                mapInstance.setMapTypeId(currentType === 'roadmap' ? 'hybrid' : 'roadmap');
              }
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'white',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#326441'
            }}
          >
            <Layers size={20} />
          </button>

          {/* Current GPS Target Location Button */}
          <button 
            onClick={handleGetCurrentLocation}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#326441',
              border: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <Locate size={20} className={locating ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* 3. Bottom Information Sheet Overlay */}
        {selectedVenue && (
          <div style={{
            position: 'absolute',
            bottom: 64, // Floating above navigation menu bar
            left: 16,
            right: 16,
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 16,
            zIndex: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {/* CSS Animation local to this component */}
            <style>{`
              @keyframes slideUp {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, paddingRight: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
                  {selectedVenue.name}
                </h3>
                <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                  📍 {selectedVenue.address}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selectedVenue.sportTypes.map(st => (
                    <span key={st} style={{
                      backgroundColor: 'rgba(50, 100, 65, 0.08)',
                      color: '#326441',
                      border: '1px solid rgba(50, 100, 65, 0.15)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 10,
                      fontWeight: 600
                    }}>
                      {st}
                    </span>
                  ))}
                  <span style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    color: '#d97706',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    fontSize: 10,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Star size={10} fill="#f59e0b" color="#f59e0b" />
                    {selectedVenue.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Close Bottom Sheet Button */}
              <button 
                onClick={() => setSelectedVenue(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#475569', lineHeight: '1.4', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {selectedVenue.description}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: 10,
              marginTop: 4
            }}>
              <div>
                <span style={{ fontSize: 9, color: '#94a3b8', display: 'block', fontWeight: 600 }}>KHOẢNG CÁCH / BẢNG GIÁ</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#326441' }}>
                  ⚡ {selectedVenue.distance.toFixed(2)} km
                </span>
                <span style={{ fontSize: 12, color: '#cbd5e1', margin: '0 6px' }}>|</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>
                  Từ {selectedVenue.minPrice.toLocaleString('vi-VN')}đ / giờ
                </span>
              </div>
              
              <Link 
                to={`/venue/${selectedVenue.id}`}
                style={{
                  backgroundColor: '#326441',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 4px 10px rgba(50, 100, 65, 0.2)',
                  cursor: 'pointer'
                }}
              >
                Đặt sân
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}


'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  ExternalLink,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationSelect: (loc: { lat: number; lng: number; address?: string }) => void;
  className?: string;
}

export default function LocationPicker({
  initialLat,
  initialLng,
  onLocationSelect,
  className = '',
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Default coordinate: Jakarta, Indonesia
  const defaultLat = initialLat || -6.2088;
  const defaultLng = initialLng || 106.8456;

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reverse Geocode using Nominatim
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
            },
          }
        );
        const data = await res.json();
        const displayAddress = data?.display_name || '';
        onLocationSelect({ lat, lng, address: displayAddress });
      } catch (err) {
        console.error('Reverse geocode error:', err);
        onLocationSelect({ lat, lng });
      } finally {
        setIsGeocoding(false);
      }
    },
    [onLocationSelect]
  );

  // Update or Place Marker on map
  const setMarkerPosition = useCallback(
    async (L: any, lat: number, lng: number, triggerReverse = true) => {
      setCurrentCoords({ lat, lng });

      if (!mapInstanceRef.current) return;

      // Create Custom SVG DivIcon for Clean Minimalist Marker
      const customPinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="transform: translate(-50%, -100%);">
            <div style="background-color: #09090b; color: white; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid white;">
              <div style="width: 10px; height: 10px; background-color: #3b82f6; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
            <div style="width: 14px; height: 6px; background-color: rgba(0,0,0,0.25); border-radius: 50%; margin: -4px auto 0 auto; filter: blur(1.5px);"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(mapInstanceRef.current);

        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          setCurrentCoords({ lat: pos.lat, lng: pos.lng });
          await reverseGeocode(pos.lat, pos.lng);
        });

        markerRef.current = marker;
      }

      mapInstanceRef.current.panTo([lat, lng], { animate: true });

      if (triggerReverse) {
        await reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode]
  );

  // Initialize Leaflet Map (Client-Side only)
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      if (isCancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: initialLat && initialLng ? 16 : 13,
        zoomControl: true,
      });

      // Clean OpenStreetMap TileLayer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;

      // If initial coordinates exist, place initial marker
      if (initialLat && initialLng) {
        setMarkerPosition(L, initialLat, initialLng, false);
      }

      // Map click handler to move marker
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;
        await setMarkerPosition(L, lat, lng, true);
      });

      // Force recalculate dimensions on container display
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [defaultLat, defaultLng, initialLat, initialLng, setMarkerPosition]);

  // GPS Current Location Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const L = (await import('leaflet')).default;
        await setMarkerPosition(L, lat, lng, true);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(16);
        }
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert(
          'Tidak dapat mendeteksi lokasi GPS secara otomatis. Pastikan izin lokasi telah aktif atau ketik alamat pada kotak pencarian.'
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Nominatim Search Handler with Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim() || query.trim().length < 3) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=id&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setSearchResults(data || []);
        setSearchDropdownOpen(true);
      } catch (err) {
        console.error('Search location error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 450);
  };

  const handleSelectSearchResult = async (item: any) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setSearchQuery(item.display_name.split(',')[0]);
    setSearchDropdownOpen(false);

    const L = (await import('leaflet')).default;
    await setMarkerPosition(L, lat, lng, false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(16);
    }
    onLocationSelect({ lat, lng, address: item.display_name });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Controls: Search Bar & GPS Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Cari jalan, kelurahan, atau kecamatan..."
            className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-9 pr-9 text-xs sm:text-sm shadow-xs transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setSearchDropdownOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search Dropdown Results */}
          {searchDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              {searchResults.map((res, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800/60 last:border-none flex items-start gap-2"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400 mt-0.5" />
                  <span className="line-clamp-2 text-zinc-700 dark:text-zinc-300">
                    {res.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 shadow-xs transition disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              <span>Mencari GPS...</span>
            </>
          ) : (
            <>
              <Crosshair className="h-3.5 w-3.5 text-blue-600" />
              <span>Lokasi Saya (GPS)</span>
            </>
          )}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl border border-zinc-300/90 overflow-hidden shadow-xs dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Instruction Badge */}
        <div className="pointer-events-none absolute bottom-2 left-2 right-2 sm:right-auto z-[400]">
          <div className="rounded-lg bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-xs border border-zinc-200 dark:bg-zinc-900/90 dark:text-zinc-400 dark:border-zinc-800 inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-red-500 shrink-0" />
            <span>Klik peta atau geser pin untuk menentukan titik pengiriman</span>
          </div>
        </div>

        {/* Geocoding indicator */}
        {isGeocoding && (
          <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5 rounded-lg bg-zinc-900/85 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
            <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
            <span>Mengambil alamat...</span>
          </div>
        )}
      </div>

      {/* Footer Preview Info */}
      {currentCoords && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 px-3 py-2 border border-zinc-200/80 text-xs dark:bg-zinc-900 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 dark:text-zinc-400">Koordinat:</span>
            <span className="font-mono font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
              {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
            </span>
          </div>

          <a
            href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
          >
            <span>Buka Google Maps</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}


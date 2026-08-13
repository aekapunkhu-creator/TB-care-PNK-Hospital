import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, X, Check, Navigation, Compass, Crosshair, HelpCircle } from 'lucide-react';
import { PHON_NA_KAEO_SUBDISTRICTS } from '../data/mockData';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  subdistrictName?: string;
  patientName?: string;
  onSelectLocation: (lat: number, lng: number) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  subdistrictName,
  patientName,
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default fallback: Phon Na Kaeo Center
  const defaultLat = initialLat && !isNaN(initialLat) && initialLat !== 0 ? initialLat : 17.065;
  const defaultLng = initialLng && !isNaN(initialLng) && initialLng !== 0 ? initialLng : 104.288;

  const [lat, setLat] = useState<number>(defaultLat);
  const [lng, setLng] = useState<number>(defaultLng);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Reset when modal opens with new initial props
  useEffect(() => {
    if (isOpen) {
      let startLat = initialLat && !isNaN(initialLat) && initialLat !== 0 ? initialLat : 17.065;
      let startLng = initialLng && !isNaN(initialLng) && initialLng !== 0 ? initialLng : 104.288;

      // If no initial lat/lng provided but subdistrict is selected, center on subdistrict
      if ((!initialLat || initialLat === 0) && subdistrictName) {
        const foundSub = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.name === subdistrictName);
        if (foundSub) {
          startLat = foundSub.lat;
          startLng = foundSub.lng;
        }
      }

      setLat(Number(startLat.toFixed(6)));
      setLng(Number(startLng.toFixed(6)));
      setGpsError(null);
    }
  }, [isOpen, initialLat, initialLng, subdistrictName]);

  // Initialize and handle Leaflet map inside modal
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing map instance if present
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const currentLat = lat || 17.065;
    const currentLng = lng || 104.288;

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | TB-Care โพนนาแก้ว',
    }).addTo(map);

    // Custom Icon for Patient House Pin
    const customIcon = L.divIcon({
      className: 'custom-house-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; items-center: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: #ef4444; opacity: 0.3; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 32px; height: 32px; background-color: #dc2626; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([currentLat, currentLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setLat(Number(position.lat.toFixed(6)));
      setLng(Number(position.lng.toFixed(6)));
    });

    // Handle map click to re-position pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickLat = Number(e.latlng.lat.toFixed(6));
      const clickLng = Number(e.latlng.lng.toFixed(6));
      setLat(clickLat);
      setLng(clickLng);
      marker.setLatLng([clickLat, clickLng]);
    });

    leafletMapRef.current = map;

    // Force map resize recalculation on open
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isOpen]);

  // Sync marker position when inputs change manually
  const handleUpdateCoordinates = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    if (markerRef.current && leafletMapRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      leafletMapRef.current.panTo([newLat, newLng]);
    }
  };

  // Get current GPS position from browser
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('เบราว์เซอร์นี้ไม่รองรับระบบ GPS ระบุตำแหน่ง');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = Number(position.coords.latitude.toFixed(6));
        const userLng = Number(position.coords.longitude.toFixed(6));
        handleUpdateCoordinates(userLat, userLng);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('ไม่สามารถดึงตำแหน่งพิกัด GPS ได้ โปรดตรวจสอบการอนุญาตระบุตำแหน่ง');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSave = () => {
    onSelectLocation(lat, lng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/15 rounded-xl">
              <MapPin className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">ปักหมุดพิกัดตำแหน่งบ้านผู้ป่วย</h3>
              <p className="text-xs text-blue-100">
                {patientName ? `ผู้ป่วย: ${patientName}` : 'คลิกบนแผนที่ หรือลากหมุดไปยังตำแหน่งบ้านที่ถูกต้อง'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header Toolbar Controls */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {/* Subdistrict Quick Jump */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>เลื่อนไปยังตำบล:</span>
            <select
              onChange={(e) => {
                const subName = e.target.value;
                const found = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.name === subName);
                if (found) {
                  handleUpdateCoordinates(found.lat, found.lng);
                }
              }}
              className="p-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- เลือกตำบล --</option>
              {PHON_NA_KAEO_SUBDISTRICTS.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Button */}
          <button
            onClick={handleGetGPS}
            disabled={gpsLoading}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            <span>{gpsLoading ? 'กำลังค้นหาตำแหน่ง GPS...' : 'ใช้ตำแหน่ง GPS ปัจจุบัน'}</span>
          </button>
        </div>

        {gpsError && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-xs font-medium">
            ⚠️ {gpsError}
          </div>
        )}

        {/* Map Container */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[380px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full min-h-[320px] sm:min-h-[380px] z-10" />

          {/* Help Overlay Badge */}
          <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-medium text-slate-700 flex items-center gap-1.5 pointer-events-none">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>คลิกพื้นที่ หรือลากหมุดแดงเพื่อปรับตำแหน่ง</span>
          </div>
        </div>

        {/* Latitude & Longitude Direct Edit Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Latitude (ละติจูด N)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) handleUpdateCoordinates(val, lng);
                  }}
                  className="w-full p-2 pl-3 pr-2 rounded-xl bg-white border border-slate-300 font-mono text-sm font-semibold text-blue-900 focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Longitude (ลองจิจูด E)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) handleUpdateCoordinates(lat, val);
                  }}
                  className="w-full p-2 pl-3 pr-2 rounded-xl bg-white border border-slate-300 font-mono text-sm font-semibold text-blue-900 focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-200 transition"
            >
              <Check className="w-4 h-4" />
              <span>บันทึกพิกัดตำแหน่ง</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

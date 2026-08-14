import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Patient } from '../types';
import { 
  MapPin, CheckCircle2, Crosshair, Navigation, HelpCircle, 
  Send, ShieldCheck, CheckCircle, AlertCircle, Compass, Building2, Check
} from 'lucide-react';

interface PublicLocationSubmitViewProps {
  patient: Patient;
  reporterEmail?: string;
  onSubmitLocation: (patientId: string, newLat: number, newLng: number, reporterEmail?: string) => void;
  onClosePublicView?: () => void;
  onLogoutReporter?: () => void;
}

export const PublicLocationSubmitView: React.FC<PublicLocationSubmitViewProps> = ({
  patient,
  reporterEmail,
  onSubmitLocation,
  onClosePublicView,
  onLogoutReporter
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const initialLat = patient.lat && patient.lat !== 0 ? patient.lat : 17.06520;
  const initialLng = patient.lng && patient.lng !== 0 ? patient.lng : 104.28850;

  const [lat, setLat] = useState<number>(Number(initialLat.toFixed(6)));
  const [lng, setLng] = useState<number>(Number(initialLng.toFixed(6)));
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Auto-trigger GPS detection on load with passive fallback
  useEffect(() => {
    handleGetGPS(true);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap | รพ.โพนนาแก้ว',
    }).addTo(map);

    // Custom Icon for Pinning
    const customIcon = L.divIcon({
      className: 'custom-public-pin',
      html: `
        <div style="position: relative; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 42px; height: 42px; background-color: #10b981; opacity: 0.35; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 36px; height: 36px; background-color: #059669; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setLat(Number(pos.lat.toFixed(6)));
      setLng(Number(pos.lng.toFixed(6)));
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickLat = Number(e.latlng.lat.toFixed(6));
      const clickLng = Number(e.latlng.lng.toFixed(6));
      setLat(clickLat);
      setLng(clickLng);
      marker.setLatLng([clickLat, clickLng]);
    });

    leafletMapRef.current = map;

    // Invalidate map size multiple times to ensure proper rendering on iOS Safari
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const updateCoordinates = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    if (markerRef.current && leafletMapRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      leafletMapRef.current.panTo([newLat, newLng]);
    }
  };

  const handleGetGPS = (isInitial = false) => {
    if (!navigator.geolocation) {
      if (!isInitial) setGpsError('เบราว์เซอร์บนอุปกรณ์นี้ไม่รองรับการดึงพิกัด GPS');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    // Progressive GPS retrieval for maximum iOS & Android compatibility
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = Number(pos.coords.latitude.toFixed(6));
        const uLng = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);
        setAccuracy(acc);
        updateCoordinates(uLat, uLng);
        setGpsLoading(false);
      },
      (err) => {
        // Fallback retry with low accuracy for iOS if high accuracy timed out
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const uLat = Number(pos.coords.latitude.toFixed(6));
            const uLng = Number(pos.coords.longitude.toFixed(6));
            const acc = Math.round(pos.coords.accuracy);
            setAccuracy(acc);
            updateCoordinates(uLat, uLng);
            setGpsLoading(false);
          },
          (err2) => {
            setGpsLoading(false);
            if (!isInitial) {
              if (err2.code === 1) {
                setGpsError('โปรดอนุญาตให้เบราว์เซอร์เข้าถึงตำแหน่งพิกัด (เปิด Location Services บน iOS/Android) หรือแตะลากหมุดบนแผนที่ได้โดยตรง');
              } else {
                setGpsError('ไม่สามารถดึงตำแหน่ง GPS ได้ในขณะนี้ ท่านสามารถแตะหรือลากหมุดบนแผนที่ไปยังตำแหน่งบ้านได้โดยตรง');
              }
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleConfirmSubmit = () => {
    onSubmitLocation(patient.id, lat, lng, reporterEmail);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 font-['Prompt',sans-serif]">
      <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white relative">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-bold uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>โรงพยาบาลโพนนาแก้ว จ.สกลนคร</span>
                </div>
                <h1 className="text-lg font-bold leading-tight">ระบบระบุพิกัดตำแหน่งบ้านผู้ป่วย</h1>
              </div>
            </div>

            {onLogoutReporter && reporterEmail && (
              <button
                type="button"
                onClick={onLogoutReporter}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-emerald-100 text-[11px] font-bold rounded-xl transition shrink-0"
                title="เปลี่ยนบัญชีอีเมลผู้บันทึก"
              >
                เปลี่ยนอีเมล
              </button>
            )}
          </div>

          {reporterEmail && (
            <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100">
              <div className="flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="truncate">เข้าสู่ระบบด้วย: <b className="text-white font-mono">{reporterEmail}</b></span>
              </div>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                ยืนยันตัวตนแล้ว
              </span>
            </div>
          )}
        </div>

        {/* Success Screen state */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-5 my-auto animate-fade-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-emerald-200">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">บันทึกพิกัดตำแหน่งบ้านเรียบร้อยแล้ว!</h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                ขอบคุณที่ช่วยระบุพิกัดตำแหน่งบ้านที่ถูกต้องให้แก่ โรงพยาบาลโพนนาแก้ว ข้อมูลพิกัด <span className="font-mono font-bold text-emerald-800">{lat}, {lng}</span> ถูกส่งบันทึกเข้าฐานข้อมูลเรียบร้อยแล้ว
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ผู้ป่วย: {patient.prefix}{patient.firstName} {patient.lastName} (HN: {patient.hn})</span>
              </div>
              <p className="text-[11px] text-slate-600">
                พื้นที่: ตำบล{patient.subdistrict} ({patient.village})
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-4">

            {/* Patient Identity Badge */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  HN: {patient.hn}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  อ.โพนนาแก้ว
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">
                ผู้ป่วย: {patient.prefix}{patient.firstName} {patient.lastName}
              </p>
              <p className="text-xs text-slate-600">
                ที่อยู่: {patient.subdistrict} ({patient.village}) {patient.houseNo ? `บ้านเลขที่ ${patient.houseNo}` : ''}
              </p>
            </div>

            {/* GPS Detection Bar */}
            <div className="space-y-2">
              <button
                onClick={handleGetGPS}
                disabled={gpsLoading}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition disabled:opacity-50"
              >
                <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'กำลังดึงตำแหน่ง GPS จากโทรศัพท์มือถือ...' : 'กดค้นหาตำแหน่ง GPS บ้านปัจจุบันจากมือถือ'}</span>
              </button>

              {accuracy && (
                <p className="text-[11px] text-center text-emerald-700 font-semibold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ดึงพิกัดสำเร็จ (ความแม่นยำประมาณ {accuracy} เมตร)</span>
                </p>
              )}

              {gpsError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>

            {/* Interactive Map Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>ตำแหน่งหมุดบนแผนที่ (ลากปรับหมุดได้):</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {lat}, {lng}
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-inner h-64 bg-slate-100">
                <div ref={mapContainerRef} className="w-full h-full z-10" />
                <div className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 border shadow-sm pointer-events-none">
                  ลากหมุดไปยังหลังคาบ้าน
                </div>
              </div>
            </div>

            {/* Latitude / Longitude Display Fields */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">ละติจูด (Latitude)</span>
                <span className="font-mono font-bold text-slate-900">{lat}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block">ลองจิจูด (Longitude)</span>
                <span className="font-mono font-bold text-slate-900">{lng}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleConfirmSubmit}
              className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4" />
              <span>ยืนยันและส่งพิกัดตำแหน่งบ้านนี้</span>
            </button>

            {onClosePublicView && (
              <button
                onClick={onClosePublicView}
                className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-bold transition text-center"
              >
                ยกเลิก
              </button>
            )}

          </div>
        )}

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          ระบบควบคุมวัณโรค รพ.โพนนาแก้ว &bull; ข้อมูลพิกัดได้รับการคุ้มครองความปลอดภัย
        </div>

      </div>
    </div>
  );
};

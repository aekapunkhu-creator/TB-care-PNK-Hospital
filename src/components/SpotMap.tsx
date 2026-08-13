import React, { useEffect, useRef, useState } from 'react';
import { Patient, HouseholdContact, SubdistrictInfo } from '../types';
import L from 'leaflet';
import { MapPin, Filter, Layers, Phone, Send, Info, Eye } from 'lucide-react';

interface SpotMapProps {
  patients: Patient[];
  contacts: HouseholdContact[];
  subdistricts: SubdistrictInfo[];
  onTriggerPatientNotify: (patient: Patient) => void;
  onSelectPatient: (patient: Patient) => void;
}

export const SpotMap: React.FC<SpotMapProps> = ({
  patients,
  contacts,
  subdistricts,
  onTriggerPatientNotify,
  onSelectPatient
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<Patient | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return; // already initialized

    // Center on Phon Na Kaeo District, Sakon Nakhon
    const map = L.map(mapContainerRef.current, {
      center: [17.065, 104.288],
      zoom: 12,
      zoomControl: true,
    });

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors | TB-Care โพนนาแก้ว',
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever filters or data change
  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // Filter patients
    const filteredPatients = patients.filter(p => {
      const matchSub = selectedSubdistrict === 'all' || p.subdistrict === selectedSubdistrict;
      const matchCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'active' && p.status === 'Active') ||
        (selectedCategory === 'smear_pos' && p.tbType === 'Pulmonary Smear+' && p.status === 'Active') ||
        (selectedCategory === 'cured' && (p.status === 'Cured' || p.status === 'Completed'));
      return matchSub && matchCat;
    });

    // Render Patient Markers
    filteredPatients.forEach(p => {
      let markerColor = '#10b981'; // Green for cured
      let badgeText = 'รักษาหาย';

      if (p.status === 'Active') {
        if (p.tbType === 'Pulmonary Smear+') {
          markerColor = '#ef4444'; // Red for Smear+
          badgeText = 'เสมหะพบเชื้อ (3+/2+/1+)';
        } else {
          markerColor = '#f97316'; // Orange for Smear- / Extra-pulmonary
          badgeText = 'เสมหะไม่พบเชื้อ/นอกปอด';
        }
      }

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-spot-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 11px;
          ">
            TB
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="font-family: 'Prompt', sans-serif; padding: 4px; max-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
            <span style="font-weight: bold; font-size: 13px; color: #0f172a;">${p.prefix}${p.firstName} ${p.lastName}</span>
            <span style="font-size: 10px; font-weight: 600; color: #047857; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">${p.hn}</span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            📍 ${p.subdistrict} (${p.village})<br/>
            💊 Regimen: <b>${p.regimen}</b><br/>
            👤 อสม.ผู้ดูแล: ${p.dotsSupervisorName}
          </div>
          <div style="font-size: 10px; font-weight: 600; color: white; background-color: ${markerColor}; padding: 3px 6px; border-radius: 4px; text-align: center;">
            ${badgeText}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedPatientForModal(p);
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Render High Risk Contacts Markers (if category allows)
    if (selectedCategory === 'all' || selectedCategory === 'contacts') {
      const filteredContacts = contacts.filter(c => {
        const matchSub = selectedSubdistrict === 'all' || c.subdistrict === selectedSubdistrict;
        return matchSub;
      });

      filteredContacts.forEach((c, idx) => {
        // Offset slightly if near index patient
        const contactLat = 17.060 + (idx * 0.003 % 0.04);
        const contactLng = 104.280 + (idx * 0.004 % 0.04);

        const contactIcon = L.divIcon({
          className: 'contact-spot-marker',
          html: `
            <div style="
              background-color: #eab308;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #713f12;
              font-weight: bold;
              font-size: 10px;
            ">
              CT
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const cMarker = L.marker([contactLat, contactLng], { icon: contactIcon });
        cMarker.bindPopup(`
          <div style="font-family: 'Prompt', sans-serif; font-size: 11px;">
            <b style="color: #854d0e;">ผู้สัมผัสเสี่ยงสูง: ${c.prefix}${c.firstName} ${c.lastName}</b><br/>
            ผู้ป่วยดัชนี: ${c.indexPatientName}<br/>
            สถานะคัดกรอง: <b>${c.outcome}</b>
          </div>
        `);

        markersGroupRef.current?.addLayer(cMarker);
      });
    }

  }, [patients, contacts, selectedSubdistrict, selectedCategory]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              SpotMap พิกัดการระบาดและตำแหน่งผู้ป่วยรายหมู่บ้าน
            </h2>
            <p className="text-xs text-slate-500">
              อำเภอโพนนาแก้ว จังหวัดสกลนคร (ระบุตำแหน่งบ้านและพิกัดผู้ดูแล DOTS)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Subdistrict Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedSubdistrict}
              onChange={e => setSelectedSubdistrict(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">ทุกตำบล (5 ตำบล)</option>
              {subdistricts.map(s => (
                <option key={s.code} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">แสดงทั้งหมด</option>
              <option value="active">เฉพาะกำลังรักษาอยู่ (Active)</option>
              <option value="smear_pos">เสมหะพบเชื้อ (Smear+)</option>
              <option value="cured">รักษาหายแล้ว (Cured)</option>
              <option value="contacts">ผู้สัมผัสเสี่ยงสูง (Contacts)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map + Legend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Map Container */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm relative overflow-hidden">
          <div 
            ref={mapContainerRef} 
            className="w-full h-[520px] rounded-xl z-10"
          />

          {/* Map Overlay Badge Legend */}
          <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200/80 shadow-lg text-xs space-y-1.5">
            <div className="font-bold text-slate-800 mb-1">สัญลักษณ์หมุดพิกัด SpotMap</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span>
              <span>ผู้ป่วยเสมหะพบเชื้อ (Smear+)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 border border-white"></span>
              <span>ผู้ป่วยเสมหะไม่พบเชื้อ/นอกปอด</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-white"></span>
              <span>ผู้สัมผัสร่วมบ้านเสี่ยงสูง</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
              <span>ผู้ป่วยรักษาหายแล้ว (Cured)</span>
            </div>
          </div>
        </div>

        {/* Side Subdistrict Summary Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
          <div className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>สรุปตามตำบล (โพนนาแก้ว)</span>
            <span className="text-xs text-slate-400">5 ตำบล</span>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            {subdistricts.map(sub => {
              const subP = patients.filter(p => p.subdistrict === sub.name && p.status === 'Active');
              const smearPos = subP.filter(p => p.tbType === 'Pulmonary Smear+').length;

              return (
                <div 
                  key={sub.code}
                  onClick={() => setSelectedSubdistrict(sub.name)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedSubdistrict === sub.name
                      ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-300'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">{sub.name}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {subP.length} เคส
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>รพ.สต.: {sub.healthCenterName.replace('โรงพยาบาลโพนนาแก้ว / ', '')}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                    <span className="bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-medium">
                      เสมหะพบเชื้อ: {smearPos}
                    </span>
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                      หมู่บ้าน: {sub.villagesCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedSubdistrict !== 'all' && (
            <button
              onClick={() => setSelectedSubdistrict('all')}
              className="w-full py-2 text-center text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-xl hover:bg-emerald-100 transition"
            >
              รีเซ็ตแสดงทุกตำบล
            </button>
          )}
        </div>

      </div>

      {/* Selected Patient Quick Detail Modal / Bottom Banner */}
      {selectedPatientForModal && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-xs">
                {selectedPatientForModal.hn}
              </span>
              <h3 className="text-base font-bold">
                {selectedPatientForModal.prefix}{selectedPatientForModal.firstName} {selectedPatientForModal.lastName} ({selectedPatientForModal.age} ปี)
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              📍 ที่อยู่: {selectedPatientForModal.houseNo} {selectedPatientForModal.village} {selectedPatientForModal.subdistrict} อ.โพนนาแก้ว
              &nbsp;|&nbsp; อสม.ผู้ดูแล: <span className="text-emerald-300">{selectedPatientForModal.dotsSupervisorName}</span> ({selectedPatientForModal.dotsSupervisorPhone})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerPatientNotify(selectedPatientForModal)}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>เตือนกินยาผ่าน LINE</span>
            </button>

            <button
              onClick={() => onSelectPatient(selectedPatientForModal)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium text-xs flex items-center gap-1.5 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>เปิดบันทึกผู้ป่วย</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

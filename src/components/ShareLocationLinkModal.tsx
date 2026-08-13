import React, { useState } from 'react';
import { Patient } from '../types';
import { 
  X, MapPin, Copy, Share2, Check, QrCode, ExternalLink, 
  Send, ShieldCheck, Smartphone, Info
} from 'lucide-react';

interface ShareLocationLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  initialPatient?: Patient | null;
  allPatients?: Patient[];
  patients?: Patient[];
  onSelectPatient?: (patient: Patient) => void;
  onOpenPublicPreview?: (patientId: string) => void;
}

export const ShareLocationLinkModal: React.FC<ShareLocationLinkModalProps> = ({
  isOpen,
  onClose,
  patient,
  initialPatient,
  allPatients,
  patients,
  onSelectPatient,
  onOpenPublicPreview
}) => {
  const [copied, setCopied] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  // Normalize prop aliases
  const activePatientList = allPatients || patients || [];
  const effectivePatientProp = patient || initialPatient || null;

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  // Keep selectedPatientId in sync with effectivePatientProp or fallback to first patient
  const currentPatient = 
    activePatientList.find(p => p.id === selectedPatientId) ||
    effectivePatientProp ||
    (activePatientList.length > 0 ? activePatientList[0] : null);

  if (!isOpen) return null;

  if (!currentPatient) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4">
          <p className="text-sm font-bold text-slate-700">ไม่พบข้อมูลผู้ป่วยสำหรับสร้างลิงก์ระบุพิกัด</p>
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold">ปิด</button>
        </div>
      </div>
    );
  }

  // Construct absolute URL for location pinpointing link (converting dev domain to public preview domain)
  const rawOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  // Convert ais-dev- domain to public ais-pre- domain so the link works for anyone without Google Cloud 403 errors
  const publicOrigin = rawOrigin.replace('ais-dev-', 'ais-pre-');
  const shareUrl = `${publicOrigin}${pathname}?pinLocationFor=${currentPatient.id}`;

  const displayName = privacyMode 
    ? `${currentPatient.prefix}${currentPatient.firstName.charAt(0)}*** ${currentPatient.lastName.charAt(0)}***`
    : `${currentPatient.prefix}${currentPatient.firstName} ${currentPatient.lastName}`;

  // Custom LINE message template
  const lineShareText = `📍 [ระบบระบุพิกัดบ้านผู้ป่วยวัณโรค อ.โพนนาแก้ว]\nขอความร่วมมือ คุณ${displayName} (HN: ${currentPatient.hn})\nหรือ อสม.พี่เลี้ยง ช่วยกดลิงก์นี้เพื่อระบุ/ส่งพิกัดตำแหน่งบ้านที่ถูกต้องเข้าสู่ระบบ รพ.โพนนาแก้ว ครับ:\n${shareUrl}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareLine = () => {
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(lineShareText)}`;
    window.open(lineUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Share2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">สร้างลิงก์และ QR Code ระบุพิกัดบ้านผู้ป่วย</h3>
              <p className="text-xs text-emerald-100">
                ส่งลิงก์ให้ผู้ป่วย หรือ อสม. กดปักหมุด GPS จากมือถือเพื่อเข้าถึงพิกัดที่ถูกต้อง
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">

          {/* Patient Switcher if multiple patients available */}
          {activePatientList.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลือกผู้ป่วยที่ต้องการสร้างลิงก์ระบุพิกัด:
              </label>
              <select
                value={currentPatient.id}
                onChange={(e) => {
                  const targetId = e.target.value;
                  setSelectedPatientId(targetId);
                  const found = activePatientList.find(p => p.id === targetId);
                  if (found && onSelectPatient) onSelectPatient(found);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                {activePatientList.map(p => (
                  <option key={p.id} value={p.id}>
                    HN: {p.hn} - {p.prefix}{p.firstName} {p.lastName} ({p.subdistrict} {p.village})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Patient Information Card */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  HN: {currentPatient.hn}
                </span>
                <span className="font-bold text-sm text-slate-900">{displayName}</span>
              </div>
              <p className="text-xs text-slate-600">
                ที่อยู่: {currentPatient.subdistrict} ({currentPatient.village}) {currentPatient.houseNo ? `บ้านเลขที่ ${currentPatient.houseNo}` : ''}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                <span>พิกัดในระบบปัจจุบัน: {currentPatient.lat.toFixed(6)}, {currentPatient.lng.toFixed(6)}</span>
              </p>
            </div>

            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition shrink-0 ${
                privacyMode 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              {privacyMode ? 'ซ่อนชื่อผู้ป่วย (ON)' : 'ซ่อนชื่อผู้ป่วย'}
            </button>
          </div>

          {/* QR Code and Direct URL Share */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* QR Code Container */}
            <div className="sm:col-span-5 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center">
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-inner border border-slate-200 flex items-center justify-center">
                <img 
                  src={qrImageUrl} 
                  alt="Location Pinning QR Code" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback visual if QR server offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>สแกน QR Code ด้วยมือถือ</span>
              </p>
            </div>

            {/* Direct URL Share Buttons */}
            <div className="sm:col-span-7 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL สำหรับส่งให้ผู้ป่วย/อสม.:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="w-full p-2.5 pr-20 rounded-xl bg-slate-100 border border-slate-300 font-mono text-xs text-slate-800 font-semibold focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>

              {/* Share Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareLine}
                  className="p-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>แชร์เข้า LINE</span>
                </button>

                <button
                  onClick={() => window.open(shareUrl, '_blank')}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  title="เปิดลิงก์สาธารณะจริงในแท็บใหม่เพื่อทดลองใช้งาน"
                >
                  <ExternalLink className="w-4 h-4 text-amber-300" />
                  <span>เปิดลิงก์คนไข้ (แท็บใหม่)</span>
                </button>
              </div>

              {/* Info Notice about requiring login */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-blue-800">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>คำแนะนำการใช้งาน:</span>
                </div>
                <p className="leading-relaxed">
                  กดปุ่ม <b>"คัดลอก"</b> หรือ <b>"แชร์เข้า LINE"</b> เพื่อส่งลิงก์ระบุพิกัด <br />
                  เมื่อผู้ใช้งานเปิดลิงก์ ระบบจะแสดงหน้า<b>เข้าสู่ระบบเพื่อยืนยันตัวตนก่อน</b> เมื่อเข้าสู่ระบบสำเร็จแล้ว ระบบจะเปิดหน้าปักหมุดตำแหน่งบ้านผู้ป่วยให้อัตโนมัติ ป้องกันปัญหา 403 Error อย่างสมบูรณ์ครับ
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { HomeVisitRecord, Patient, HomeVisitStatus, DOTSAdherenceRating, VentilationRating, UserAccount } from '../types';
import { 
  Home, X, Save, Calendar, User, Phone, MapPin, Activity, 
  Pill, AlertTriangle, ShieldCheck, Heart, Stethoscope, 
  CheckCircle2, Compass, Map, Sparkles, FileText, Check
} from 'lucide-react';
import { PHON_NA_KAEO_SUBDISTRICTS, getVillagesForSubdistrict } from '../data/mockData';
import { LocationPickerModal } from './LocationPickerModal';
import { openGoogleMapsNavigation } from '../utils/navigation';

interface HomeVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: HomeVisitRecord) => void;
  existingRecord?: HomeVisitRecord | null;
  patients: Patient[];
  currentUser?: UserAccount | null;
  initialPatientId?: string;
}

export const HomeVisitModal: React.FC<HomeVisitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRecord,
  patients = [],
  currentUser,
  initialPatientId
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<HomeVisitRecord>({
    id: `HV-${Date.now()}`,
    patientId: '',
    patientHN: '',
    patientName: '',
    subdistrict: 'ตำบลบ้านโพน',
    village: 'หมู่ที่ 1 บ้านอ้อมแก้วใหญ่',
    houseNo: '',
    visitRound: 1,
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: new Date().toTimeString().slice(0, 5),
    visitorName: currentUser?.fullName || 'พยาบาลวิชาชีพ รพ.สต.',
    visitorRole: (currentUser?.role === 'อสม.' ? 'อสม. พี่เลี้ยง' : 'พยาบาลวิชาชีพ'),
    visitorUnit: currentUser?.hospitalName || 'กลุ่มงานเวชปฏิบัติครอบครัว รพ.โพนนาแก้ว',
    visitorPhone: currentUser?.phone || '',

    objectives: {
      dotsFollowUp: true,
      adrScreening: true,
      sputumFollowUp: true,
      contactScreening: false,
      environmentCheck: true,
      healthEducation: true,
      psychosocialSupport: true,
      missedAppointment: false,
    },

    vitals: {
      temperature: 36.6,
      bloodPressure: '120/80',
      pulseRate: 78,
      respiratoryRate: 18,
      oxygenSat: 98,
      bodyWeight: 55,
      weightChange: 'คงที่',
    },

    symptoms: {
      cough: 'ไม่มี',
      sputumCharacteristics: 'ไม่มีเสมหะ',
      fever: false,
      nightSweats: false,
      dyspnea: false,
      chestPain: false,
      fatigue: false,
      appetite: 'ปกติ/เจริญอาหาร',
    },

    dotsSupervisor: {
      type: 'อสม. พี่เลี้ยง',
      name: '',
      isSupervisingDaily: true,
    },
    adherence: 'รับประทานยาทุกวัน สม่ำเสมอ 100%',
    pillCountStatus: 'จำนวนเม็ดยาคงเหลือถูกต้องตรงรอบ',
    missedDosesLast2Weeks: 0,

    sideEffects: {
      nauseaVomiting: false,
      orangeUrineAcknowledged: true,
      jointPain: false,
      numbness: false,
      itchingRash: false,
      jaundice: false,
      visionBlur: false,
      tinnitusDizziness: false,
      feverDrugReaction: false,
      otherSideEffects: '',
    },

    environment: {
      ventilation: 'ดีมาก (โปร่ง แดดส่อง ลมถ่ายเทดี)',
      bedroomType: 'แยกห้องนอนเดี่ยว',
      sunlightExposure: 'แดดส่องถึงห้องพัก',
      sputumDisposalMethod: 'กระโถน/ถุงทิ้งมิดชิดผสมน้ำยาฆ่าเชื้อ',
      maskWearingCompliance: 'สวมหน้ากากสม่ำเสมอเมื่อมีคนอยู่ใกล้',
    },

    psychosocial: {
      familySupport: 'ครอบครัวดูแลและให้กำลังใจดีมาก',
      financialDifficulty: false,
      foodAidNeeded: false,
      stressAnxietyLevel: 'ปกติ',
    },

    sputumFollowUpDone: false,
    sputumResultNotes: '',
    nextAppointmentDate: '',
    nextVisitDueDate: '',

    identifiedProblems: [],
    interventionsProvided: [
      'ให้คำแนะนำการรับประทานยาต่อเนื่องตรงเวลาทุกวัน',
      'สอนการเปิดหน้าต่างระบายอากาศและรับแสงแดดฆ่าเชื้อ',
      'กำชับการสวมหน้ากากอนามัยเมื่ออยู่ใกล้ชิดผู้อื่น'
    ],
    recommendationsAndNotes: 'ผู้ป่วยให้ความร่วมมือดีมาก ไม่มีอาการข้างเคียงรุนแรง อาการไอลดลงอย่างเห็นได้ชัด',
    referralRequired: false,
    referralReason: '',
    status: 'เยี่ยมสำเร็จ (ปกติ)',

    visitLat: 17.085,
    visitLng: 104.295,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Load Existing or Selected Patient
  useEffect(() => {
    if (existingRecord) {
      setFormData({ ...existingRecord });
      setSelectedPatientId(existingRecord.patientId);
    } else if (initialPatientId) {
      const p = patients.find(pt => pt.id === initialPatientId);
      if (p) {
        fillPatientData(p);
      }
    } else if (patients.length > 0 && !selectedPatientId) {
      // Default to first patient
      const p = patients[0];
      fillPatientData(p);
    }
  }, [existingRecord, initialPatientId, isOpen]);

  const fillPatientData = (p: Patient) => {
    setSelectedPatientId(p.id);
    setFormData(prev => ({
      ...prev,
      patientId: p.id,
      patientHN: p.hn,
      patientName: `${p.prefix}${p.firstName} ${p.lastName}`,
      subdistrict: p.subdistrict || prev.subdistrict,
      village: p.village || prev.village,
      houseNo: p.houseNo || prev.houseNo,
      dotsSupervisor: {
        type: p.dotsSupervisorRole === 'อสม. พี่เลี้ยง' ? 'อสม. พี่เลี้ยง' : (p.dotsSupervisorRole === 'เจ้าหน้าที่ รพ.สต.' ? 'เจ้าหน้าที่ รพ.สต.' : 'ญาติผู้ดูแล'),
        name: p.dotsSupervisorName || '',
        isSupervisingDaily: true,
      },
      nextAppointmentDate: p.nextAppointmentDate || prev.nextAppointmentDate,
      visitLat: p.lat || prev.visitLat,
      visitLng: p.lng || prev.visitLng,
    }));
  };

  const handlePatientSelectChange = (pId: string) => {
    setSelectedPatientId(pId);
    const p = patients.find(pt => pt.id === pId);
    if (p) {
      fillPatientData(p);
    }
  };

  const handleCurrentGPS = () => {
    if (!navigator.geolocation) {
      setGpsNotice('เบราว์เซอร์ไม่รองรับการระบุพิกัด GPS');
      return;
    }
    setGpsLoading(true);
    setGpsNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = Number(pos.coords.latitude.toFixed(6));
        const uLng = Number(pos.coords.longitude.toFixed(6));
        setFormData(prev => ({
          ...prev,
          visitLat: uLat,
          visitLng: uLng
        }));
        setGpsLoading(false);
        setGpsNotice(`📍 ตรวจจับพิกัด GPS จุดเยี่ยมบ้านสำเร็จ: Lat ${uLat}, Lng ${uLng}`);
        setTimeout(() => setGpsNotice(null), 4000);
      },
      (err) => {
        setGpsLoading(false);
        setGpsNotice(`ไม่สามารถตรวจจับพิกัด GPS ได้ (${err.message})`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      alert('กรุณาระบุชื่อผู้ป่วย หรือเลือกผู้ป่วยจากทะเบียน');
      return;
    }
    const finalData: HomeVisitRecord = {
      ...formData,
      updatedAt: new Date().toISOString(),
    };
    onSave(finalData);
    onClose();
  };

  if (!isOpen) return null;

  const currentVillages = getVillagesForSubdistrict(formData.subdistrict);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-scale-up">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {existingRecord ? 'แก้ไขบันทึกการเยี่ยมบ้านผู้ป่วยวัณโรค' : 'บันทึกการเยี่ยมบ้านผู้ป่วยวัณโรค (Home Visit Follow-up)'}
                </h3>
                <span className="bg-emerald-500/30 text-emerald-200 text-[11px] px-2 py-0.5 rounded-full font-mono border border-emerald-400/30">
                  NTP Home-Care
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                กลุ่มงานเวชปฏิบัติครอบครัวและชุมชน รพ.โพนนาแก้ว & ทีม 3 หมอ รพ.สต.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 text-xs">
          
          {/* Section 1: ข้อมูลผู้ป่วยและผู้เยี่ยมบ้าน */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. ข้อมูลผู้ป่วยและทีมเยี่ยมบ้าน (Patient & Visit Profile)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                รหัสบันทึก: {formData.id}
              </span>
            </div>

            {/* Quick Patient Selection Dropdown */}
            {patients.length > 0 && (
              <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 text-xs block">เลือกผู้ป่วยจากทะเบียนในระบบ:</span>
                    <span className="text-[11px] text-emerald-800">ระบบจะดึง HN, ที่อยู่, พิกัด GPS และผู้กำกับยา DOTS ให้อัตโนมัติ</span>
                  </div>
                </div>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelectChange(e.target.value)}
                  className="w-full sm:w-auto min-w-[260px] p-2 rounded-lg border border-emerald-300 bg-white font-semibold text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="">-- กรุณาเลือกผู้ป่วย --</option>
                  {(patients || []).map(p => (
                    <option key={p.id} value={p.id}>
                      HN: {p.hn} - {p.prefix}{p.firstName} {p.lastName} ({p.subdistrict} {p.village}) [{p.status}]
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  เลข HN ผู้ป่วย <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientHN}
                  onChange={e => setFormData({ ...formData, patientHN: e.target.value })}
                  placeholder="เช่น 67-00123"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  ชื่อ-สกุล ผู้ป่วย <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.patientName}
                  onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="ชื่อและนามสกุล"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ครั้งที่เยี่ยม (Visit Round)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">ครั้งที่</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.visitRound}
                    onChange={e => setFormData({ ...formData, visitRound: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ตำบล <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subdistrict}
                  onChange={e => setFormData({ 
                    ...formData, 
                    subdistrict: e.target.value,
                    village: getVillagesForSubdistrict(e.target.value)[0] || ''
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {PHON_NA_KAEO_SUBDISTRICTS.map(s => (
                    <option key={s.code} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  หมู่บ้าน <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.village}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                >
                  {currentVillages.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  บ้านเลขที่
                </label>
                <input
                  type="text"
                  value={formData.houseNo}
                  onChange={e => setFormData({ ...formData, houseNo: e.target.value })}
                  placeholder="เช่น 12/1"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  วันที่เยี่ยมบ้าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.visitDate}
                  onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                />
              </div>
            </div>

            {/* Visitor Team Details */}
            <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ผู้เยี่ยมบ้าน (ชื่อ-สกุล) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.visitorName}
                  onChange={e => setFormData({ ...formData, visitorName: e.target.value })}
                  placeholder="ชื่อผู้ปฏิบัติงานเยี่ยมบ้าน"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ตำแหน่งผู้เยี่ยม
                </label>
                <select
                  value={formData.visitorRole}
                  onChange={e => setFormData({ ...formData, visitorRole: e.target.value as any })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="พยาบาลวิชาชีพ">พยาบาลวิชาชีพ</option>
                  <option value="จพ.สาธารณสุข">จพ.สาธารณสุข</option>
                  <option value="นักวิชาการสาธารณสุข">นักวิชาการสาธารณสุข</option>
                  <option value="อสม. พี่เลี้ยง">อสม. พี่เลี้ยง</option>
                  <option value="ทีม 3 หมอ">ทีม 3 หมอ (หมอคนที่ 1/2/3)</option>
                  <option value="แพทย์/เภสัชกร">แพทย์ / เภสัชกร</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  หน่วยบริการ / รพ.สต.
                </label>
                <input
                  type="text"
                  value={formData.visitorUnit}
                  onChange={e => setFormData({ ...formData, visitorUnit: e.target.value })}
                  placeholder="เช่น รพ.สต.บ้านใหม่ไชยา"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>

            {/* Objectives Checkboxes */}
            <div className="pt-3 border-t border-slate-200/80">
              <label className="font-semibold text-slate-800 block mb-2">
                วัตถุประสงค์ในการเยี่ยมบ้านครั้งนี้ (เลือกได้หลายข้อ):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.dotsFollowUp}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, dotsFollowUp: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ติดตามการกินยา DOTS</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.adrScreening}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, adrScreening: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ประเมินอาการข้างเคียง (ADR)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.environmentCheck}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, environmentCheck: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ตรวจสิ่งแวดล้อม/ระบายอากาศ</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.sputumFollowUp}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, sputumFollowUp: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ติดตามนัดตรวจเสมหะ/CXR</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.contactScreening}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, contactScreening: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ติดตามคัดกรองผู้สัมผัส</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.healthEducation}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, healthEducation: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ให้สุขศึกษาและโภชนาการ</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.psychosocialSupport}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, psychosocialSupport: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ดูแลจิตใจ/กำลังใจครอบครัว</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.objectives.missedAppointment}
                    onChange={e => setFormData({
                      ...formData,
                      objectives: { ...formData.objectives, missedAppointment: e.target.checked }
                    })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>ติดตามผู้ป่วยขาดนัด/ขาดยา</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: สัญญาณชีพและอาการทางคลินิก */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-200 pb-2.5">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>2. สัญญาณชีพและอาการทางคลินิก (Vital Signs & Clinical Symptoms)</span>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">BT (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vitals.temperature || ''}
                  onChange={e => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, temperature: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="36.5"
                  className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">BP (mmHg)</label>
                <input
                  type="text"
                  value={formData.vitals.bloodPressure || ''}
                  onChange={e => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, bloodPressure: e.target.value }
                  })}
                  placeholder="120/80"
                  className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">PR (bpm)</label>
                <input
                  type="number"
                  value={formData.vitals.pulseRate || ''}
                  onChange={e => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, pulseRate: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="80"
                  className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">RR (bpm)</label>
                <input
                  type="number"
                  value={formData.vitals.respiratoryRate || ''}
                  onChange={e => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, respiratoryRate: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="18"
                  className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">SpO2 (%)</label>
                <input
                  type="number"
                  value={formData.vitals.oxygenSat || ''}
                  onChange={e => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, oxygenSat: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="98"
                  className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">BW น้ำหนัก (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vitals.bodyWeight || ''}
                  onChange={e => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, bodyWeight: parseFloat(e.target.value) || 0 }
                  })}
                  placeholder="55.0"
                  className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-0.5">แนวโน้มน้ำหนัก</label>
                <select
                  value={formData.vitals.weightChange || 'คงที่'}
                  onChange={e => setFormData({
                    ...formData,
                    vitals: { ...formData.vitals, weightChange: e.target.value as any }
                  })}
                  className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                >
                  <option value="เพิ่มขึ้น">เพิ่มขึ้น (ดี)</option>
                  <option value="คงที่">คงที่</option>
                  <option value="ลดลง">ลดลง (เฝ้าระวัง)</option>
                </select>
              </div>
            </div>

            {/* Symptoms Assessment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  อาการไอ (Cough)
                </label>
                <select
                  value={formData.symptoms.cough}
                  onChange={e => setFormData({
                    ...formData,
                    symptoms: { ...formData.symptoms, cough: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ไม่มี">ไม่มีอาการไอ</option>
                  <option value="ไอเล็กน้อย (ลดลง)">ไอเล็กน้อย (ทุเลาลง)</option>
                  <option value="ไอมาก/เรื้อรัง">ไอมาก / ไอเรื้อรัง</option>
                  <option value="ไอเป็นเลือด (Hemoptysis)">⚠️ ไอเป็นเลือด (Hemoptysis)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ลักษณะเสมหะ
                </label>
                <select
                  value={formData.symptoms.sputumCharacteristics || 'ไม่มีเสมหะ'}
                  onChange={e => setFormData({
                    ...formData,
                    symptoms: { ...formData.symptoms, sputumCharacteristics: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ไม่มีเสมหะ">ไม่มีเสมหะ</option>
                  <option value="เสมหะใส/ขาว">เสมหะใส / สีขาว</option>
                  <option value="เสมหะหนองสีเหลือง/เขียว">เสมหะข้นหนองสีเหลือง/เขียว</option>
                  <option value="เสมหะปนเลือด">⚠️ เสมหะมีเลือดปน</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ความอยากอาหาร
                </label>
                <select
                  value={formData.symptoms.appetite}
                  onChange={e => setFormData({
                    ...formData,
                    symptoms: { ...formData.symptoms, appetite: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ปกติ/เจริญอาหาร">ปกติ / รับประทานอาหารได้ดี</option>
                  <option value="เบื่ออาหารเล็กน้อย">เบื่ออาหารเล็กน้อย</option>
                  <option value="เบื่ออาหารมาก">เบื่ออาหารมาก / ทานได้น้อย</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.symptoms.fever}
                      onChange={e => setFormData({
                        ...formData,
                        symptoms: { ...formData.symptoms, fever: e.target.checked }
                      })}
                      className="rounded text-amber-600"
                    />
                    <span>มีไข้ต่ำๆ</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.symptoms.nightSweats}
                      onChange={e => setFormData({
                        ...formData,
                        symptoms: { ...formData.symptoms, nightSweats: e.target.checked }
                      })}
                      className="rounded text-amber-600"
                    />
                    <span>เหงื่อออกกลางคืน</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.symptoms.dyspnea}
                      onChange={e => setFormData({
                        ...formData,
                        symptoms: { ...formData.symptoms, dyspnea: e.target.checked }
                      })}
                      className="rounded text-red-600"
                    />
                    <span>เหนื่อยหอบ</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.symptoms.fatigue}
                      onChange={e => setFormData({
                        ...formData,
                        symptoms: { ...formData.symptoms, fatigue: e.target.checked }
                      })}
                      className="rounded text-slate-600"
                    />
                    <span>อ่อนเพลีย</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: การประเมินการกินยา DOTS & ผลข้างเคียง (ADR) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Pill className="w-4 h-4 text-purple-600" />
                <span>3. การประเมินการกำกับยา (DOTS) & ผลข้างเคียง (ADR Screening)</span>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full">
                Strict Adherence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ผู้กำกับการกินยา (DOTS Supervisor)
                </label>
                <select
                  value={formData.dotsSupervisor.type}
                  onChange={e => setFormData({
                    ...formData,
                    dotsSupervisor: { ...formData.dotsSupervisor, type: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="อสม. พี่เลี้ยง">อสม. พี่เลี้ยง</option>
                  <option value="เจ้าหน้าที่ รพ.สต.">เจ้าหน้าที่ รพ.สต.</option>
                  <option value="ญาติผู้ดูแล">ญาติผู้ดูแล</option>
                  <option value="กินเอง">รับประทานเอง</option>
                  <option value="V-DOT">วิดีโอคอลส่องกลืนยา (V-DOT)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ชื่อผู้กำกับการกินยา
                </label>
                <input
                  type="text"
                  value={formData.dotsSupervisor.name || ''}
                  onChange={e => setFormData({
                    ...formData,
                    dotsSupervisor: { ...formData.dotsSupervisor, name: e.target.value }
                  })}
                  placeholder="เช่น นางสมพร สุขสันต์ (อสม.)"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ความสม่ำเสมอในการรับประทานยา (Adherence)
                </label>
                <select
                  value={formData.adherence}
                  onChange={e => setFormData({
                    ...formData,
                    adherence: e.target.value as any
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold text-emerald-800"
                >
                  <option value="รับประทานยาทุกวัน สม่ำเสมอ 100%">✅ รับประทานยาทุกวัน สม่ำเสมอ 100%</option>
                  <option value="ลืมกินยา 1-2 วัน/สัปดาห์">⚠️ ลืมกินยา 1-2 วัน/สัปดาห์</option>
                  <option value="ลืมกินยา > 3 วัน/สัปดาห์ (เสี่ยงขาดยา)">🚨 ลืมกินยา &gt; 3 วัน/สัปดาห์ (เสี่ยงขาดยา)</option>
                  <option value="หยุดยาเอง / ปฏิเสธยา">⛔ หยุดยาเอง / ปฏิเสธยา</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  การนับเม็ดยา (Pill Count)
                </label>
                <select
                  value={formData.pillCountStatus}
                  onChange={e => setFormData({
                    ...formData,
                    pillCountStatus: e.target.value as any
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="จำนวนเม็ดยาคงเหลือถูกต้องตรงรอบ">จำนวนเม็ดยาคงเหลือถูกต้องตรงรอบ</option>
                  <option value="ยาเหลือเกินรอบ (กินไม่ครบ)">ยาเหลือเกินรอบ (กินไม่ครบ)</option>
                  <option value="ยาหมดก่อนรอบ">ยาหมดก่อนรอบ</option>
                  <option value="ไม่ได้นับเม็ดยา">ไม่ได้นับเม็ดยา</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  จำนวนวันที่ลืมกินยาใน 2 สัปดาห์ล่าสุด (วัน)
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={formData.missedDosesLast2Weeks}
                  onChange={e => setFormData({
                    ...formData,
                    missedDosesLast2Weeks: parseInt(e.target.value) || 0
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-center font-bold text-slate-800"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer w-full mt-4">
                  <input
                    type="checkbox"
                    checked={formData.dotsSupervisor.isSupervisingDaily}
                    onChange={e => setFormData({
                      ...formData,
                      dotsSupervisor: { ...formData.dotsSupervisor, isSupervisingDaily: e.target.checked }
                    })}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    อสม./ผู้ดูแล กำกับส่องกลืนยาทุกวัน
                  </span>
                </label>
              </div>
            </div>

            {/* ADR Side Effects Matrix */}
            <div className="pt-3 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-slate-800 block text-xs">
                  การประเมินผลข้างเคียงจากยาต้านวัณโรค (Side Effect & ADR Checklist):
                </label>
                <span className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ตัวสีแดงคือ Red Flags ต้องส่งต่อ รพ.</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
                {/* Mild Side Effects */}
                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.nauseaVomiting}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, nauseaVomiting: e.target.checked }
                    })}
                    className="rounded text-purple-600"
                  />
                  <span>คลื่นไส้ / อาเจียน</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.orangeUrineAcknowledged}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, orangeUrineAcknowledged: e.target.checked }
                    })}
                    className="rounded text-amber-600"
                  />
                  <span>ปัสสาวะสีส้มแดง (รับทราบ)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.jointPain}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, jointPain: e.target.checked }
                    })}
                    className="rounded text-purple-600"
                  />
                  <span>ปวดข้อ / ปวดกล้ามเนื้อ (Z)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.numbness}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, numbness: e.target.checked }
                    })}
                    className="rounded text-purple-600"
                  />
                  <span>ชาปลายมือปลายเท้า (H)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.itchingRash}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, itchingRash: e.target.checked }
                    })}
                    className="rounded text-purple-600"
                  />
                  <span>ผื่นคันตามผิวหนัง</span>
                </label>

                {/* Severe Red Flags */}
                <label className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-950 font-semibold cursor-pointer hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.jaundice}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, jaundice: e.target.checked },
                      referralRequired: e.target.checked ? true : formData.referralRequired,
                      referralReason: e.target.checked ? 'พบภาวะตัวเหลืองตาเหลือง สงสัยตับอักเสบจากยาต้านวัณโรค (Drug-induced Hepatitis)' : formData.referralReason
                    })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>🚨 ตัวเหลือง / ตาเหลือง (ตับ)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-950 font-semibold cursor-pointer hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.visionBlur}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, visionBlur: e.target.checked },
                      referralRequired: e.target.checked ? true : formData.referralRequired,
                      referralReason: e.target.checked ? 'ตามัว มองเห็นสีผิดปกติ สงสัยผลข้างเคียงจาก Ethambutol (Optic Neuritis)' : formData.referralReason
                    })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>🚨 ตามัว / ตาบอดสี (E)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-950 font-semibold cursor-pointer hover:bg-red-100">
                  <input
                    type="checkbox"
                    checked={formData.sideEffects.tinnitusDizziness}
                    onChange={e => setFormData({
                      ...formData,
                      sideEffects: { ...formData.sideEffects, tinnitusDizziness: e.target.checked }
                    })}
                    className="rounded text-red-600 focus:ring-red-500"
                  />
                  <span>หูอื้อ / เวียนศีรษะ</span>
                </label>
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  value={formData.sideEffects.otherSideEffects || ''}
                  onChange={e => setFormData({
                    ...formData,
                    sideEffects: { ...formData.sideEffects, otherSideEffects: e.target.value }
                  })}
                  placeholder="ระบุอาการข้างเคียงอื่นๆ เพิ่มเติม (ถ้ามี)..."
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: สุขาภิบาลสิ่งแวดล้อม & สภาพจิตใจ */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-200 pb-2.5">
              <Heart className="w-4 h-4 text-teal-600" />
              <span>4. สุขาภิบาลสิ่งแวดล้อมที่อยู่อาศัย & สภาพจิตสังคม (Environment & Psychosocial)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  การระบายอากาศในบ้าน (Ventilation)
                </label>
                <select
                  value={formData.environment.ventilation}
                  onChange={e => setFormData({
                    ...formData,
                    environment: { ...formData.environment, ventilation: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ดีมาก (โปร่ง แดดส่อง ลมถ่ายเทดี)">🌿 ดีมาก (โปร่ง แดดส่อง ลมถ่ายเทดี)</option>
                  <option value="ปานกลาง (ถ่ายเทพอใช้)">ปานกลาง (ถ่ายเทพอใช้)</option>
                  <option value="แออัด/ทึบ แสงแดดส่องไม่ถึง">⚠️ แออัด/ทึบ แสงแดดส่องไม่ถึง</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ลักษณะห้องนอน
                </label>
                <select
                  value={formData.environment.bedroomType}
                  onChange={e => setFormData({
                    ...formData,
                    environment: { ...formData.environment, bedroomType: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="แยกห้องนอนเดี่ยว">แยกห้องนอนเดี่ยว (ถูกต้อง)</option>
                  <option value="นอนรวมกับสมาชิกในบ้าน">นอนรวมกับสมาชิกในบ้าน (เสี่ยงแพร่เชื้อ)</option>
                  <option value="นอนนอกชาน/ที่โล่งโปร่ง">นอนนอกชาน / ที่โล่งโปร่ง</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  การบ้วนและกำจัดเสมหะ
                </label>
                <select
                  value={formData.environment.sputumDisposalMethod}
                  onChange={e => setFormData({
                    ...formData,
                    environment: { ...formData.environment, sputumDisposalMethod: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="กระโถน/ถุงทิ้งมิดชิดผสมน้ำยาฆ่าเชื้อ">กระโถน/ถุงทิ้งมิดชิดผสมน้ำยาฆ่าเชื้อ</option>
                  <option value="กระดาษทิชชู่ใส่ถุงเผาทำลาย">กระดาษทิชชู่ใส่ถุงเผาทำลาย</option>
                  <option value="บ้วนทิ้งลงโถส้วม">บ้วนทิ้งลงโถส้วม</option>
                  <option value="บ้วนทิ้งไม่ถูกสุขลักษณะ">⚠️ บ้วนทิ้งไม่ถูกสุขลักษณะ</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  การสวมหน้ากากอนามัย
                </label>
                <select
                  value={formData.environment.maskWearingCompliance}
                  onChange={e => setFormData({
                    ...formData,
                    environment: { ...formData.environment, maskWearingCompliance: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="สวมหน้ากากสม่ำเสมอเมื่อมีคนอยู่ใกล้">สวมสม่ำเสมอเมื่อมีคนอยู่ใกล้</option>
                  <option value="สวมเป็นครั้งคราว">สวมเป็นครั้งคราว</option>
                  <option value="ไม่สวม">ไม่สวมหน้ากากอนามัย</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  การสนับสนุนจากครอบครัว
                </label>
                <select
                  value={formData.psychosocial.familySupport}
                  onChange={e => setFormData({
                    ...formData,
                    psychosocial: { ...formData.psychosocial, familySupport: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ครอบครัวดูแลและให้กำลังใจดีมาก">ครอบครัวดูแลและให้กำลังใจดีมาก</option>
                  <option value="ครอบครัวดูแลพอใช้">ครอบครัวดูแลพอใช้</option>
                  <option value="ขาดผู้ดูแล/อยู่ลำพัง">ขาดผู้ดูแล / อยู่ลำพัง</option>
                  <option value="ครอบครัวรังเกียจ/มีความวิตกกังวล">ครอบครัวมีความวิตกกังวลสูง</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ระดับความเครียด/กังวล
                </label>
                <select
                  value={formData.psychosocial.stressAnxietyLevel}
                  onChange={e => setFormData({
                    ...formData,
                    psychosocial: { ...formData.psychosocial, stressAnxietyLevel: e.target.value as any }
                  })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="ปกติ">ปกติ (ปรับตัวได้ดี)</option>
                  <option value="เครียด/กังวลปานกลาง">เครียด / กังวลปานกลาง</option>
                  <option value="เครียดมาก/ซึมเศร้า">เครียดมาก / ซึมเศร้า</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: พิกัด GPS จุดที่เยี่ยมบ้านจริง */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>5. พิกัด GPS จุดที่ลงพื้นที่เยี่ยมบ้านจริง (Real-time Geolocation Check-in)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCurrentGPS}
                  disabled={gpsLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <Compass className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsLoading ? 'กำลังตรวจจับ GPS...' : 'จับพิกัด GPS ปัจจุบัน'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMapPickerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>ปักหมุดบนแผนที่</span>
                </button>

                {(formData.visitLat && formData.visitLng) ? (
                  <button
                    type="button"
                    onClick={() => openGoogleMapsNavigation({
                      lat: formData.visitLat,
                      lng: formData.visitLng,
                      address: `${formData.houseNo ? `บ้านเลขที่ ${formData.houseNo} ` : ''}${formData.village} ${formData.subdistrict}`,
                      name: formData.patientName
                    })}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                    title="ทดสอบเปิดนำทางในแอป Google Maps"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>ทดสอบนำทาง Google Maps</span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">ละติจูด (Latitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.visitLat || ''}
                  onChange={e => setFormData({ ...formData, visitLat: parseFloat(e.target.value) || 0 })}
                  placeholder="17.XXXXXX"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">ลองจิจูด (Longitude)</label>
                <input
                  type="number"
                  step="0.000001"
                  value={formData.visitLng || ''}
                  onChange={e => setFormData({ ...formData, visitLng: parseFloat(e.target.value) || 0 })}
                  placeholder="104.XXXXXX"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>

            {gpsNotice && (
              <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{gpsNotice}</span>
              </div>
            )}
          </div>

          {/* Section 6: สรุปผล แผนการดูแล และสถานะการเยี่ยมบ้าน */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm border-b border-slate-200 pb-2.5">
              <Stethoscope className="w-4 h-4 text-emerald-700" />
              <span>6. สรุปผลการประเมิน แผนการดูแล และสถานะการเยี่ยมบ้าน (Summary & Action Plan)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  คำแนะนำ สุขศึกษา และบันทึกข้อเสนอแนะเพิ่มเติม:
                </label>
                <textarea
                  rows={3}
                  value={formData.recommendationsAndNotes}
                  onChange={e => setFormData({ ...formData, recommendationsAndNotes: e.target.value })}
                  placeholder="บันทึกรายละเอียดคำแนะนำที่ให้แก่ผู้ป่วยและญาติ..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    สถานะสรุปผลการเยี่ยมบ้านครั้งนี้ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as HomeVisitStatus })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-900"
                  >
                    <option value="เยี่ยมสำเร็จ (ปกติ)">✅ เยี่ยมสำเร็จ (ปกติ ไม่พบปัญหารุนแรง)</option>
                    <option value="พบปัญหา/ต้องติดตามใกล้ชิด">⚠️ พบปัญหา / ต้องติดตามใกล้ชิด</option>
                    <option value="ส่งต่อแพทย์/รพ. (Referral)">🚨 ส่งต่อแพทย์ / รพ. ด่วน (Referral)</option>
                    <option value="ไม่อยู่บ้าน/เลื่อนนัด">⏳ ไม่อยู่บ้าน / เลื่อนการเยี่ยม</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">วันนัดตรวจ รพ. ครั้งถัดไป</label>
                    <input
                      type="date"
                      value={formData.nextAppointmentDate || ''}
                      onChange={e => setFormData({ ...formData, nextAppointmentDate: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">กำหนดเยี่ยมบ้านรอบถัดไป</label>
                    <input
                      type="date"
                      value={formData.nextVisitDueDate || ''}
                      onChange={e => setFormData({ ...formData, nextVisitDueDate: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-semibold text-emerald-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Trigger Box */}
            <div className={`p-3.5 rounded-xl border transition ${
              formData.referralRequired 
                ? 'bg-red-50/90 border-red-300 text-red-950' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <label className="flex items-center gap-2 cursor-pointer font-bold mb-2">
                <input
                  type="checkbox"
                  checked={formData.referralRequired}
                  onChange={e => setFormData({ ...formData, referralRequired: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span>จำเป็นต้องส่งต่อพบแพทย์ / โรงพยาบาลโพนนาแก้ว ทันที (Urgent Referral)</span>
              </label>

              {formData.referralRequired && (
                <div className="pl-6 space-y-2 animate-fade-in">
                  <input
                    type="text"
                    value={formData.referralReason || ''}
                    onChange={e => setFormData({ ...formData, referralReason: e.target.value })}
                    placeholder="ระบุสาเหตุการส่งต่อ เช่น พบภาวะตัวเหลืองตาเหลือง / แพ้ยารุนแรง / หอบเหนื่อย..."
                    className="w-full p-2 rounded-lg border border-red-300 bg-white text-xs font-semibold text-red-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-200 transition"
            >
              <Save className="w-4 h-4" />
              <span>{existingRecord ? 'บันทึกการแก้ไข' : 'บันทึกการเยี่ยมบ้าน'}</span>
            </button>
          </div>
        </form>

      </div>

      {/* Location Picker Modal for Picking Coordinates */}
      {isMapPickerOpen && (
        <LocationPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          initialLat={formData.visitLat}
          initialLng={formData.visitLng}
          subdistrictName={formData.subdistrict}
          patientName={formData.patientName}
          onSelectLocation={(sLat, sLng) => {
            setFormData(prev => ({
              ...prev,
              visitLat: sLat,
              visitLng: sLng
            }));
            setGpsNotice(`📍 บันทึกพิกัดจุดเยี่ยมบ้านเรียบร้อย: Lat ${sLat}, Lng ${sLng}`);
            setTimeout(() => setGpsNotice(null), 4000);
          }}
        />
      )}
    </div>
  );
};

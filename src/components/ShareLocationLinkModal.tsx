import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { 
  X, MapPin, Copy, Share2, Check, QrCode, ExternalLink, 
  Send, ShieldCheck, Smartphone, Info, Users, CheckSquare, 
  Square, Printer, Search, Filter, Download, Sparkles,
  Building2, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { PHON_NA_KAEO_SUBDISTRICTS } from '../data/mockData';

interface ShareLocationLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  initialPatient?: Patient | null;
  initialPatients?: Patient[] | null;
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
  initialPatients,
  allPatients,
  patients,
  onSelectPatient,
  onOpenPublicPreview
}) => {
  // Navigation tabs: 'batch' (Multi-Select & Bulk Send) | 'single' (Single Patient) | 'print' (Printable QR Cards)
  const [activeTab, setActiveTab] = useState<'batch' | 'single' | 'print'>('batch');
  
  // Single mode state
  const [copiedSingle, setCopiedSingle] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [privacyMode, setPrivacyMode] = useState(false);

  // Normalize patient list
  const patientList = useMemo(() => {
    return allPatients || patients || [];
  }, [allPatients, patients]);

  // Initial single patient selection
  const effectivePatientProp = patient || initialPatient || null;
  const [selectedSingleId, setSelectedSingleId] = useState<string>(
    effectivePatientProp ? effectivePatientProp.id : (patientList.length > 0 ? patientList[0].id : '')
  );

  // Multi-Select Patient IDs State
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(() => {
    if (initialPatients && initialPatients.length > 0) {
      return initialPatients.map(p => p.id);
    }
    if (effectivePatientProp) {
      return [effectivePatientProp.id];
    }
    // Default: select active patients
    return patientList.slice(0, 5).map(p => p.id);
  });

  // Filters for Batch Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [subdistrictFilter, setSubdistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coordFilter, setCoordFilter] = useState<'all' | 'missing' | 'has_coords'>('all');

  // Base URL generation
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const generatePinUrl = (patientId: string) => {
    return `${origin}${pathname}?pinLocationFor=${encodeURIComponent(patientId)}`;
  };

  const generateQrUrl = (url: string, size = 220) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  };

  // Filtered patients for selection list
  const filteredPatients = useMemo(() => {
    return patientList.filter(p => {
      const matchSearch = !searchQuery || 
        p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.hn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.dotsSupervisorName && p.dotsSupervisorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSub = subdistrictFilter === 'all' || p.subdistrict === subdistrictFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const hasCoords = p.lat && p.lng && p.lat !== 0 && p.lng !== 0;
      const matchCoord = coordFilter === 'all' || 
        (coordFilter === 'missing' && !hasCoords) || 
        (coordFilter === 'has_coords' && hasCoords);

      return matchSearch && matchSub && matchStatus && matchCoord;
    });
  }, [patientList, searchQuery, subdistrictFilter, statusFilter, coordFilter]);

  // Selected Patients Objects
  const selectedPatients = useMemo(() => {
    return patientList.filter(p => selectedBatchIds.includes(p.id));
  }, [patientList, selectedBatchIds]);

  // Active single patient
  const activeSinglePatient = useMemo(() => {
    return patientList.find(p => p.id === selectedSingleId) || effectivePatientProp || (patientList[0] || null);
  }, [patientList, selectedSingleId, effectivePatientProp]);

  // Toggle selection for a patient
  const toggleSelectPatient = (id: string) => {
    setSelectedBatchIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all currently filtered
  const selectAllFiltered = () => {
    const idsToAdd = filteredPatients.map(p => p.id);
    setSelectedBatchIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
  };

  // Deselect all currently filtered
  const deselectAllFiltered = () => {
    const idsToRemove = new Set(filteredPatients.map(p => p.id));
    setSelectedBatchIds(prev => prev.filter(id => !idsToRemove.has(id)));
  };

  // Generate Consolidated LINE message for all selected patients
  const generateBatchLineMessage = () => {
    if (selectedPatients.length === 0) return '';
    
    let msg = `📍 [ระบบระบุพิกัดบ้านผู้ป่วยวัณโรค อ.โพนนาแก้ว]\n`;
    msg += `เรียน เจ้าหน้าที่สาธารณสุข / อสม. พี่เลี้ยง\n`;
    msg += `ขอความร่วมมือช่วยกดลิงก์ด้านล่าง เพื่อเปิดแผนที่และปักหมุด GPS ตำแหน่งบ้านผู้ป่วย (${selectedPatients.length} ราย):\n\n`;

    selectedPatients.forEach((p, idx) => {
      const displayName = privacyMode 
        ? `${p.prefix}${p.firstName.charAt(0)}*** ${p.lastName.charAt(0)}***`
        : `${p.prefix}${p.firstName} ${p.lastName}`;
      const url = generatePinUrl(p.id);
      
      msg += `📌 รายที่ ${idx + 1}: คุณ${displayName} (HN: ${p.hn})\n`;
      msg += `🏠 ที่อยู่: ${p.subdistrict} (${p.village}) ${p.houseNo ? `บ้านเลขที่ ${p.houseNo}` : ''}\n`;
      if (p.dotsSupervisorName) {
        msg += `👤 อสม.ดูแล: ${p.dotsSupervisorName}\n`;
      }
      msg += `👉 กดลิงก์เพื่อปักหมุด: ${url}\n\n`;
    });

    msg += `💡 หมายเหตุ: อสม./ผู้ป่วย สามารถกดลิงก์และยืนยันตัวตนด้วย Google/อีเมล เพื่อส่งพิกัดได้ทันทีครับ`;
    return msg;
  };

  // Copy batch message
  const handleCopyBatchMessage = () => {
    const text = generateBatchLineMessage();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2500);
  };

  // Share batch message to LINE
  const handleShareBatchToLine = () => {
    const text = generateBatchLineMessage();
    if (!text) return;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, '_blank');
  };

  // Copy single link helper
  const handleCopySingleLink = (p: Patient) => {
    const url = generatePinUrl(p.id);
    navigator.clipboard.writeText(url);
    setCopiedCardId(p.id);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  // Share single link to LINE
  const handleShareSingleToLine = (p: Patient) => {
    const displayName = privacyMode 
      ? `${p.prefix}${p.firstName.charAt(0)}*** ${p.lastName.charAt(0)}***`
      : `${p.prefix}${p.firstName} ${p.lastName}`;
    const url = generatePinUrl(p.id);
    const msg = `📍 [ระบบระบุพิกัดบ้านผู้ป่วยวัณโรค อ.โพนนาแก้ว]\nขอความร่วมมือ คุณ${displayName} (HN: ${p.hn})\nหรือ อสม.พี่เลี้ยง ช่วยกดลิงก์นี้เพื่อระบุ/ส่งพิกัดตำแหน่งบ้านเข้าสู่ระบบ รพ.โพนนาแก้ว ครับ:\n${url}`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(msg)}`;
    window.open(lineUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Share2 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight flex items-center gap-2">
                <span>สร้างลิงก์ & QR Code ระบุพิกัดบ้านผู้ป่วย</span>
                <span className="text-[10px] bg-amber-400/30 text-amber-200 border border-amber-300/40 px-2 py-0.5 rounded-full font-semibold">
                  รองรับเลือกหลายคน
                </span>
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                ส่งลิงก์และ QR Code ให้ผู้ป่วย หรือ อสม. พี่เลี้ยง กดปักหมุด GPS จากมือถือเพื่อเข้าถึงพิกัดที่แม่นยำ
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'batch'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>เลือกหลายคน & ส่งพร้อมกัน</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedBatchIds.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300 text-slate-700'
              }`}>
                {selectedBatchIds.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'single'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>สร้างรายบุคคล (Single)</span>
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'print'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>พิมพ์ใบการ์ด QR Code ({selectedPatients.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                privacyMode 
                  ? 'bg-amber-100 text-amber-900 border-amber-300' 
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
              title="ซ่อนนามสกุลผู้ป่วยเพื่อความปลอดภัยของข้อมูลส่วนบุคคล (PDPA)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{privacyMode ? 'โหมดคุ้มครองชื่อ (ON)' : 'ซ่อนชื่อคนไข้ (PDPA)'}</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* TAB 1: BATCH MULTI-SELECT & SEND TOGETHER */}
          {activeTab === 'batch' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Batch Action Highlights Bar */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>ส่งลิงก์ระบุพิกัดพร้อมกัน ({selectedBatchIds.length} รายที่เลือก)</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      รวมลิงก์ของคนไข้ทั้งหมดที่เลือกเป็นข้อความเดียว สำหรับแชร์เข้ากลุ่ม LINE หรือคัดลอกส่งต่อ
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleShareBatchToLine}
                      disabled={selectedBatchIds.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      <span>แชร์รวมส่ง LINE ({selectedBatchIds.length})</span>
                    </button>

                    <button
                      onClick={handleCopyBatchMessage}
                      disabled={selectedBatchIds.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {copiedBatch ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedBatch ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกข้อความสรุปรวม'}</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('print')}
                      disabled={selectedBatchIds.length === 0}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Printer className="w-4 h-4 text-amber-600" />
                      <span>ดู QR รวม</span>
                    </button>
                  </div>
                </div>

                {/* Preview of Batch Message */}
                {selectedBatchIds.length > 0 && (
                  <div className="bg-white/90 border border-emerald-200 rounded-xl p-3 text-xs text-slate-700 max-h-32 overflow-y-auto font-mono whitespace-pre-line">
                    {generateBatchLineMessage()}
                  </div>
                )}
              </div>

              {/* Patient Filters Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหา ชื่อ, HN, หมู่บ้าน, อสม...."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <select
                    value={subdistrictFilter}
                    onChange={e => setSubdistrictFilter(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">เลือกตำบล (ทุกตำบล)</option>
                    {PHON_NA_KAEO_SUBDISTRICTS.map(s => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={coordFilter}
                    onChange={e => setCoordFilter(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">สถานะพิกัด (ทั้งหมด)</option>
                    <option value="missing">🔴 ยังไม่มีพิกัด / พิกัดว่าง</option>
                    <option value="has_coords">🟢 มีพิกัดแล้ว</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    onClick={selectAllFiltered}
                    className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl transition"
                  >
                    เลือกทั้งหมด ({filteredPatients.length})
                  </button>
                  <button
                    onClick={deselectAllFiltered}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    ยกเลิกทั้งหมด
                  </button>
                </div>
              </div>

              {/* Patient Selection Checklist Grid */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(p => {
                    const isSelected = selectedBatchIds.includes(p.id);
                    const hasCoords = p.lat && p.lng && p.lat !== 0 && p.lng !== 0;
                    const displayName = privacyMode 
                      ? `${p.prefix}${p.firstName.charAt(0)}*** ${p.lastName.charAt(0)}***`
                      : `${p.prefix}${p.firstName} ${p.lastName}`;
                    const isCopiedThis = copiedCardId === p.id;

                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelectPatient(p.id)}
                        className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition ${
                          isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectPatient(p.id);
                            }}
                            className="p-1 text-emerald-600 focus:outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                HN: {p.hn}
                              </span>
                              <span className="font-bold text-sm text-slate-900">{displayName}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {p.status === 'Active' ? 'กำลังรักษา' : p.status}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-2">
                              <span>ที่อยู่: {p.subdistrict} ({p.village}) {p.houseNo ? `เลขที่ ${p.houseNo}` : ''}</span>
                              {p.dotsSupervisorName && (
                                <span className="text-slate-500 font-medium">&bull; อสม: {p.dotsSupervisorName}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                              {hasCoords ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  <span>พิกัดปัจจุบัน: {p.lat.toFixed(5)}, {p.lng.toFixed(5)}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                                  <MapPin className="w-3 h-3 text-rose-500" />
                                  <span>ยังไม่มีพิกัดในระบบ</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Row Actions */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleCopySingleLink(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                            title="คัดลอกลิงก์ของคนไข้รายนี้"
                          >
                            {isCopiedThis ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isCopiedThis ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                          </button>

                          <button
                            onClick={() => handleShareSingleToLine(p)}
                            className="p-1.5 rounded-lg bg-[#06C755]/10 hover:bg-[#06C755] text-[#06C755] hover:text-white transition"
                            title="แชร์ลิงก์คนนี้เข้า LINE"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedSingleId(p.id);
                              setActiveTab('single');
                            }}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white transition"
                            title="ดู QR Code รายบุคคล"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    ไม่พบข้อมูลผู้ป่วยที่ตรงตามเงื่อนไข
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SINGLE PATIENT QR & LINK */}
          {activeTab === 'single' && activeSinglePatient && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Switch Patient Select */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-700 shrink-0">
                  เลือกผู้ป่วยสำหรับแสดง QR Code:
                </label>
                <select
                  value={activeSinglePatient.id}
                  onChange={(e) => {
                    const targetId = e.target.value;
                    setSelectedSingleId(targetId);
                    const found = patientList.find(p => p.id === targetId);
                    if (found && onSelectPatient) onSelectPatient(found);
                  }}
                  className="w-full sm:w-80 p-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  {patientList.map(p => (
                    <option key={p.id} value={p.id}>
                      HN: {p.hn} - {p.prefix}{p.firstName} {p.lastName} ({p.subdistrict})
                    </option>
                  ))}
                </select>
              </div>

              {/* Single Patient Info Badge */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      HN: {activeSinglePatient.hn}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {privacyMode 
                        ? `${activeSinglePatient.prefix}${activeSinglePatient.firstName.charAt(0)}*** ${activeSinglePatient.lastName.charAt(0)}***`
                        : `${activeSinglePatient.prefix}${activeSinglePatient.firstName} ${activeSinglePatient.lastName}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    ที่อยู่: {activeSinglePatient.subdistrict} ({activeSinglePatient.village}) {activeSinglePatient.houseNo ? `บ้านเลขที่ ${activeSinglePatient.houseNo}` : ''}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                    <span>พิกัดปัจจุบัน: {activeSinglePatient.lat ? `${activeSinglePatient.lat.toFixed(6)}, ${activeSinglePatient.lng.toFixed(6)}` : 'ยังไม่มีพิกัด'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareSingleToLine(activeSinglePatient)}
                    className="px-3 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>แชร์เข้า LINE</span>
                  </button>
                </div>
              </div>

              {/* QR and Direct URL */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                
                {/* QR Display */}
                <div className="sm:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-44 h-44 bg-white p-2.5 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center">
                    <img 
                      src={generateQrUrl(generatePinUrl(activeSinglePatient.id), 250)} 
                      alt="Location Pinning QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>สแกน QR Code ด้วยมือถือเพื่อปักหมุด</span>
                  </p>
                </div>

                {/* Direct Links */}
                <div className="sm:col-span-7 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL สำหรับส่งให้ผู้ป่วยหรือ อสม.:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={generatePinUrl(activeSinglePatient.id)}
                        className="w-full p-2.5 pr-24 rounded-xl bg-slate-100 border border-slate-300 font-mono text-xs text-slate-800 font-semibold focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generatePinUrl(activeSinglePatient.id));
                          setCopiedSingle(true);
                          setTimeout(() => setCopiedSingle(false), 2000);
                        }}
                        className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-sm"
                      >
                        {copiedSingle ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSingle ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => window.open(generatePinUrl(activeSinglePatient.id), '_blank')}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-300" />
                      <span>เปิดทดสอบในแท็บใหม่</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedBatchIds([activeSinglePatient.id]);
                        setActiveTab('print');
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span>พิมพ์การ์ดคนนี้</span>
                    </button>
                  </div>

                  {/* Security notes */}
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>ความปลอดภัยและการใช้งาน:</span>
                    </div>
                    <p className="leading-relaxed text-emerald-900">
                      ผู้ป่วยหรือ อสม. สามารถเปิดลิงก์บนสมาร์ตโฟน จากนั้นกดยืนยันตัวตนด้วย Google/อีเมล และกดยืนยันพิกัด GPS ได้ทันทีโดยไม่ต้องจำรหัสผ่าน
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRINTABLE QR CODE CARDS GALLERY */}
          {activeTab === 'print' && (
            <div className="space-y-5 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>แกลเลอรีการ์ด QR Code สำหรับพิมพ์แจก อสม. ({selectedPatients.length} ราย)</span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    สามารถกดปุ่ม "พิมพ์เอกสาร A4" เพื่อพิมพ์การ์ดสำหรับแจก อสม. ประจำหมู่บ้านนำไปสแกนปักหมุด
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>สั่งพิมพ์การ์ดทั้งหมด (A4 Print)</span>
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
                {selectedPatients.map((p, idx) => {
                  const url = generatePinUrl(p.id);
                  const qrSrc = generateQrUrl(url, 220);
                  const displayName = privacyMode 
                    ? `${p.prefix}${p.firstName.charAt(0)}*** ${p.lastName.charAt(0)}***`
                    : `${p.prefix}${p.firstName} ${p.lastName}`;

                  return (
                    <div 
                      key={p.id}
                      className="bg-white border-2 border-slate-300 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 shadow-sm break-inside-avoid"
                    >
                      <div className="w-full border-b border-slate-200 pb-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">
                          รพ.โพนนาแก้ว &bull; สสอ.โพนนาแก้ว
                        </span>
                        <h5 className="font-bold text-sm text-slate-900 mt-0.5">
                          {displayName}
                        </h5>
                        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-600 mt-0.5">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-bold">HN: {p.hn}</span>
                          <span>{p.subdistrict}</span>
                        </div>
                      </div>

                      {/* QR Image */}
                      <div className="w-36 h-36 bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-center">
                        <img 
                          src={qrSrc} 
                          alt={`QR for ${p.hn}`}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 w-full">
                        <p className="font-semibold text-slate-800 text-[11px]">
                          {p.village} {p.houseNo ? `บ้านเลขที่ ${p.houseNo}` : ''}
                        </p>
                        {p.dotsSupervisorName && (
                          <p className="text-[10px] text-slate-500">
                            อสม. ผู้ดูแล: {p.dotsSupervisorName}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-400">
                          สแกนด้วยกล้องมือถือหรือ LINE เพื่อระบุพิกัด GPS
                        </p>
                      </div>

                      {/* Card Button */}
                      <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-xs print:hidden">
                        <button
                          onClick={() => handleCopySingleLink(p)}
                          className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>คัดลอกลิงก์</span>
                        </button>

                        <button
                          onClick={() => handleShareSingleToLine(p)}
                          className="text-[11px] text-[#06C755] font-bold hover:underline flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>ส่ง LINE</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedPatients.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  ยังไม่ได้เลือกผู้ป่วย กรุณากลับไปที่แท็บ "เลือกหลายคน" เพื่อเลือกผู้ป่วยที่ต้องการพิมพ์ QR Code
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 font-medium">
            เลือกผู้ป่วยแล้ว <strong className="text-emerald-700">{selectedBatchIds.length}</strong> จากทั้งหมด {patientList.length} ราย
          </div>

          <div className="flex items-center gap-2">
            {selectedBatchIds.length > 0 && activeTab === 'batch' && (
              <button
                onClick={handleShareBatchToLine}
                className="px-4 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold transition flex items-center gap-1.5 shadow"
              >
                <Send className="w-4 h-4" />
                <span>แชร์ส่ง LINE ({selectedBatchIds.length} ราย)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

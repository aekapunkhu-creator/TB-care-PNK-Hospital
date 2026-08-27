import React from 'react';
import { HomeVisitRecord, Patient } from '../types';
import { Printer, X, Download, Stethoscope, Check, AlertTriangle, ShieldCheck, Heart, User, Compass } from 'lucide-react';
import { openGoogleMapsNavigation, getGoogleMapsDirectionsUrl } from '../utils/navigation';

interface HomeVisitPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HomeVisitRecord;
  patient?: Patient | null;
}

export const HomeVisitPrintModal: React.FC<HomeVisitPrintModalProps> = ({
  isOpen,
  onClose,
  record,
  patient
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const gmapsUrl = getGoogleMapsDirectionsUrl({
    lat: record.visitLat,
    lng: record.visitLng,
    address: `${record.houseNo ? `บ้านเลขที่ ${record.houseNo} ` : ''}${record.village} ${record.subdistrict}`,
    name: record.patientName
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">
              พิมพ์แบบรายงานการเยี่ยมบ้านผู้ป่วยวัณโรค (TB Home Visit Record)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openGoogleMapsNavigation({
                lat: record.visitLat,
                lng: record.visitLng,
                address: `${record.houseNo ? `บ้านเลขที่ ${record.houseNo} ` : ''}${record.village} ${record.subdistrict}`,
                name: record.patientName
              })}
              className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition"
              title="เปิดนำทางด้วย Google Maps"
            >
              <Compass className="w-4 h-4" />
              <span>นำทาง Google Maps</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / บันทึก PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="overflow-y-auto p-8 sm:p-12 text-slate-900 text-xs leading-relaxed bg-white print:p-0 print:text-black">
          
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                NATIONAL TUBERCULOSIS CONTROL PROGRAM (NTP-THAILAND)
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                แบบบันทึกและประเมินผลการเยี่ยมบ้านผู้ป่วยวัณโรค (TB Home Visit Form)
              </h1>
              <div className="text-xs text-slate-700">
                กลุ่มงานเวชปฏิบัติครอบครัวและบริการด้านปฐมภูมิ โรงพยาบาลโพนนาแก้ว ร่วมกับ สาธารณสุขอำเภอโพนนาแก้ว
              </div>
            </div>

            <div className="text-right border border-slate-400 p-2.5 rounded-lg text-[11px] space-y-0.5 bg-slate-50 print:bg-transparent">
              <div><strong>รหัสการเยี่ยม:</strong> {record.id}</div>
              <div><strong>ครั้งที่เยี่ยม:</strong> ครั้งที่ {record.visitRound}</div>
              <div><strong>วันที่เยี่ยม:</strong> {record.visitDate} {record.visitTime ? `(${record.visitTime} น.)` : ''}</div>
            </div>
          </div>

          {/* Section 1: ข้อมูลผู้ป่วย */}
          <div className="mb-4">
            <div className="bg-slate-200 print:bg-slate-100 font-bold px-2 py-1 text-slate-900 text-xs mb-2 border-l-4 border-emerald-700">
              1. ข้อมูลผู้ป่วย (Patient Demographic)
            </div>
            <div className="grid grid-cols-3 gap-2 px-2 text-xs">
              <div><strong>ชื่อ-สกุล:</strong> {record.patientName}</div>
              <div><strong>เลข HN:</strong> {record.patientHN}</div>
              <div><strong>การวินิจฉัย:</strong> {patient?.tbType || 'วัณโรคปอด (Pulmonary TB)'}</div>
              <div><strong>ที่อยู่:</strong> {record.houseNo ? `บ้านเลขที่ ${record.houseNo} ` : ''}{record.village}</div>
              <div><strong>ตำบล:</strong> {record.subdistrict}</div>
              <div><strong>อำเภอ/จังหวัด:</strong> อ.โพนนาแก้ว จ.สกลนคร</div>
              <div className="col-span-2">
                <strong>พิกัด GPS:</strong> {record.visitLat?.toFixed(6) || '-'}, {record.visitLng?.toFixed(6) || '-'}{' '}
                <a href={gmapsUrl} target="_blank" rel="noreferrer" className="text-sky-700 underline font-semibold text-[11px] ml-1 print:hidden">
                  (เปิดนำทาง Google Maps)
                </a>
              </div>
              <div><strong>สูตรยา:</strong> {patient?.regimen || '2HRZE/4HR'}</div>
            </div>
          </div>

          {/* Section 2: สัญญาณชีพและอาการทางคลินิก */}
          <div className="mb-4">
            <div className="bg-slate-200 print:bg-slate-100 font-bold px-2 py-1 text-slate-900 text-xs mb-2 border-l-4 border-blue-700">
              2. สัญญาณชีพและอาการทางคลินิก (Vital Signs & Symptoms)
            </div>
            <div className="grid grid-cols-4 gap-2 px-2 text-xs mb-2">
              <div><strong>อุณหภูมิ:</strong> {record.vitals.temperature || '-'} °C</div>
              <div><strong>ความดันโลหิต:</strong> {record.vitals.bloodPressure || '-'} mmHg</div>
              <div><strong>ชีพจร:</strong> {record.vitals.pulseRate || '-'} ครั้ง/นาที</div>
              <div><strong>การหายใจ:</strong> {record.vitals.respiratoryRate || '-'} ครั้ง/นาที</div>
              <div><strong>ออกซิเจนในเลือด:</strong> {record.vitals.oxygenSat || '-'} %</div>
              <div><strong>น้ำหนักตัว:</strong> {record.vitals.bodyWeight || '-'} กก.</div>
              <div><strong>แนวโน้มน้ำหนัก:</strong> {record.vitals.weightChange || 'คงที่'}</div>
              <div><strong>ความอยากอาหาร:</strong> {record.symptoms.appetite}</div>
            </div>

            <div className="px-2 text-xs flex flex-wrap gap-x-4 gap-y-1 bg-slate-50 print:bg-transparent p-2 border border-slate-200 rounded">
              <div><strong>อาการไอ:</strong> {record.symptoms.cough}</div>
              <div><strong>เสมหะ:</strong> {record.symptoms.sputumCharacteristics || 'ไม่มี'}</div>
              <div><strong>มีไข้:</strong> {record.symptoms.fever ? 'มี' : 'ไม่มี'}</div>
              <div><strong>เหงื่อออกกลางคืน:</strong> {record.symptoms.nightSweats ? 'มี' : 'ไม่มี'}</div>
              <div><strong>เหนื่อยหอบ:</strong> {record.symptoms.dyspnea ? 'มี (หอบ)' : 'ไม่มี'}</div>
              <div><strong>อ่อนเพลีย:</strong> {record.symptoms.fatigue ? 'มี' : 'ไม่มี'}</div>
            </div>
          </div>

          {/* Section 3: การประเมินการกินยา DOTS & ผลข้างเคียง (ADR) */}
          <div className="mb-4">
            <div className="bg-slate-200 print:bg-slate-100 font-bold px-2 py-1 text-slate-900 text-xs mb-2 border-l-4 border-purple-700">
              3. การประเมินการกำกับยา (DOTS) และผลข้างเคียงจากยา (ADR)
            </div>
            <div className="grid grid-cols-3 gap-2 px-2 text-xs mb-2">
              <div><strong>ผู้กำกับยา:</strong> {record.dotsSupervisor.type} {record.dotsSupervisor.name ? `(${record.dotsSupervisor.name})` : ''}</div>
              <div><strong>ความสม่ำเสมอ:</strong> {record.adherence}</div>
              <div><strong>การนับเม็ดยา:</strong> {record.pillCountStatus}</div>
            </div>

            <div className="px-2 text-xs">
              <strong className="block mb-1">ผลข้างเคียงจากยาต้านวัณโรค (ADR Checklist):</strong>
              <div className="grid grid-cols-3 gap-1 border border-slate-300 p-2 rounded text-[11px]">
                <div className={record.sideEffects.nauseaVomiting ? 'font-bold text-red-700' : 'text-slate-600'}>
                  [{record.sideEffects.nauseaVomiting ? '✓' : ' '}] คลื่นไส้/อาเจียน
                </div>
                <div className={record.sideEffects.orangeUrineAcknowledged ? 'text-slate-700' : 'text-slate-600'}>
                  [{record.sideEffects.orangeUrineAcknowledged ? '✓' : ' '}] ปัสสาวะสีส้ม (รับทราบ)
                </div>
                <div className={record.sideEffects.jointPain ? 'font-bold text-red-700' : 'text-slate-600'}>
                  [{record.sideEffects.jointPain ? '✓' : ' '}] ปวดข้อ/กล้ามเนื้อ
                </div>
                <div className={record.sideEffects.numbness ? 'font-bold text-red-700' : 'text-slate-600'}>
                  [{record.sideEffects.numbness ? '✓' : ' '}] ชาปลายมือปลายเท้า
                </div>
                <div className={record.sideEffects.itchingRash ? 'font-bold text-red-700' : 'text-slate-600'}>
                  [{record.sideEffects.itchingRash ? '✓' : ' '}] ผื่นคันตามผิวหนัง
                </div>
                <div className={record.sideEffects.jaundice ? 'font-bold text-red-900 bg-red-100 px-1' : 'text-slate-600'}>
                  [{record.sideEffects.jaundice ? '✓' : ' '}] ตัวเหลือง/ตาเหลือง (🚨 Red Flag)
                </div>
                <div className={record.sideEffects.visionBlur ? 'font-bold text-red-900 bg-red-100 px-1' : 'text-slate-600'}>
                  [{record.sideEffects.visionBlur ? '✓' : ' '}] ตามัว/ตาบอดสี (🚨 Red Flag)
                </div>
                <div className={record.sideEffects.tinnitusDizziness ? 'font-bold text-red-700' : 'text-slate-600'}>
                  [{record.sideEffects.tinnitusDizziness ? '✓' : ' '}] หูอื้อ/เวียนศีรษะ
                </div>
              </div>
              {record.sideEffects.otherSideEffects && (
                <div className="mt-1 text-[11px] text-slate-700">
                  <strong>อาการข้างเคียงอื่นๆ:</strong> {record.sideEffects.otherSideEffects}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: สุขาภิบาลสิ่งแวดล้อม */}
          <div className="mb-4">
            <div className="bg-slate-200 print:bg-slate-100 font-bold px-2 py-1 text-slate-900 text-xs mb-2 border-l-4 border-teal-700">
              4. สุขาภิบาลสิ่งแวดล้อมและสภาพจิตสังคม (Environment & Psychosocial)
            </div>
            <div className="grid grid-cols-2 gap-2 px-2 text-xs">
              <div><strong>การระบายอากาศ:</strong> {record.environment.ventilation}</div>
              <div><strong>ห้องนอน:</strong> {record.environment.bedroomType}</div>
              <div><strong>การกำจัดเสมหะ:</strong> {record.environment.sputumDisposalMethod}</div>
              <div><strong>การสวมหน้ากาก:</strong> {record.environment.maskWearingCompliance}</div>
              <div><strong>การดูแลของครอบครัว:</strong> {record.psychosocial.familySupport}</div>
              <div><strong>สภาวะจิตใจ:</strong> {record.psychosocial.stressAnxietyLevel}</div>
            </div>
          </div>

          {/* Section 5: สรุปผล แผนการดูแล และข้อเสนอแนะ */}
          <div className="mb-6 border border-slate-300 p-3 rounded-lg bg-slate-50 print:bg-transparent">
            <div className="font-bold text-xs text-slate-900 mb-1 border-b border-slate-300 pb-1">
              5. สรุปผลการประเมินและแผนการดูแล (Evaluation & Care Plan)
            </div>
            <div className="space-y-1.5 text-xs">
              <div>
                <strong>สถานะการเยี่ยมบ้าน:</strong>{' '}
                <span className="font-bold underline">{record.status}</span>
              </div>
              <div>
                <strong>คำแนะนำ/สุขศึกษาที่ให้:</strong> {record.recommendationsAndNotes || '-'}
              </div>
              {record.referralRequired && (
                <div className="p-2 bg-red-100 text-red-900 border border-red-300 rounded font-bold">
                  ⚠️ ส่งต่อแพทย์ โรงพยาบาลโพนนาแก้ว: {record.referralReason}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div><strong>วันนัดตรวจ รพ. ครั้งถัดไป:</strong> {record.nextAppointmentDate || '-'}</div>
                <div><strong>กำหนดเยี่ยมบ้านรอบถัดไป:</strong> {record.nextVisitDueDate || '-'}</div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-center text-xs">
            <div className="space-y-8">
              <div>ลงชื่อ............................................................ ผู้ป่วย / ญาติผู้ดูแล</div>
              <div>(............................................................)</div>
              <div>วันที่ ...... / ...... / 2569</div>
            </div>

            <div className="space-y-8">
              <div>ลงชื่อ............................................................ ผู้ประเมินเยี่ยมบ้าน</div>
              <div>( <strong>{record.visitorName}</strong> )</div>
              <div>ตำแหน่ง: {record.visitorRole} ({record.visitorUnit})</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

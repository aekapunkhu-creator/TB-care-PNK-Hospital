import React from 'react';
import { Printer, X, Shield, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { InvestigationRecord } from '../types';

interface InvestigationPrintModalProps {
  investigation: InvestigationRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvestigationPrintModal: React.FC<InvestigationPrintModalProps> = ({
  investigation,
  isOpen,
  onClose
}) => {
  if (!isOpen || !investigation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto print:shadow-none print:rounded-none print:w-full print:max-w-none">
        {/* Modal Toolbar - Hidden during print */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">
              แบบบันทึกการสอบสวนโรควัณโรครายบุคคล (พิมพ์ / บันทึก PDF)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Content */}
        <div className="p-8 sm:p-10 space-y-6 text-sm text-slate-800 font-sans print:p-4 print:space-y-4">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <div className="flex justify-center mb-1">
              <div className="w-12 h-12 border border-slate-400 rounded-full flex items-center justify-center text-slate-700">
                <Shield className="w-7 h-7 text-emerald-700" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-tight">
              แบบบันทึกการสอบสวนผู้ป่วยวัณโรครายบุคคล (TB Case Investigation Form)
            </h2>
            <p className="text-xs text-slate-600">
              กลุ่มงานควบคุมโรคติดต่อและระบาดวิทยา โรงพยาบาลโพนนาแก้ว / สำนักงานสาธารณสุขอำเภอโพนนาแก้ว จ.สกลนคร
            </p>
            <div className="flex justify-between items-center text-xs text-slate-700 pt-2 px-2">
              <span><strong>เลขที่การสอบสวน:</strong> {investigation.investigationNumber || '-'}</span>
              <span><strong>วันที่สอบสวน:</strong> {investigation.investigationDate || '-'}</span>
              <span><strong>สถานะ:</strong> {investigation.status === 'Complete' ? 'สอบสวนเสร็จสมบูรณ์' : investigation.status}</span>
            </div>
          </div>

          {/* Section 1: ข้อมูลทั่วไปของผู้ป่วย */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-2">
            <div className="bg-slate-100 px-2 py-1 rounded font-bold text-xs text-slate-900 border-l-4 border-emerald-600">
              ส่วนที่ 1: ข้อมูลทั่วไปของผู้ป่วย (Patient Identification)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><span className="text-slate-500">HN:</span> <strong className="text-slate-900">{investigation.hn}</strong></div>
              <div><span className="text-slate-500">เลขบัตรประชาชน:</span> <strong className="text-slate-900">{investigation.idCard || '-'}</strong></div>
              <div className="col-span-2"><span className="text-slate-500">ชื่อ-สกุล:</span> <strong className="text-slate-900">{investigation.prefix}{investigation.firstName} {investigation.lastName}</strong></div>
              <div><span className="text-slate-500">เพศ:</span> <strong>{investigation.gender}</strong></div>
              <div><span className="text-slate-500">อายุ:</span> <strong>{investigation.age} ปี</strong></div>
              <div><span className="text-slate-500">สัญชาติ:</span> <strong>{investigation.nationality || 'ไทย'}</strong></div>
              <div><span className="text-slate-500">สถานภาพสมรส:</span> <strong>{investigation.maritalStatus || 'สมรส'}</strong></div>
              <div><span className="text-slate-500">อาชีพ:</span> <strong>{investigation.occupation || '-'}</strong></div>
              <div className="col-span-2"><span className="text-slate-500">สถานที่ทำงาน/โรงเรียน:</span> <strong>{investigation.workplaceOrSchool || '-'}</strong></div>
              <div><span className="text-slate-500">เบอร์โทรศัพท์:</span> <strong>{investigation.phone || '-'}</strong></div>
            </div>
            <div className="text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500">ที่อยู่ขณะป่วย:</span> บ้านเลขที่ {investigation.houseNo || '-'} {investigation.villageNo ? `หมู่ที่ ${investigation.villageNo}` : ''} {investigation.villageName} {investigation.subdistrict} อ.{investigation.district || 'โพนนาแก้ว'} จ.{investigation.province || 'สกลนคร'} 
              {investigation.lat && investigation.lng ? ` (พิกัด GPS: ${investigation.lat.toFixed(6)}, ${investigation.lng.toFixed(6)})` : ''}
            </div>
          </div>

          {/* Section 2: ประวัติการเจ็บป่วยและอาการสำคัญ */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-2">
            <div className="bg-slate-100 px-2 py-1 rounded font-bold text-xs text-slate-900 border-l-4 border-emerald-600">
              ส่วนที่ 2: ประวัติการเจ็บป่วยและอาการสำคัญ (Clinical History & Symptoms)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><span className="text-slate-500">วันเริ่มมีอาการ:</span> <strong>{investigation.onsetDate || '-'}</strong></div>
              <div><span className="text-slate-500">วันตรวจรักษาครั้งแรก:</span> <strong>{investigation.firstConsultDate || '-'}</strong></div>
              <div><span className="text-slate-500">วันวินิจฉัย:</span> <strong>{investigation.diagnosisDate || '-'}</strong></div>
              <div><span className="text-slate-500">วันเริ่มยาวัณโรค:</span> <strong>{investigation.treatmentStartDate || '-'}</strong></div>
            </div>
            <div className="pt-1 text-xs">
              <span className="text-slate-500 block mb-1">อาการสำคัญขณะป่วย:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded border border-slate-200">
                <span className={investigation.symptoms?.chronicCough ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.chronicCough ? '☑' : '☐'} ไอเรื้อรังเกิน 2 สัปดาห์
                </span>
                <span className={investigation.symptoms?.hemoptysis ? 'font-bold text-red-700' : 'text-slate-400'}>
                  {investigation.symptoms?.hemoptysis ? '☑' : '☐'} ไอเป็นเลือด (Hemoptysis)
                </span>
                <span className={investigation.symptoms?.afternoonFever ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.afternoonFever ? '☑' : '☐'} ไข้ต่ำๆ ตอนบ่าย/ค่ำ
                </span>
                <span className={investigation.symptoms?.nightSweats ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.nightSweats ? '☑' : '☐'} เหงื่อออกตอนกลางคืน
                </span>
                <span className={investigation.symptoms?.weightLoss ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.weightLoss ? '☑' : '☐'} น้ำหนักลดฮวบ
                </span>
                <span className={investigation.symptoms?.lossOfAppetite ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.lossOfAppetite ? '☑' : '☐'} เบื่ออาหาร/อ่อนเพลีย
                </span>
                <span className={investigation.symptoms?.chestPain ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.chestPain ? '☑' : '☐'} เจ็บแน่นหน้าอก
                </span>
                <span className={investigation.symptoms?.dyspnea ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.dyspnea ? '☑' : '☐'} เหนื่อยหอบ
                </span>
                <span className={investigation.symptoms?.lymphNodeSwelling ? 'font-bold text-emerald-800' : 'text-slate-400'}>
                  {investigation.symptoms?.lymphNodeSwelling ? '☑' : '☐'} ต่อมน้ำเหลืองโต
                </span>
              </div>
              {investigation.symptoms?.otherSymptoms && (
                <div className="mt-1 text-xs text-slate-600">
                  <strong>อาการอื่นๆ:</strong> {investigation.symptoms.otherSymptoms}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: ประวัติความเสี่ยงและโรคร่วม */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-2">
            <div className="bg-slate-100 px-2 py-1 rounded font-bold text-xs text-slate-900 border-l-4 border-emerald-600">
              ส่วนที่ 3: ประวัติความเสี่ยง โรคร่วม และปัจจัยแวดล้อม (Risk Factors & Comorbidities)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div><span className="text-slate-500">การสูบบุหรี่:</span> <strong>{investigation.smoking}</strong></div>
              <div><span className="text-slate-500">การดื่มสุรา:</span> <strong>{investigation.alcohol}</strong></div>
              <div><span className="text-slate-500">สารเสพติด:</span> <strong>{investigation.substanceAbuse ? `ใช้ (${investigation.substanceDetails || ''})` : 'ไม่ใช้'}</strong></div>
              <div><span className="text-slate-500">ผลตรวจ Anti-HIV:</span> <strong className={investigation.hivStatus === 'Positive' ? 'text-red-700' : ''}>{investigation.hivStatus}</strong></div>
              <div><span className="text-slate-500">เคยเป็นวัณโรคมาก่อน:</span> <strong>{investigation.pastTbHistory ? `เคย (${investigation.pastTbYear || ''})` : 'ไม่เคย'}</strong></div>
              <div><span className="text-slate-500">ประวัติสัมผัสผู้ป่วยวัณโรค:</span> <strong>{investigation.historyOfTbContact ? `มี (${investigation.tbContactSourceDetails || ''})` : 'ไม่มี'}</strong></div>
              <div><span className="text-slate-500">ประวัติต้องโทษในเรือนจำ:</span> <strong>{investigation.prisonHistory ? 'เคย' : 'ไม่เคย'}</strong></div>
              <div><span className="text-slate-500">สภาพที่อยู่อาศัยแออัด:</span> <strong>{investigation.crowdedLiving ? 'แออัด/ทึบแสง' : 'ปกติถ่ายเทดี'}</strong></div>
              <div><span className="text-slate-500">จำนวนผู้อาศัยร่วมบ้าน:</span> <strong>{investigation.householdMembersCount} คน</strong></div>
            </div>
            <div className="pt-1 text-xs">
              <span className="text-slate-500">โรคประจำตัว/โรคร่วม: </span>
              <strong>
                {[
                  investigation.underlyingDiseases?.diabetes ? 'เบาหวาน (DM)' : null,
                  investigation.underlyingDiseases?.ckd ? 'ไตวายเรื้อรัง (CKD)' : null,
                  investigation.underlyingDiseases?.copdAsthma ? 'COPD/Asthma' : null,
                  investigation.underlyingDiseases?.liverDisease ? 'โรคตับ' : null,
                  investigation.underlyingDiseases?.malignancy ? 'มะเร็ง' : null,
                  investigation.underlyingDiseases?.immunosuppressive ? 'ได้รับยากดภูมิ/สเตียรอยด์' : null,
                  investigation.underlyingDiseases?.other ? investigation.underlyingDiseases.other : null
                ].filter(Boolean).join(', ') || 'ไม่มี'}
              </strong>
            </div>
          </div>

          {/* Section 4: ผลตรวจทางห้องปฏิบัติการและรังสีวิทยา */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-2">
            <div className="bg-slate-100 px-2 py-1 rounded font-bold text-xs text-slate-900 border-l-4 border-emerald-600">
              ส่วนที่ 4: การตรวจทางห้องปฏิบัติการและรังสีวิทยา (Laboratory & Chest X-Ray)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><span className="text-slate-500">ผลภาพรังสีทรวงอก (CXR):</span> <strong>{investigation.cxrResult}</strong></div>
              <div><span className="text-slate-500">ลักษณะรอยโรค CXR:</span> <strong>{investigation.cxrLesionType}</strong></div>
              <div><span className="text-slate-500">วันที่ตรวจ CXR:</span> <strong>{investigation.cxrDate || '-'}</strong></div>
              <div><span className="text-slate-500">GeneXpert MTB/RIF:</span> <strong>{investigation.geneXpertResult}</strong></div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs">
              <div className="font-semibold text-slate-700 mb-1">ผลการตรวจเสมหะหาเชื้อ AFB (Sputum Smear Baseline):</div>
              <div className="grid grid-cols-3 gap-2">
                <div>ครั้งที่ 1 (Spot 1): <strong>{investigation.afbSmear1}</strong></div>
                <div>ครั้งที่ 2 (Morning): <strong>{investigation.afbSmear2}</strong></div>
                <div>ครั้งที่ 3 (Spot 2): <strong>{investigation.afbSmear3}</strong></div>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                วันที่ตรวจเสมหะ: {investigation.afbDate || '-'} {investigation.afbLabNo ? `| เลข Lab No: ${investigation.afbLabNo}` : ''}
              </div>
            </div>
          </div>

          {/* Section 5: การวินิจฉัยและการรักษา */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-2">
            <div className="bg-slate-100 px-2 py-1 rounded font-bold text-xs text-slate-900 border-l-4 border-emerald-600">
              ส่วนที่ 5: การวินิจฉัยและการรักษา (Diagnosis & Treatment Regimen)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div><span className="text-slate-500">ประเภทผู้ป่วย (Category):</span> <strong>{investigation.patientCategory}</strong></div>
              <div><span className="text-slate-500">ชนิดวัณโรค (TB Type):</span> <strong>{investigation.tbType}</strong></div>
              <div><span className="text-slate-500">สูตรยาที่ได้รับ (Regimen):</span> <strong className="text-emerald-800">{investigation.treatmentRegimen || '2HRZE/4HR'}</strong></div>
              <div><span className="text-slate-500">สถานพยาบาลที่ให้การรักษา:</span> <strong>{investigation.treatingFacility || 'โรงพยาบาลโพนนาแก้ว'}</strong></div>
              <div><span className="text-slate-500">รูปแบบการกำกับยา DOTS:</span> <strong>{investigation.dotsSupervisorType}</strong></div>
              <div><span className="text-slate-500">ชื่อผู้กำกับยา DOTS:</span> <strong>{investigation.dotsSupervisorName || '-'} ({investigation.dotsSupervisorPhone || '-'})</strong></div>
            </div>
          </div>

          {/* Section 6: ผลการติดตามผู้สัมผัส */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-2">
            <div className="bg-slate-100 px-2 py-1 rounded font-bold text-xs text-slate-900 border-l-4 border-emerald-600">
              ส่วนที่ 6: การค้นหาและติดตามผู้สัมผัส (Contact Tracing Summary)
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">ผู้สัมผัสที่พบ</div>
                <div className="text-base font-bold text-slate-900">{investigation.contactsIdentified || 0} คน</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">คัดกรองอาการแล้ว</div>
                <div className="text-base font-bold text-emerald-700">{investigation.contactsScreened || 0} คน</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">ตรวจ CXR แล้ว</div>
                <div className="text-base font-bold text-slate-900">{investigation.contactsCxrDone || 0} คน</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">ตรวจเสมหะแล้ว</div>
                <div className="text-base font-bold text-slate-900">{investigation.contactsAfbDone || 0} คน</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">ได้รับยา TPT</div>
                <div className="text-base font-bold text-teal-700">{investigation.contactsTptInitiated || 0} คน</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-slate-500 text-[10px]">พบ Active TB</div>
                <div className="text-base font-bold text-red-700">{investigation.contactsActiveTbFound || 0} คน</div>
              </div>
            </div>
          </div>

          {/* Section 7: สรุปผลการสอบสวน แหล่งแพร่เชื้อ และมาตรการ */}
          <div className="border border-slate-300 rounded-lg p-3 space-y-2">
            <div className="bg-slate-100 px-2 py-1 rounded font-bold text-xs text-slate-900 border-l-4 border-emerald-600">
              ส่วนที่ 7: สรุปผลการสอบสวน แหล่งแพร่เชื้อ และมาตรการควบคุมโรค
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">แหล่งแพร่เชื้อที่น่าสงสัย:</span> <strong>{investigation.suspectedSource}</strong></div>
              <div><span className="text-slate-500">ระดับความเสี่ยงในการแพร่กระจาย:</span> <strong className={investigation.transmissionRisk.includes('สูง') ? 'text-red-700' : 'text-emerald-800'}>{investigation.transmissionRisk}</strong></div>
            </div>
            <div className="space-y-1 text-xs pt-1">
              <div>
                <span className="text-slate-500 block font-medium">สรุปผลการสอบสวน:</span>
                <p className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap">
                  {investigation.investigationSummary || 'ผู้ป่วยวัณโรคปอดได้รับการวินิจฉัยและเริ่มต้นการรักษาตามมาตรฐาน ได้ดำเนินการค้นหาผู้สัมผัสร่วมบ้านและให้คำแนะนำในการปฏิบัติตัว'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">มาตรการควบคุมโรคที่ดำเนินการ:</span>
                <p className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap">
                  {investigation.controlMeasuresTaken || '1. แนะนำการสวมหน้ากากอนามัยและการแยกห้องนอน/ระบายอากาศ\n2. นัดตรวจภาพรังสีทรวงอก (CXR) ผู้สัมผัสร่วมบ้านทุกราย\n3. จัดระบบ อสม. พี่เลี้ยง กำกับการรับประทานยาแบบ DOTS ทุกวัน'}
                </p>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 text-xs text-center">
            <div className="space-y-6">
              <p>ลงชื่อ........................................................................... ผู้สอบสวนโรค</p>
              <div>
                <p className="font-semibold">({investigation.investigatorName || '...........................................................................'})</p>
                <p className="text-slate-600">{investigation.investigatorRole || 'นักวิชาการสาธารณสุข/พยาบาลวิชาชีพ'}</p>
                <p className="text-slate-600">{investigation.investigatorUnit || 'รพ.สต. / โรงพยาบาลโพนนาแก้ว'}</p>
              </div>
            </div>

            <div className="space-y-6">
              <p>ลงชื่อ........................................................................... ผู้ตรวจสอบ/แพทย์</p>
              <div>
                <p className="font-semibold">(...........................................................................)</p>
                <p className="text-slate-600">แพทย์ผู้ให้การรักษา / หัวหน้ากลุ่มงานควบคุมโรค</p>
                <p className="text-slate-600">โรงพยาบาลโพนนาแก้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

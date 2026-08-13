import React from 'react';
import { Patient, HouseholdContact } from '../types';
import { X, FileSpreadsheet, Download, CheckCircle2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  contacts: HouseholdContact[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  patients,
  contacts
}) => {
  if (!isOpen) return null;

  const handleExportPatientsCSV = () => {
    const headers = ['HN', 'ชื่อ', 'นามสกุล', 'อายุ', 'เพศ', 'ตำบล', 'หมู่บ้าน', 'ประเภทโรค', 'สูตรยา', 'สถานะ', 'อสม.ผู้ดูแล'];
    const rows = patients.map(p => [
      p.hn, p.firstName, p.lastName, p.age, p.gender, p.subdistrict, p.village, p.tbType, p.regimen, p.status, p.dotsSupervisorName
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ทะเบียนผู้ป่วยวัณโรค_อ_โพนนาแก้ว_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportContactsCSV = () => {
    const headers = ['IDผู้สัมผัส', 'ผู้ป่วยดัชนี', 'ชื่อผู้สัมผัส', 'นามสกุล', 'อายุ', 'ความสัมพันธ์', 'ตำบล', 'หมู่บ้าน', 'ผลคัดกรอง', 'สูตรยาTPT'];
    const rows = contacts.map(c => [
      c.id, c.indexPatientName, c.firstName, c.lastName, c.age, c.relationship, c.subdistrict, c.village, c.outcome, c.tptRegimen || '-'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ทะเบียนคัดกรองผู้สัมผัสวัณโรค_อ_โพนนาแก้ว_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              ส่งออกรายงานและข้อมูล (Excel / CSV)
            </h3>
          </div>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          ดาวน์โหลดไฟล์รายงานมาตรฐานสำหรับเสนองานควบคุมโรค สสอ.โพนนาแก้ว หรือนำเข้า Google Sheets
        </p>

        <div className="space-y-3">
          <button
            onClick={handleExportPatientsCSV}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-between group"
          >
            <div className="text-left text-xs">
              <div className="font-bold text-slate-800 group-hover:text-emerald-800">
                1. ทะเบียนผู้ป่วยวัณโรค (TB Patients Register)
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                จำนวน {patients.length} รายการ (CSV UTF-8 สำหรับ Excel)
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </button>

          <button
            onClick={handleExportContactsCSV}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-between group"
          >
            <div className="text-left text-xs">
              <div className="font-bold text-slate-800 group-hover:text-emerald-800">
                2. ทะเบียนคัดกรองผู้สัมผัสร่วมบ้าน (Contact Tracing)
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                จำนวน {contacts.length} รายการ (CSV UTF-8 สำหรับ Excel)
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </button>
        </div>

        <div className="pt-3 border-t text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-medium text-xs hover:bg-slate-300"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

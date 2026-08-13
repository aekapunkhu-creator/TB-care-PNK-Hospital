import React, { useState } from 'react';
import { Patient, TBType, TreatmentStatus, SputumResultStatus } from '../types';
import { 
  Users, UserPlus, Search, Filter, Calendar, CheckCircle, 
  XCircle, AlertCircle, Phone, FileText, Send, X, Plus, Clock, Eye, Edit3
} from 'lucide-react';
import { EditPatientModal } from './EditPatientModal';

interface PatientManagementProps {
  patients: Patient[];
  subdistricts: string[];
  onAddPatient: (newPatient: Patient) => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
  onTriggerPatientNotify: (patient: Patient) => void;
  initialSelectedPatient?: Patient | null;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  patients,
  subdistricts,
  onAddPatient,
  onUpdatePatient,
  onTriggerPatientNotify,
  initialSelectedPatient
}) => {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [subdistrictFilter, setSubdistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(initialSelectedPatient || null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // New Patient Form State
  const [formHN, setFormHN] = useState('');
  const [formIdCard, setFormIdCard] = useState('');
  const [formPrefix, setFormPrefix] = useState('นาย');
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formGender, setFormGender] = useState<'ชาย' | 'หญิง'>('ชาย');
  const [formAge, setFormAge] = useState<number>(45);
  const [formPhone, setFormPhone] = useState('');
  const [formSubdistrict, setFormSubdistrict] = useState(subdistricts[0] || 'ตำบลนาแก้ว');
  const [formVillage, setFormVillage] = useState('หมู่ 1 บ้านนาแก้ว');
  const [formHouseNo, setFormHouseNo] = useState('');
  const [formTBType, setFormTBType] = useState<TBType>('Pulmonary Smear+');
  const [formRegimen, setFormRegimen] = useState('2HRZE/4HR');
  const [formSupervisorName, setFormSupervisorName] = useState('');
  const [formSupervisorRole, setFormSupervisorRole] = useState<'อสม. พี่เลี้ยง' | 'เจ้าหน้าที่ รพ.สต.' | 'ญาติผู้ดูแล'>('อสม. พี่เลี้ยง');
  const [formSupervisorPhone, setFormSupervisorPhone] = useState('');

  // Filtered Patients List
  const filteredPatients = patients.filter(p => {
    const matchText = 
      p.firstName.includes(searchTerm) || 
      p.lastName.includes(searchTerm) || 
      p.hn.includes(searchTerm) ||
      p.village.includes(searchTerm);
    const matchSub = subdistrictFilter === 'all' || p.subdistrict === subdistrictFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchText && matchSub && matchStatus;
  });

  // Handle Register Form Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstName || !formLastName || !formHN) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newP: Patient = {
      id: `TB-${Math.floor(1000 + Math.random() * 9000)}`,
      hn: formHN,
      idCard: formIdCard || '1471400000000',
      prefix: formPrefix,
      firstName: formFirstName,
      lastName: formLastName,
      gender: formGender,
      age: Number(formAge),
      phone: formPhone,
      subdistrict: formSubdistrict,
      village: formVillage,
      houseNo: formHouseNo,
      tbType: formTBType,
      regimen: formRegimen,
      registrationDate: todayStr,
      treatmentStartDate: todayStr,
      expectedEndDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      dotsSupervisorName: formSupervisorName || 'เจ้าหน้าที่ รพ.สต.',
      dotsSupervisorRole: formSupervisorRole,
      dotsSupervisorPhone: formSupervisorPhone,
      status: 'Active',
      lat: 17.065 + (Math.random() - 0.5) * 0.04,
      lng: 104.288 + (Math.random() - 0.5) * 0.04,
      sputumRecords: [
        { monthLabel: ' Baseline (เดือน 0)', monthNum: 0, dueDate: todayStr, testDate: todayStr, result: '1+' },
        { monthLabel: 'เดือนที่ 2', monthNum: 2, dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0], result: 'Pending' },
        { monthLabel: 'เดือนที่ 5', monthNum: 5, dueDate: new Date(Date.now() + 150 * 86400000).toISOString().split('T')[0], result: 'Pending' },
        { monthLabel: 'เดือนที่ 6/8', monthNum: 6, dueDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0], result: 'Pending' }
      ],
      dotsLogs: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
        taken: true,
        takenTime: '08:00'
      }))
    };

    onAddPatient(newP);
    setIsRegisterModalOpen(false);
    // reset form
    setFormHN('');
    setFormFirstName('');
    setFormLastName('');
  };

  // Toggle Daily Medication Taken Status for Selected Patient
  const handleToggleDOTS = (patient: Patient, dateStr: string) => {
    const existingLogIndex = patient.dotsLogs.findIndex(l => l.date === dateStr);
    let updatedLogs = [...patient.dotsLogs];

    if (existingLogIndex >= 0) {
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        taken: !updatedLogs[existingLogIndex].taken
      };
    } else {
      updatedLogs.push({
        date: dateStr,
        taken: true,
        takenTime: '08:00',
        observedBy: patient.dotsSupervisorName
      });
    }

    const updatedPatient = { ...patient, dotsLogs: updatedLogs };
    onUpdatePatient(updatedPatient);
    setSelectedPatient(updatedPatient);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>ทะเบียนผู้ป่วยวัณโรค และบันทึกติดตามการทานยา (DOTS Register)</span>
            </h2>
            <p className="text-xs text-slate-500">
              อำเภอโพนนาแก้ว จังหวัดสกลนคร (บันทึกรับยาประจำวัน และผลตรวจเสมหะตามกำหนด)
            </p>
          </div>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ ลงทะเบียนผู้ป่วยใหม่</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหา ชื่อ, นามสกุล, HN, หมู่บ้าน..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={subdistrictFilter}
              onChange={e => setSubdistrictFilter(e.target.value)}
              className="w-full bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">เลือกตำบล (ทุกตำบล)</option>
              {subdistricts.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">สถานะการรักษา (ทั้งหมด)</option>
              <option value="Active">กำลังรักษาอยู่ (Active)</option>
              <option value="Cured">รักษาหายแล้ว (Cured)</option>
              <option value="Interrupted">ขาดรับยา (Interrupted)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">HN / รหัส</th>
                <th className="py-3.5 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3.5 px-4">ที่อยู่ (ตำบล/หมู่บ้าน)</th>
                <th className="py-3.5 px-4">ประเภทโรค</th>
                <th className="py-3.5 px-4">สูตรยา (Regimen)</th>
                <th className="py-3.5 px-4">ผู้ดูแล DOTS (อสม./พยาบาล)</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {patient.hn}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {patient.prefix}{patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        อายุ {patient.age} ปี ({patient.gender}) &bull; {patient.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{patient.subdistrict}</div>
                      <div className="text-[11px] text-slate-400">{patient.village}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        patient.tbType === 'Pulmonary Smear+'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}>
                        {patient.tbType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-medium">
                      {patient.regimen}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">{patient.dotsSupervisorName}</div>
                      <div className="text-[11px] text-slate-400">{patient.dotsSupervisorRole} ({patient.dotsSupervisorPhone})</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        patient.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : patient.status === 'Cured'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {patient.status === 'Active' ? 'กำลังรักษา' : patient.status === 'Cured' ? 'รักษาหาย' : 'ขาดยา'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center space-x-1">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition"
                      >
                        บันทึก DOTS
                      </button>
                      <button
                        onClick={() => setEditingPatient(patient)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition inline-flex items-center gap-1"
                        title="แก้ไขข้อมูลผู้ป่วย"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => onTriggerPatientNotify(patient)}
                        className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white transition"
                        title="เตือนผ่าน LINE"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    ไม่พบข้อมูลผู้ป่วยตรงตามเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail & DOTS Calendar Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">
                    {selectedPatient.hn}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedPatient.prefix}{selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedPatient.subdistrict} ({selectedPatient.village}) &bull; โทร: {selectedPatient.phone}
                </p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-6">
              
              {/* Patient Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400">ประเภทโรค:</span>
                  <div className="font-bold text-slate-900">{selectedPatient.tbType}</div>
                </div>
                <div>
                  <span className="text-slate-400">สูตรยาต้านวัณโรค:</span>
                  <div className="font-bold text-emerald-700">{selectedPatient.regimen}</div>
                </div>
                <div>
                  <span className="text-slate-400">อสม./ผู้ดูแล DOTS:</span>
                  <div className="font-bold text-slate-900">{selectedPatient.dotsSupervisorName}</div>
                </div>
              </div>

              {/* Interactive Daily DOTS Medication Calendar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>บันทึกการกินยาต้านวัณโรครายวัน (30 วันย้อนหลัง)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">คลิกที่วันที่เพื่อเปลี่ยนสถานะทานยา</span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const dateObj = new Date();
                    dateObj.setDate(dateObj.getDate() - (29 - i));
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const dayNum = dateObj.getDate();
                    
                    const log = selectedPatient.dotsLogs.find(l => l.date === dateStr);
                    const isTaken = log ? log.taken : false;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleToggleDOTS(selectedPatient, dateStr)}
                        className={`p-2 rounded-lg text-center transition flex flex-col items-center justify-center ${
                          isTaken
                            ? 'bg-emerald-500 text-white font-bold shadow-sm'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200 font-semibold border border-amber-300'
                        }`}
                        title={`${dateStr}: ${isTaken ? 'ทานยาแล้ว' : 'ยังไม่ได้ทานยา'}`}
                      >
                        <span className="text-[10px] opacity-80">{dateObj.toLocaleDateString('th-TH', { month: 'short' })}</span>
                        <span className="text-xs">{dayNum}</span>
                        {isTaken ? <CheckCircle className="w-3 h-3 mt-0.5" /> : <XCircle className="w-3 h-3 mt-0.5 text-amber-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sputum Follow-up Test Schedule */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>ผลการตรวจเสมหะติดตามการรักษา (Sputum Follow-up AFB)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPatient.sputumRecords.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{rec.monthLabel}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.result === 'Negative'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.result === 'Pending'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rec.result}
                        </span>
                      </div>
                      <div className="text-slate-500 flex justify-between text-[11px]">
                        <span>วันกำหนดตรวจ: {rec.dueDate}</span>
                        {rec.testDate && <span>ตรวจแล้ว: {rec.testDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTriggerPatientNotify(selectedPatient)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>ส่งเตือนผ่าน LINE</span>
                </button>
                <button
                  onClick={() => setEditingPatient(selectedPatient)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>แก้ไขข้อมูลผู้ป่วย</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Patient Modal Component */}
      <EditPatientModal
        patient={editingPatient}
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        onSave={(updatedPatient) => {
          onUpdatePatient(updatedPatient);
          if (selectedPatient?.id === updatedPatient.id) {
            setSelectedPatient(updatedPatient);
          }
        }}
      />

      {/* Register New Patient Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                ลงทะเบียนผู้ป่วยวัณโรครายใหม่ (อ.โพนนาแก้ว)
              </h3>
              <button onClick={() => setIsRegisterModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">หมายเลข HN *</label>
                  <input
                    required
                    type="text"
                    placeholder="HN-10XXXX"
                    value={formHN}
                    onChange={e => setFormHN(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">เลขบัตรประชาชน (13 หลัก)</label>
                  <input
                    type="text"
                    placeholder="14714XXXXXXXX"
                    value={formIdCard}
                    onChange={e => setFormIdCard(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">คำนำหน้า</label>
                  <select
                    value={formPrefix}
                    onChange={e => setFormPrefix(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ชื่อ *</label>
                  <input
                    required
                    type="text"
                    value={formFirstName}
                    onChange={e => setFormFirstName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">นามสกุล *</label>
                  <input
                    required
                    type="text"
                    value={formLastName}
                    onChange={e => setFormLastName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ตำบล *</label>
                  <select
                    value={formSubdistrict}
                    onChange={e => setFormSubdistrict(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    {subdistricts.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">หมู่บ้าน</label>
                  <input
                    type="text"
                    placeholder="หมู่ 1 บ้าน..."
                    value={formVillage}
                    onChange={e => setFormVillage(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    placeholder="081-XXX-XXXX"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ประเภทโรควัณโรค</label>
                  <select
                    value={formTBType}
                    onChange={e => setFormTBType(e.target.value as TBType)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Pulmonary Smear+">Pulmonary Smear+ (เสมหะพบเชื้อ)</option>
                    <option value="Pulmonary Smear-">Pulmonary Smear- (เสมหะไม่พบเชื้อ)</option>
                    <option value="Extra-Pulmonary">Extra-Pulmonary (นอกปอด)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">สูตรยาต้านวัณโรค</label>
                  <input
                    type="text"
                    value={formRegimen}
                    onChange={e => setFormRegimen(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ชื่อ อสม./พี่เลี้ยง DOTS</label>
                  <input
                    type="text"
                    placeholder="นางสมพร (อสม.)"
                    value={formSupervisorName}
                    onChange={e => setFormSupervisorName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">เบอร์ อสม./พี่เลี้ยง</label>
                  <input
                    type="text"
                    placeholder="089-XXX-XXXX"
                    value={formSupervisorPhone}
                    onChange={e => setFormSupervisorPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
                >
                  บันทึกผู้ป่วยใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

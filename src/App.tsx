import React, { useState } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SpotMap } from './components/SpotMap';
import { PatientManagement } from './components/PatientManagement';
import { ContactTracing } from './components/ContactTracing';
import { LineAppsScript } from './components/LineAppsScript';
import { ExportModal } from './components/ExportModal';
import { LoginModal } from './components/LoginModal';
import { UserManagementModal } from './components/UserManagementModal';

import { 
  PHON_NA_KAEO_SUBDISTRICTS, 
  INITIAL_PATIENTS, 
  INITIAL_CONTACTS, 
  INITIAL_LINE_CONFIG, 
  INITIAL_LOGS,
  INITIAL_USERS
} from './data/mockData';

import { Patient, HouseholdContact, LineNotificationConfig, NotificationLog, UserAccount } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'spotmap' | 'patients' | 'contacts' | 'line-gas'>('dashboard');

  // Application State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [contacts, setContacts] = useState<HouseholdContact[]>(INITIAL_CONTACTS);
  const [lineConfig, setLineConfig] = useState<LineNotificationConfig>(INITIAL_LINE_CONFIG);
  const [logs, setLogs] = useState<NotificationLog[]>(INITIAL_LOGS);

  // User Accounts & Authentication State
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USERS[0]); // Default logged in as Admin
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  // Modals & Navigation Helpers
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // User Account Management Handlers
  const handleAddUser = (newUser: UserAccount) => {
    setUsers(prev => [newUser, ...prev]);
    showToast(`เพิ่มผู้ใช้งานและกำหนดรหัสผ่านสำเร็จ: ${newUser.fullName} (${newUser.username})`);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    showToast(`อัปเดตข้อมูลและรหัสผ่านผู้ใช้งานสำเร็จ`);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast(`ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว`);
  };

  // Handlers
  const handleAddPatient = (newP: Patient) => {
    setPatients(prev => [newP, ...prev]);
    showToast(`ลงทะเบียนผู้ป่วยใหม่สำเร็จ: ${newP.prefix}${newP.firstName} ${newP.lastName} (${newP.hn})`);
  };

  const handleUpdatePatient = (updatedP: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
    showToast(`อัปเดตข้อมูลผู้ป่วยสำเร็จแล้ว`);
  };

  const handleDeletePatient = (patientId: string) => {
    if (currentUser?.role !== 'Admin') {
      showToast('สิทธิ์ไม่ถูกต้อง: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบข้อมูลผู้ป่วยได้');
      return;
    }
    const target = patients.find(p => p.id === patientId);
    setPatients(prev => prev.filter(p => p.id !== patientId));
    if (selectedPatientForDetail?.id === patientId) {
      setSelectedPatientForDetail(null);
    }
    showToast(`ลบข้อมูลผู้ป่วย ${target ? target.prefix + target.firstName + ' ' + target.lastName : ''} เรียบร้อยแล้ว`);
  };

  const handleAddContact = (newC: HouseholdContact) => {
    setContacts(prev => [newC, ...prev]);
    showToast(`บันทึกคัดกรองผู้สัมผัสใหม่สำเร็จ: ${newC.prefix}${newC.firstName} ${newC.lastName}`);
  };

  const handleUpdateContact = (updatedC: HouseholdContact) => {
    setContacts(prev => prev.map(c => c.id === updatedC.id ? updatedC : c));
    showToast(`อัปเดตข้อมูลผู้สัมผัสสำเร็จแล้ว`);
  };

  const handleDeleteContact = (contactId: string) => {
    if (currentUser?.role !== 'Admin') {
      showToast('สิทธิ์ไม่ถูกต้อง: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบข้อมูลผู้สัมผัสได้');
      return;
    }
    const target = contacts.find(c => c.id === contactId);
    setContacts(prev => prev.filter(c => c.id !== contactId));
    showToast(`ลบข้อมูลผู้สัมผัส ${target ? target.prefix + target.firstName + ' ' + target.lastName : ''} เรียบร้อยแล้ว`);
  };

  const handleTriggerPatientNotify = async (patient: Patient) => {
    const message = `💊 [เตือนรับประทานยา DOTS]\nเรียน คุณ${patient.firstName} ${patient.lastName} (HN: ${patient.hn})\nได้เวลาทานยาต้านวัณโรคสูตร ${patient.regimen} ประจำวันแล้วครับ\nอสม.ผู้ดูแล: ${patient.dotsSupervisorName} (${patient.dotsSupervisorPhone})`;

    try {
      const res = await fetch('/api/line-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: lineConfig.token,
          message
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(`ส่งข้อความเตือนคุณ ${patient.firstName} ผ่าน LINE Notify เรียบร้อยแล้ว`);
      } else {
        showToast(`ส่งการเตือนเข้ากลุ่ม LINE อ.โพนนาแก้ว (โหมดจำลองระบบ)`);
      }
    } catch {
      showToast(`ส่งการเตือนเข้ากลุ่ม LINE อ.โพนนาแก้ว (โหมดจำลองระบบ)`);
    }

    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('th-TH'),
        type: 'daily_dots',
        targetName: `${patient.prefix}${patient.firstName} ${patient.lastName} (${patient.hn})`,
        message,
        status: 'sent'
      },
      ...prev
    ]);
  };

  const handleQuickNotify = (message: string) => {
    showToast(`ส่งข้อความแจ้งเตือนด่วนถึงกลุ่มงานสาธารณสุข อ.โพนนาแก้ว เรียบร้อยแล้ว`);
    setLogs(prev => [
      {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('th-TH'),
        type: 'system',
        targetName: lineConfig.lineGroupName,
        message,
        status: 'sent'
      },
      ...prev
    ]);
  };

  const subdistrictNames = PHON_NA_KAEO_SUBDISTRICTS.map(s => s.name);

  // Count missed doses count in active patients
  const missedDosesCount = patients.filter(p => p.status === 'Active' && p.dotsLogs.some(l => !l.taken)).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Prompt',sans-serif]">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patientsCount={patients.length}
        contactsCount={contacts.length}
        missedDosesCount={missedDosesCount}
        onOpenExport={() => setIsExportOpen(true)}
        currentUser={currentUser}
        onOpenUserMgmt={() => setIsUserMgmtOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          showToast('ออกจากระบบเรียบร้อยแล้ว');
        }}
      />

      {/* Login Screen Overlay when not logged in */}
      {currentUser === null && (
        <LoginModal
          users={users}
          onLogin={(user) => {
            setCurrentUser(user);
            showToast(`ยินดีต้อนรับเข้าสู่ระบบ: คุณ${user.fullName}`);
          }}
        />
      )}

      {/* Main Active Tab Content */}
      <main className="flex-1 pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            patients={patients}
            contacts={contacts}
            subdistricts={PHON_NA_KAEO_SUBDISTRICTS}
            onNavigate={setActiveTab}
            onOpenNewPatient={() => setActiveTab('patients')}
            onOpenNewContact={() => setActiveTab('contacts')}
            onTriggerQuickNotify={handleQuickNotify}
          />
        )}

        {activeTab === 'spotmap' && (
          <SpotMap
            patients={patients}
            contacts={contacts}
            subdistricts={PHON_NA_KAEO_SUBDISTRICTS}
            onTriggerPatientNotify={handleTriggerPatientNotify}
            onSelectPatient={p => {
              setSelectedPatientForDetail(p);
              setActiveTab('patients');
            }}
          />
        )}

        {activeTab === 'patients' && (
          <PatientManagement
            patients={patients}
            subdistricts={subdistrictNames}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
            onTriggerPatientNotify={handleTriggerPatientNotify}
            initialSelectedPatient={selectedPatientForDetail}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactTracing
            contacts={contacts}
            patients={patients}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'line-gas' && (
          <LineAppsScript
            lineConfig={lineConfig}
            onUpdateLineConfig={setLineConfig}
            logs={logs}
            onAddLog={newLog => setLogs(prev => [newLog, ...prev])}
          />
        )}
      </main>

      {/* User Management & Password Modal */}
      {currentUser && (
        <UserManagementModal
          isOpen={isUserMgmtOpen}
          onClose={() => setIsUserMgmtOpen(false)}
          users={users}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          currentUser={currentUser}
        />
      )}

      {/* Floating Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        patients={patients}
        contacts={contacts}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <p>
          ระบบควบคุมและติดตามผู้ป่วยวัณโรค อ.โพนนาแก้ว จ.สกลนคร &bull; โรงพยาบาลโพนนาแก้ว
        </p>
      </footer>
    </div>
  );
}

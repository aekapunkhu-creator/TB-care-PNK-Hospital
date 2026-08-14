import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SpotMap } from './components/SpotMap';
import { PatientManagement } from './components/PatientManagement';
import { ContactTracing } from './components/ContactTracing';
import { LineAppsScript } from './components/LineAppsScript';
import { ExportModal } from './components/ExportModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ShareLocationLinkModal } from './components/ShareLocationLinkModal';
import { PublicLocationSubmitView } from './components/PublicLocationSubmitView';
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
import { CheckCircle2, AlertCircle, Database } from 'lucide-react';

import {
  subscribePatients,
  subscribeContacts,
  subscribeUsers,
  subscribeLineConfig,
  subscribeLogs,
  saveAllPatientsToFirestore,
  saveAllContactsToFirestore,
  saveAllUsersToFirestore,
  saveLineConfigToFirestore,
  saveAllLogsToFirestore,
  savePatientToFirestore,
  deletePatientFromFirestore,
  saveContactToFirestore,
  deleteContactFromFirestore,
  saveUserToFirestore,
  deleteUserFromFirestore,
  clearCollectionInFirestore
} from './services/firebaseStore';

const MOCK_PATIENT_IDS = ['TB-6701', 'TB-6702', 'TB-6703', 'TB-6704', 'TB-6705'];
const MOCK_CONTACT_IDS = ['CT-101', 'CT-102', 'CT-103', 'CT-104'];
const MOCK_LOG_IDS = ['LOG-001', 'LOG-002', 'LOG-003'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'spotmap' | 'patients' | 'contacts' | 'line-gas'>('dashboard');

  // Application Persistent State
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('tb_phon_patients_v3');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return parsed.filter((p: Patient) => !MOCK_PATIENT_IDS.includes(p.id));
      } catch (e) { console.error('Error loading patients from storage', e); }
    }
    const oldSaved = localStorage.getItem('tb_phon_patients_v2');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved);
        const cleaned = parsed.filter((p: Patient) => !MOCK_PATIENT_IDS.includes(p.id));
        localStorage.setItem('tb_phon_patients_v3', JSON.stringify(cleaned));
        return cleaned;
      } catch (e) { console.error(e); }
    }
    return [];
  });

  const [contacts, setContacts] = useState<HouseholdContact[]>(() => {
    const saved = localStorage.getItem('tb_phon_contacts_v3');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return parsed.filter((c: HouseholdContact) => !MOCK_CONTACT_IDS.includes(c.id));
      } catch (e) { console.error('Error loading contacts from storage', e); }
    }
    const oldSaved = localStorage.getItem('tb_phon_contacts_v2');
    if (oldSaved) {
      try {
        const parsed = JSON.parse(oldSaved);
        const cleaned = parsed.filter((c: HouseholdContact) => !MOCK_CONTACT_IDS.includes(c.id));
        localStorage.setItem('tb_phon_contacts_v3', JSON.stringify(cleaned));
        return cleaned;
      } catch (e) { console.error(e); }
    }
    return [];
  });

  const [lineConfig, setLineConfig] = useState<LineNotificationConfig>(() => {
    const saved = localStorage.getItem('tb_phon_line_config_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Error loading line config from storage', e); }
    }
    return INITIAL_LINE_CONFIG;
  });

  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('tb_phon_logs_v3');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return parsed.filter((l: NotificationLog) => !MOCK_LOG_IDS.includes(l.id));
      } catch (e) { console.error('Error loading logs from storage', e); }
    }
    return [];
  });

  // User Accounts & Authentication State - Require login every time on link access / fresh load
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('tb_phon_users_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Error loading users from storage', e); }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  // Real-time Firestore Cloud DB Sync & Initialization
  useEffect(() => {
    // 1. Subscribe Patients
    const unsubPatients = subscribePatients(
      (data) => {
        const cleaned = (data || []).filter(p => !MOCK_PATIENT_IDS.includes(p.id));
        // Delete mock items from firestore in background
        data?.forEach(p => {
          if (MOCK_PATIENT_IDS.includes(p.id)) {
            deletePatientFromFirestore(p.id);
          }
        });
        setPatients(cleaned);
      },
      () => {}
    );

    // 2. Subscribe Contacts
    const unsubContacts = subscribeContacts(
      (data) => {
        const cleaned = (data || []).filter(c => !MOCK_CONTACT_IDS.includes(c.id));
        data?.forEach(c => {
          if (MOCK_CONTACT_IDS.includes(c.id)) {
            deleteContactFromFirestore(c.id);
          }
        });
        setContacts(cleaned);
      },
      () => {}
    );

    // 3. Subscribe Users
    const unsubUsers = subscribeUsers(
      (data) => {
        if (data && data.length > 0) {
          setUsers(data);
        } else {
          saveAllUsersToFirestore(INITIAL_USERS);
        }
      },
      () => {}
    );

    // 4. Subscribe Line Config
    const unsubLine = subscribeLineConfig((cfg) => {
      if (cfg) setLineConfig(cfg);
    });

    // 5. Subscribe Logs
    const unsubLogs = subscribeLogs((l) => {
      const cleaned = (l || []).filter(log => !MOCK_LOG_IDS.includes(log.id));
      setLogs(cleaned);
    });

    return () => {
      unsubPatients();
      unsubContacts();
      unsubUsers();
      unsubLine();
      unsubLogs();
    };
  }, []);

  // Auto-Save Effects to LocalStorage AND Firestore Cloud DB
  useEffect(() => {
    localStorage.setItem('tb_phon_patients_v3', JSON.stringify(patients));
    saveAllPatientsToFirestore(patients);
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('tb_phon_contacts_v3', JSON.stringify(contacts));
    saveAllContactsToFirestore(contacts);
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('tb_phon_line_config_v2', JSON.stringify(lineConfig));
    saveLineConfigToFirestore(lineConfig);
  }, [lineConfig]);

  useEffect(() => {
    localStorage.setItem('tb_phon_logs_v3', JSON.stringify(logs));
    saveAllLogsToFirestore(logs);
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('tb_phon_users_v2', JSON.stringify(users));
    saveAllUsersToFirestore(users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tb_phon_current_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tb_phon_current_user_v2');
    }
  }, [currentUser]);

  // Modals & Navigation Helpers
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isShareLocationOpen, setIsShareLocationOpen] = useState(false);
  const [shareLocationTargetPatient, setShareLocationTargetPatient] = useState<Patient | null>(null);
  const [publicPinningPatient, setPublicPinningPatient] = useState<Patient | null>(null);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);

  // Detect URL parameter for public location pinning link
  const getPublicTargetIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const searchTarget = searchParams.get('pinLocationFor') || searchParams.get('locationToken');
      if (searchTarget) return searchTarget;

      const hash = window.location.hash;
      if (hash) {
        const cleanedHash = hash.startsWith('#') ? hash.slice(1) : hash;
        if (cleanedHash.includes('=')) {
          const hashParams = new URLSearchParams(cleanedHash);
          const hashTarget = hashParams.get('pinLocationFor') || hashParams.get('locationToken');
          if (hashTarget) return hashTarget;
        }
        const match = hash.match(/#\/?pin\/(.+)/);
        if (match && match[1]) return match[1];
      }
    }
    return null;
  };

  const publicTargetId = getPublicTargetIdFromUrl();

  useEffect(() => {
    if (publicTargetId && patients.length > 0) {
      const found = patients.find(p => p.id === publicTargetId || p.hn === publicTargetId);
      if (found) {
        setPublicPinningPatient(found);
      }
    }
  }, [patients, publicTargetId]);

  // Update Location from public pinning view
  const handleUpdatePatientLocationFromPublic = (patientId: string, newLat: number, newLng: number) => {
    let updatedP: Patient | null = null;
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        updatedP = { ...p, lat: newLat, lng: newLng };
        return updatedP;
      }
      return p;
    }));

    if (updatedP) {
      savePatientToFirestore(updatedP);
    }

    showToast(`อัปเดตพิกัดตำแหน่งบ้านสำเร็จแล้ว (Lat: ${newLat}, Lng: ${newLng})`);
  };

  // Toast Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Import Excel data handler
  const handleImportExcelData = (data: { patients: Patient[]; contacts: HouseholdContact[] }) => {
    let addedP = 0;
    let addedC = 0;

    if (data.patients && data.patients.length > 0) {
      setPatients(prev => [...data.patients, ...prev]);
      addedP = data.patients.length;
    }

    if (data.contacts && data.contacts.length > 0) {
      setContacts(prev => [...data.contacts, ...prev]);
      addedC = data.contacts.length;
    }

    showToast(`นำเข้าข้อมูลจากไฟล์ Excel สำเร็จแล้ว! (เพิ่มผู้ป่วย ${addedP} ราย, ผู้สัมผัส ${addedC} ราย) ระบบบันทึกเข้าฐานข้อมูลเรียบร้อย`);
  };

  // Reset to initial demo dataset handler
  const handleResetToDemoData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตัวอย่างใช่หรือไม่? (ข้อมูลที่บันทึกไว้ล่วงหน้าจะถูกแทนที่)')) {
      setPatients(INITIAL_PATIENTS);
      setContacts(INITIAL_CONTACTS);
      setLineConfig(INITIAL_LINE_CONFIG);
      setLogs(INITIAL_LOGS);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);
      localStorage.removeItem('tb_phon_patients_v2');
      localStorage.removeItem('tb_phon_contacts_v2');
      localStorage.removeItem('tb_phon_line_config_v2');
      localStorage.removeItem('tb_phon_logs_v2');
      localStorage.removeItem('tb_phon_users_v2');
      localStorage.removeItem('tb_phon_current_user_v2');
      showToast('รีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้นตัวอย่างเรียบร้อยแล้ว');
    }
  };

  // Import JSON backup handler
  const handleImportJsonData = (data: { patients?: Patient[]; contacts?: HouseholdContact[]; users?: UserAccount[] }) => {
    if (data.patients && Array.isArray(data.patients)) {
      setPatients(data.patients);
    }
    if (data.contacts && Array.isArray(data.contacts)) {
      setContacts(data.contacts);
    }
    if (data.users && Array.isArray(data.users)) {
      setUsers(data.users);
    }
    showToast('นำเข้าข้อมูลสำเร็จแล้ว ระบบบันทึกข้อมูลเข้าฐานข้อมูลเรียบร้อย');
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
    deleteUserFromFirestore(userId);
    showToast(`ลบบัญชีผู้ใช้งานเรียบร้อยแล้ว`);
  };

  // Handlers
  const handleAddPatient = (newP: Patient) => {
    setPatients(prev => [newP, ...prev]);
    savePatientToFirestore(newP);
    showToast(`ลงทะเบียนผู้ป่วยใหม่สำเร็จ: ${newP.prefix}${newP.firstName} ${newP.lastName} (${newP.hn})`);
  };

  const handleUpdatePatient = (updatedP: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
    savePatientToFirestore(updatedP);
    showToast(`อัปเดตข้อมูลผู้ป่วยสำเร็จแล้ว`);
  };

  const handleDeletePatient = (patientId: string) => {
    if (currentUser?.role !== 'Admin') {
      showToast('สิทธิ์ไม่ถูกต้อง: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบข้อมูลผู้ป่วยได้');
      return;
    }
    const target = patients.find(p => p.id === patientId);
    setPatients(prev => prev.filter(p => p.id !== patientId));
    deletePatientFromFirestore(patientId);
    if (selectedPatientForDetail?.id === patientId) {
      setSelectedPatientForDetail(null);
    }
    showToast(`ลบข้อมูลผู้ป่วย ${target ? target.prefix + target.firstName + ' ' + target.lastName : ''} เรียบร้อยแล้ว`);
  };

  const handleAddContact = (newC: HouseholdContact) => {
    setContacts(prev => [newC, ...prev]);
    saveContactToFirestore(newC);
    showToast(`บันทึกคัดกรองผู้สัมผัสใหม่สำเร็จ: ${newC.prefix}${newC.firstName} ${newC.lastName}`);
  };

  const handleUpdateContact = (updatedC: HouseholdContact) => {
    setContacts(prev => prev.map(c => c.id === updatedC.id ? updatedC : c));
    saveContactToFirestore(updatedC);
    showToast(`อัปเดตข้อมูลผู้สัมผัสสำเร็จแล้ว`);
  };

  const handleDeleteContact = (contactId: string) => {
    if (currentUser?.role !== 'Admin') {
      showToast('สิทธิ์ไม่ถูกต้อง: เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถลบข้อมูลผู้สัมผัสได้');
      return;
    }
    const target = contacts.find(c => c.id === contactId);
    setContacts(prev => prev.filter(c => c.id !== contactId));
    deleteContactFromFirestore(contactId);
    showToast(`ลบข้อมูลผู้สัมผัส ${target ? target.prefix + target.firstName + ' ' + target.lastName : ''} เรียบร้อยแล้ว`);
  };

  const handleWipeAllData = async () => {
    if (!window.confirm('⚠️ คำเตือน: คุณต้องการลบข้อมูลผู้ป่วย, คัดกรองผู้สัมผัส และประวัติการแจ้งเตือนทั้งหมดออกจากระบบและฐานข้อมูล Cloud หรือไม่?\n\n(ข้อมูลจะถูกล้างหมดทั้งในเครื่องและ Cloud ฐานข้อมูลจะว่างเปล่าพร้อมใช้งาน)')) {
      return;
    }
    
    // Clear Local Storage
    localStorage.removeItem('tb_phon_patients_v2');
    localStorage.removeItem('tb_phon_patients_v3');
    localStorage.removeItem('tb_phon_contacts_v2');
    localStorage.removeItem('tb_phon_contacts_v3');
    localStorage.removeItem('tb_phon_logs_v2');
    localStorage.removeItem('tb_phon_logs_v3');
    
    // Clear React State
    setPatients([]);
    setContacts([]);
    setLogs([]);
    setSelectedPatientForDetail(null);

    // Clear Cloud Firestore collections
    await clearCollectionInFirestore('patients');
    await clearCollectionInFirestore('contacts');
    await clearCollectionInFirestore('logs');

    showToast('ลบข้อมูลทั้งหมดในระบบและฐานข้อมูล Cloud เรียบร้อยแล้ว');
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

  // Resolve active public pinning patient (from state, current patients array, or initial dataset)
  const activePublicPatient = publicPinningPatient || 
    (publicTargetId ? patients.find(p => p.id === publicTargetId || p.hn === publicTargetId) : null) ||
    (publicTargetId ? INITIAL_PATIENTS.find(p => p.id === publicTargetId || p.hn === publicTargetId) : null);

  // Check if user is logged in first. If not logged in, render LoginModal first.
  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-['Prompt',sans-serif]">
        <LoginModal
          users={users}
          onLogin={(user) => {
            setCurrentUser(user);
            showToast(`ยินดีต้อนรับเข้าสู่ระบบ: คุณ${user.fullName}`);
          }}
        />
      </div>
    );
  }

  // Once logged in: Render Location Pinning View if accessed via generated link or state
  if (publicTargetId || publicPinningPatient) {
    if (activePublicPatient) {
      return (
        <PublicLocationSubmitView
          patient={activePublicPatient}
          onSubmitLocation={handleUpdatePatientLocationFromPublic}
          onClosePublicView={() => {
            setPublicPinningPatient(null);
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              url.searchParams.delete('pinLocationFor');
              url.searchParams.delete('locationToken');
              window.history.replaceState({}, '', url.toString());
            }
          }}
        />
      );
    }

    // Link target ID not found in database fallback view
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 font-['Prompt',sans-serif]">
        <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold">📍</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">ระบบระบุพิกัดตำแหน่งบ้าน รพ.โพนนาแก้ว</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            ไม่พบข้อมูลรายชื่อผู้ป่วยสำหรับลิงก์ระบุพิกัดนี้ (รหัส: <span className="font-mono font-bold text-amber-800">{publicTargetId}</span>) <br />
            ลิงก์อาจไม่ถูกต้อง หรือผู้ป่วยได้รับการจำหน่ายออกจากระบบแล้ว
          </p>
          <button 
            onClick={() => {
              setPublicPinningPatient(null);
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.delete('pinLocationFor');
                url.searchParams.delete('locationToken');
                window.location.href = url.pathname;
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            ไปที่หน้าแรกของระบบ
          </button>
        </div>
      </div>
    );
  }

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
        onWipeAllData={handleWipeAllData}
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
            onOpenShareLocationModal={(p) => {
              setShareLocationTargetPatient(p || null);
              setIsShareLocationOpen(true);
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
            onOpenExcelImportModal={() => setIsExcelImportOpen(true)}
            onOpenShareLocationModal={(p) => {
              setShareLocationTargetPatient(p || null);
              setIsShareLocationOpen(true);
            }}
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
            onOpenExcelImportModal={() => setIsExcelImportOpen(true)}
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
        onResetToDemoData={handleResetToDemoData}
        onImportJsonData={handleImportJsonData}
        onOpenExcelImportModal={() => setIsExcelImportOpen(true)}
      />

      {/* Excel Import & Template Modal */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onImportData={handleImportExcelData}
      />

      {/* Share Location Link & QR Code Modal */}
      <ShareLocationLinkModal
        isOpen={isShareLocationOpen}
        onClose={() => {
          setIsShareLocationOpen(false);
          setShareLocationTargetPatient(null);
        }}
        patient={shareLocationTargetPatient}
        allPatients={patients}
        onSelectPatient={(p) => setShareLocationTargetPatient(p)}
        onOpenPublicPreview={(pId) => {
          const found = patients.find(pt => pt.id === pId);
          if (found) {
            setPublicPinningPatient(found);
          }
        }}
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

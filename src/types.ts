export interface UserAccount {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: 'Admin' | 'Staff' | 'อสม.';
  subdistrict?: string;
  hospitalName?: string;
  phone?: string;
  createdAt: string;
}

export type TBType = 'Pulmonary Smear+' | 'Pulmonary Smear-' | 'Extra-Pulmonary';

export type TreatmentStatus = 'Active' | 'Cured' | 'Completed' | 'Interrupted' | 'Died' | 'Transferred';

export type SputumResultStatus = 'Negative' | 'Scanty' | '1+' | '2+' | '3+' | 'Pending' | 'Not Done';

export type CXRResult = 'Normal' | 'Abnormal TB Suspect' | 'Abnormal Non-TB' | 'Pending' | 'Not Done';

export type ContactOutcome = 'Under Evaluation' | 'Cleared' | 'TPT Initiated' | 'Active TB (Referred)';

export interface SputumRecord {
  monthLabel: ' Baseline (เดือน 0)' | 'เดือนที่ 2' | 'เดือนที่ 5' | 'เดือนที่ 6/8';
  monthNum: 0 | 2 | 5 | 6 | 8;
  dueDate: string;
  testDate?: string;
  result: SputumResultStatus;
  labNumber?: string;
  notes?: string;
}

export interface DOTSLog {
  date: string; // YYYY-MM-DD
  taken: boolean;
  takenTime?: string;
  sideEffects?: string[]; // e.g., 'คลื่นไส้', 'ตัวเหลืองตาเหลือง', 'ผื่นคัน', 'ปวดข้อ'
  observedBy?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  hn: string;
  idCard: string;
  prefix: string;
  firstName: string;
  lastName: string;
  gender: 'ชาย' | 'หญิง';
  age: number;
  phone: string;
  subdistrict: string; // ตำบลใน อ.โพนนาแก้ว
  village: string;     // หมู่บ้าน
  houseNo: string;
  tbType: TBType;
  regimen: string;     // e.g., 2HRZE/4HR
  registrationDate: string;
  treatmentStartDate: string;
  expectedEndDate: string;
  dotsSupervisorName: string;
  dotsSupervisorRole: 'อสม. พี่เลี้ยง' | 'เจ้าหน้าที่ รพ.สต.' | 'ญาติผู้ดูแล';
  dotsSupervisorPhone: string;
  status: TreatmentStatus;
  lat: number;
  lng: number;
  sputumRecords: SputumRecord[];
  dotsLogs: DOTSLog[];
  nextAppointmentDate?: string;
  nextAppointmentReason?: string;
  lastLocationUpdatedBy?: string;
  lastLocationUpdatedAt?: string;
}

export interface HouseholdContact {
  id: string;
  indexPatientId: string;
  indexPatientName: string;
  indexPatientHN: string;
  idCard: string;
  prefix: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'ชาย' | 'หญิง';
  relationship: 'สามี/ภรรยา' | 'บุตร' | 'บิดา/มารดา' | 'พี่น้อง' | 'ผู้สัมผัสร่วมบ้าน' | 'เพื่อนบ้านใกล้ชิด';
  phone: string;
  subdistrict: string;
  village: string;
  riskFactors: string[]; // e.g. 'เด็กอายุ < 5 ปี', 'ผู้สูงอายุ > 60 ปี', 'มีโรคประจำตัว/ผู้ป่วย HIV'
  symptoms: {
    coughOver2Weeks: boolean;
    fever: boolean;
    nightSweats: boolean;
    weightLoss: boolean;
    haemoptysis: boolean; // ไอเป็นเลือด
  };
  screeningDate: string;
  cxrResult: CXRResult;
  cxrDate?: string;
  afbResult: SputumResultStatus;
  afbDate?: string;
  outcome: ContactOutcome;
  tptRegimen?: string; // e.g. '3HP', '1HP', '6H'
  tptStartDate?: string;
  nextAppointmentDate?: string;
  notes?: string;
}

export interface HealthUnitInfo {
  name: string;
  subdistrict: string;
  villagesCount: number;
  villages: string[];
}

export interface SubdistrictInfo {
  code: string;
  name: string; // ตำบลบ้านโพน, ตำบลบ้านแป้น, ตำบลนาตงวัฒนา, ตำบลเชียงเสือ, ตำบลนาแก้ว
  lat: number;
  lng: number;
  villagesCount: number;
  healthUnitsCount: number;
  population: number;
  healthCenterName: string; // รพ.สต. / หน่วยบริการ
  healthUnits: HealthUnitInfo[];
  villages: string[];
}

export interface LineNotificationConfig {
  mode: 'messaging_api' | 'notify';
  channelAccessToken: string; // LINE OA Messaging API Channel Access Token
  targetGroupId: string;      // LINE Group ID (C...) or User ID (U...)
  token: string;              // LINE Notify Token (Legacy)
  autoDailyReminders: boolean;
  reminderTime: string;       // "08:00"
  autoAppointmentReminders: boolean;
  alertOnMissedDoses: boolean;
  missedThresholdDays: number; // e.g. 2
  lineGroupName: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: 'daily_dots' | 'appointment' | 'missed_dose_alert' | 'contact_screening' | 'system';
  targetName: string;
  message: string;
  status: 'sent' | 'simulated' | 'failed';
  errorDetails?: string;
}

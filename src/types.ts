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

export type PatientCategory = 'New' | 'Relapse' | 'Treatment after failure' | 'Treatment after default' | 'Transfer in' | 'Other';
export type HIVStatus = 'Positive' | 'Negative' | 'Unknown / Not Tested';
export type GeneXpertResult = 'MTB not detected' | 'MTB detected, Rif Resistance not detected' | 'MTB detected, Rif Resistance detected' | 'MTB detected, Rif Resistance indeterminate' | 'Invalid / Error' | 'Not Done';

export interface InvestigationRecord {
  id: string;
  patientId?: string; // Linked Patient ID if already registered
  investigationNumber: string; // เช่น INV-67-001
  investigationDate: string; // YYYY-MM-DD
  investigatorName: string;
  investigatorRole: string; // เช่น นักวิชาการสาธารณสุข, พยาบาลวิชาชีพ, จพ.สาธารณสุข
  investigatorUnit: string; // เช่น รพ.สต.บ้านโพน / กลุ่มงานเวชปฏิบัติครอบครัวและชุมชน รพ.โพนนาแก้ว
  investigatorPhone: string;

  // Section 1: ข้อมูลทั่วไปผู้ป่วย
  hn: string;
  idCard: string;
  prefix: string;
  firstName: string;
  lastName: string;
  gender: 'ชาย' | 'หญิง';
  age: number;
  nationality: string; // ไทย / อื่นๆ
  maritalStatus: 'โสด' | 'สมรส' | 'หม้าย' | 'หย่าร้าง/แยกกันอยู่';
  occupation: string;
  workplaceOrSchool: string;
  phone: string;
  
  // ที่อยู่ขณะป่วย
  houseNo: string;
  villageNo: string; // หมู่ที่
  villageName: string; // บ้าน...
  subdistrict: string; // ตำบล
  district: string; // อำเภอ (default โพนนาแก้ว)
  province: string; // จังหวัด (default สกลนคร)
  lat?: number;
  lng?: number;

  // Section 2: ประวัติการเจ็บป่วยและอาการ
  onsetDate: string; // วันเริ่มมีอาการ
  firstConsultDate: string; // วันรับการรักษาครั้งแรก
  diagnosisDate: string; // วันวินิจฉัย
  treatmentStartDate: string; // วันเริ่มยา
  durationOfSymptomsWeeks: number; // ระยะเวลาที่มีอาการ (สัปดาห์)
  symptoms: {
    chronicCough: boolean; // ไอเรื้อรัง > 2 สัปดาห์
    hemoptysis: boolean; // ไอเป็นเลือด
    afternoonFever: boolean; // มีไข้ต่ำๆ ตอนบ่าย/ค่ำ
    nightSweats: boolean; // เหงื่อออกกลางคืน
    weightLoss: boolean; // น้ำหนักลด
    lossOfAppetite: boolean; // เบื่ออาหาร
    chestPain: boolean; // เจ็บแน่นหน้าอก
    dyspnea: boolean; // หอบเหนื่อย
    lymphNodeSwelling: boolean; // ต่อมน้ำเหลืองโต
    otherSymptoms?: string;
  };

  // Section 3: ประวัติความเสี่ยงและโรคร่วม (Risk Factors & Comorbidities)
  smoking: 'ไม่สูบ' | 'เคยสูบ (เลิกแล้ว)' | 'สูบเป็นประจำ';
  smokingPackYears?: string;
  alcohol: 'ไม่ดื่ม' | 'ดื่มเป็นครั้งคราว' | 'ดื่มเป็นประจำ (ติดสุรา)';
  substanceAbuse: boolean;
  substanceDetails?: string;
  underlyingDiseases: {
    diabetes: boolean; // เบาหวาน (DM)
    ckd: boolean; // ไตวายเรื้อรัง (CKD)
    copdAsthma: boolean; // ถุงลมโป่งพอง/หอบหืด
    liverDisease: boolean; // โรคตับ
    malignancy: boolean; // มะเร็ง
    immunosuppressive: boolean; // ได้รับยากดภูมิคุ้มกัน/สเตียรอยด์
    other?: string;
  };
  hivStatus: HIVStatus;
  hivTestedDate?: string;
  onArt?: boolean; // ได้รับยาต้านไวรัสหรือไม่

  // ประวัติการสัมผัสและปัจจัยสิ่งแวดล้อม
  historyOfTbContact: boolean; // มีประวัติสัมผัสผู้ป่วยวัณโรค
  tbContactSourceDetails?: string; // รายละเอียดผู้ที่เป็นแหล่งโรค เช่น พ่อ, เพื่อนร่วมงาน
  pastTbHistory: boolean; // เคยป่วยเป็นวัณโรคมาก่อนหรือไม่
  pastTbYear?: string;
  pastTbOutcome?: string;
  prisonHistory: boolean; // เคยต้องโทษในเรือนจำ
  crowdedLiving: boolean; // สภาพบ้านแออัด/ถ่ายเทไม่สะดวก
  householdMembersCount: number; // จำนวนผู้อยู่อาศัยในบ้านทั้งหมด

  // Section 4: การตรวจทางห้องปฏิบัติการและรังสีวิทยา (Lab & X-ray)
  cxrDate: string;
  cxrResult: CXRResult;
  cxrLesionType: 'Cavity (มีโพรงแผล)' | 'Infiltration' | 'Effusion' | 'Miliary' | 'Normal' | 'Other';
  cxrDetails?: string;

  afbSmear1: SputumResultStatus;
  afbSmear2: SputumResultStatus;
  afbSmear3: SputumResultStatus;
  afbDate: string;
  afbLabNo?: string;

  geneXpertDate?: string;
  geneXpertResult: GeneXpertResult;
  cultureDate?: string;
  cultureResult?: 'Negative' | 'MTB Positive' | 'NTM' | 'Contaminated' | 'Pending';
  dstResult?: string; // ผลความไวต่อยา

  // Section 5: การวินิจฉัยและการรักษา (Diagnosis & Treatment)
  patientCategory: PatientCategory;
  tbType: TBType;
  icd10Code?: string; // e.g. A15.0, A15.1, A16.0
  treatmentRegimen: string; // e.g. 2HRZE/4HR
  treatingFacility: string; // e.g. รพ.โพนนาแก้ว
  dotsSupervisorType: 'อสม.พี่เลี้ยง' | 'เจ้าหน้าที่สาธารณสุข' | 'สมาชิกครอบครัว' | 'รับประทานเอง';
  dotsSupervisorName: string;
  dotsSupervisorPhone: string;

  // Section 6: ผลการติดตามผู้สัมผัส (Contact Investigation Summary)
  contactsIdentified: number; // จำนวนผู้สัมผัสที่ค้นพบ
  contactsScreened: number; // คัดกรองอาการแล้ว
  contactsCxrDone: number; // ตรวจ CXR แล้ว
  contactsAfbDone: number; // ตรวจเสมหะแล้ว
  contactsTptInitiated: number; // ได้รับยาป้องกัน TPT แล้ว
  contactsActiveTbFound: number; // พบเป็นวัณโรค (Active TB)

  // Section 7: สรุปผลการสอบสวน แหล่งแพร่โรค และมาตรการ
  suspectedSource: 'ในครอบครัว' | 'ในที่ทำงาน/โรงเรียน' | 'ในชุมชน' | 'ไม่ทราบแหล่งชัดเจน';
  transmissionRisk: 'สูง (High Risk)' | 'ปานกลาง (Moderate Risk)' | 'ต่ำ (Low Risk)';
  investigationSummary: string; // สรุปผลการสอบสวน
  controlMeasuresTaken: string; // มาตรการควบคุมโรคที่ได้ดำเนินการ (เช่น แจกหน้ากาก แนะนำการเปิดระบายอากาศ นัดตรวจญาติ)
  recommendations: string; // ข้อเสนอแนะสำหรับพื้นที่/รพ.สต.
  
  status: 'Complete' | 'Draft' | 'Pending Follow-up';
  createdAt: string;
  updatedAt: string;
}

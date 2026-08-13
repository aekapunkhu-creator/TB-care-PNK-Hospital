import { Patient, HouseholdContact, SubdistrictInfo, LineNotificationConfig, NotificationLog, UserAccount } from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'password123',
    fullName: 'แอดมินกลุ่มงานควบคุมโรค รพ.โพนนาแก้ว',
    role: 'Admin',
    hospitalName: 'โรงพยาบาลโพนนาแก้ว',
    phone: '042-123-456',
    createdAt: '2026-01-01'
  },
  {
    id: 'USR-002',
    username: 'staff_nakaeo',
    password: '123456',
    fullName: 'พยาบาลวิชาชีพ รพ.สต.นาแก้ว',
    role: 'Staff',
    subdistrict: 'ตำบลนาแก้ว',
    hospitalName: 'รพ.สต.นาแก้ว',
    phone: '081-999-8888',
    createdAt: '2026-02-15'
  },
  {
    id: 'USR-003',
    username: 'osm_somporn',
    password: '1234',
    fullName: 'นางสมพร สุขสันต์ (อสม. พี่เลี้ยง)',
    role: 'อสม.',
    subdistrict: 'ตำบลนาแก้ว',
    phone: '089-987-6543',
    createdAt: '2026-03-01'
  }
];

export const PHON_NA_KAEO_SUBDISTRICTS: SubdistrictInfo[] = [
  {
    code: '471401',
    name: 'ตำบลนาแก้ว',
    lat: 17.060,
    lng: 104.280,
    villagesCount: 12,
    population: 11450,
    healthCenterName: 'โรงพยาบาลโพนนาแก้ว / รพ.สต.นาแก้ว',
  },
  {
    code: '471402',
    name: 'ตำบลบ้านโพน',
    lat: 17.085,
    lng: 104.295,
    villagesCount: 9,
    population: 7820,
    healthCenterName: 'รพ.สต.บ้านโพน',
  },
  {
    code: '471403',
    name: 'ตำบลโพนกัง',
    lat: 17.040,
    lng: 104.310,
    villagesCount: 8,
    population: 6940,
    healthCenterName: 'รพ.สต.โพนกัง',
  },
  {
    code: '471404',
    name: 'ตำบลนาตงง้อง',
    lat: 17.090,
    lng: 104.260,
    villagesCount: 10,
    population: 8310,
    healthCenterName: 'รพ.สต.นาตงง้อง',
  },
  {
    code: '471405',
    name: 'ตำบลบ้านเมือง',
    lat: 17.025,
    lng: 104.270,
    villagesCount: 10,
    population: 8650,
    healthCenterName: 'รพ.สต.บ้านเมือง',
  },
];

// Helper to generate past dates
const getDateDaysAgo = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const getDateDaysAhead = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'TB-6701',
    hn: 'HN-104829',
    idCard: '1471400291823',
    prefix: 'นาย',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    gender: 'ชาย',
    age: 52,
    phone: '081-234-5678',
    subdistrict: 'ตำบลนาแก้ว',
    village: 'หมู่ 1 บ้านนาแก้ว',
    houseNo: '45/2',
    tbType: 'Pulmonary Smear+',
    regimen: '2HRZE/4HR',
    registrationDate: '2026-05-10',
    treatmentStartDate: '2026-05-12',
    expectedEndDate: '2026-11-12',
    dotsSupervisorName: 'นางสมพร สุขสันต์ (อสม.)',
    dotsSupervisorRole: 'อสม. พี่เลี้ยง',
    dotsSupervisorPhone: '089-987-6543',
    status: 'Active',
    lat: 17.062,
    lng: 104.282,
    nextAppointmentDate: getDateDaysAhead(3),
    nextAppointmentReason: 'นัดตรวจเสมหะติดตามผลเดือนที่ 3 และรับยาต่อ',
    sputumRecords: [
      { monthLabel: ' Baseline (เดือน 0)', monthNum: 0, dueDate: '2026-05-10', testDate: '2026-05-10', result: '3+', labNumber: 'LAB-67-0012' },
      { monthLabel: 'เดือนที่ 2', monthNum: 2, dueDate: '2026-07-12', testDate: '2026-07-14', result: 'Negative', labNumber: 'LAB-67-0245' },
      { monthLabel: 'เดือนที่ 5', monthNum: 5, dueDate: '2026-10-12', result: 'Pending' },
      { monthLabel: 'เดือนที่ 6/8', monthNum: 6, dueDate: '2026-11-10', result: 'Pending' }
    ],
    dotsLogs: Array.from({ length: 30 }).map((_, i) => {
      const dateStr = getDateDaysAgo(29 - i);
      // Let's create a realistic log with 2 missed doses
      const isMissed = i === 25 || i === 26;
      return {
        date: dateStr,
        taken: !isMissed,
        takenTime: !isMissed ? '08:15' : undefined,
        sideEffects: i % 7 === 0 ? ['คลื่นไส้เล็กน้อย'] : [],
        observedBy: 'นางสมพร สุขสันต์ (อสม.)',
        notes: isMissed ? 'ผู้ป่วยไปทำงานต่างตำบล ลืมนำยาไป' : 'ทานยาเรียบร้อย'
      };
    })
  },
  {
    id: 'TB-6702',
    hn: 'HN-105210',
    idCard: '1471400382910',
    prefix: 'นาง',
    firstName: 'พยอม',
    lastName: 'วงค์คำ',
    gender: 'หญิง',
    age: 64,
    phone: '086-543-2109',
    subdistrict: 'ตำบลบ้านโพน',
    village: 'หมู่ 3 บ้านโพนกวาง',
    houseNo: '12',
    tbType: 'Pulmonary Smear+',
    regimen: '2HRZE/4HR',
    registrationDate: '2026-06-01',
    treatmentStartDate: '2026-06-03',
    expectedEndDate: '2026-12-03',
    dotsSupervisorName: 'พยาบาลสุภาภรณ์ (รพ.สต.บ้านโพน)',
    dotsSupervisorRole: 'เจ้าหน้าที่ รพ.สต.',
    dotsSupervisorPhone: '084-321-0987',
    status: 'Active',
    lat: 17.087,
    lng: 104.298,
    nextAppointmentDate: getDateDaysAhead(5),
    nextAppointmentReason: 'รับยาต้านวัณโรคระยะต่อเนื่อง',
    sputumRecords: [
      { monthLabel: ' Baseline (เดือน 0)', monthNum: 0, dueDate: '2026-06-01', testDate: '2026-06-01', result: '2+', labNumber: 'LAB-67-0105' },
      { monthLabel: 'เดือนที่ 2', monthNum: 2, dueDate: '2026-08-03', testDate: '2026-08-05', result: 'Negative', labNumber: 'LAB-67-0389' },
      { monthLabel: 'เดือนที่ 5', monthNum: 5, dueDate: '2026-11-03', result: 'Pending' },
      { monthLabel: 'เดือนที่ 6/8', monthNum: 6, dueDate: '2026-12-01', result: 'Pending' }
    ],
    dotsLogs: Array.from({ length: 30 }).map((_, i) => ({
      date: getDateDaysAgo(29 - i),
      taken: true,
      takenTime: '07:30',
      sideEffects: [],
      observedBy: 'พยาบาลสุภาภรณ์',
      notes: 'รับทานยาตรงเวลา'
    }))
  },
  {
    id: 'TB-6703',
    hn: 'HN-103980',
    idCard: '1471400192837',
    prefix: 'นาย',
    firstName: 'ทองคำ',
    lastName: 'มีมาก',
    gender: 'ชาย',
    age: 48,
    phone: '093-112-2334',
    subdistrict: 'ตำบลโพนกัง',
    village: 'หมู่ 2 บ้านโพนกัง',
    houseNo: '88/1',
    tbType: 'Pulmonary Smear-',
    regimen: '2HRZE/4HR',
    registrationDate: '2026-04-15',
    treatmentStartDate: '2026-04-16',
    expectedEndDate: '2026-10-16',
    dotsSupervisorName: 'นายวิชัย มีมาก (บุตรชาย)',
    dotsSupervisorRole: 'ญาติผู้ดูแล',
    dotsSupervisorPhone: '093-112-2335',
    status: 'Active',
    lat: 17.042,
    lng: 104.312,
    nextAppointmentDate: getDateDaysAhead(12),
    nextAppointmentReason: 'ตรวจติดตามอาการและรับยารวดเดียว 1 เดือน',
    sputumRecords: [
      { monthLabel: ' Baseline (เดือน 0)', monthNum: 0, dueDate: '2026-04-15', testDate: '2026-04-15', result: 'Negative', labNumber: 'LAB-67-0050' },
      { monthLabel: 'เดือนที่ 2', monthNum: 2, dueDate: '2026-06-16', testDate: '2026-06-16', result: 'Negative', labNumber: 'LAB-67-0180' },
      { monthLabel: 'เดือนที่ 5', monthNum: 5, dueDate: '2026-09-16', result: 'Pending' },
      { monthLabel: 'เดือนที่ 6/8', monthNum: 6, dueDate: '2026-10-15', result: 'Pending' }
    ],
    dotsLogs: Array.from({ length: 30 }).map((_, i) => ({
      date: getDateDaysAgo(29 - i),
      taken: true,
      takenTime: '08:00',
      observedBy: 'นายวิชัย มีมาก'
    }))
  },
  {
    id: 'TB-6704',
    hn: 'HN-102911',
    idCard: '1471400098123',
    prefix: 'นาย',
    firstName: 'บุญมี',
    lastName: 'ศรีบุญเรือง',
    gender: 'ชาย',
    age: 69,
    phone: '082-998-7766',
    subdistrict: 'ตำบลนาตงง้อง',
    village: 'หมู่ 4 บ้านนาตงง้อง',
    houseNo: '102',
    tbType: 'Extra-Pulmonary',
    regimen: '2HRZE/4HR',
    registrationDate: '2025-11-01',
    treatmentStartDate: '2025-11-03',
    expectedEndDate: '2026-05-03',
    dotsSupervisorName: 'นางปราณี (อสม.)',
    dotsSupervisorRole: 'อสม. พี่เลี้ยง',
    dotsSupervisorPhone: '082-334-5566',
    status: 'Cured',
    lat: 17.092,
    lng: 104.263,
    sputumRecords: [
      { monthLabel: ' Baseline (เดือน 0)', monthNum: 0, dueDate: '2025-11-01', testDate: '2025-11-01', result: 'Negative' },
      { monthLabel: 'เดือนที่ 2', monthNum: 2, dueDate: '2026-01-03', testDate: '2026-01-05', result: 'Negative' },
      { monthLabel: 'เดือนที่ 5', monthNum: 5, dueDate: '2026-04-03', testDate: '2026-04-03', result: 'Negative' },
      { monthLabel: 'เดือนที่ 6/8', monthNum: 6, dueDate: '2026-05-03', testDate: '2026-05-03', result: 'Negative' }
    ],
    dotsLogs: []
  },
  {
    id: 'TB-6705',
    hn: 'HN-106012',
    idCard: '1471400491029',
    prefix: 'นางสาว',
    firstName: 'กัลยา',
    lastName: 'ผลงาม',
    gender: 'หญิง',
    age: 29,
    phone: '098-765-4321',
    subdistrict: 'ตำบลบ้านเมือง',
    village: 'หมู่ 2 บ้านหนองบัวฮี',
    houseNo: '77',
    tbType: 'Pulmonary Smear+',
    regimen: '2HRZE/4HR',
    registrationDate: '2026-07-01',
    treatmentStartDate: '2026-07-02',
    expectedEndDate: '2027-01-02',
    dotsSupervisorName: 'นางสิริพร (รพ.สต.บ้านเมือง)',
    dotsSupervisorRole: 'เจ้าหน้าที่ รพ.สต.',
    dotsSupervisorPhone: '098-123-4567',
    status: 'Active',
    lat: 17.028,
    lng: 104.273,
    nextAppointmentDate: getDateDaysAhead(1),
    nextAppointmentReason: 'เจาะเลือดติดตามค่าการทำงานของตับ LFT',
    sputumRecords: [
      { monthLabel: ' Baseline (เดือน 0)', monthNum: 0, dueDate: '2026-07-01', testDate: '2026-07-01', result: '1+', labNumber: 'LAB-67-0412' },
      { monthLabel: 'เดือนที่ 2', monthNum: 2, dueDate: '2026-09-02', result: 'Pending' },
      { monthLabel: 'เดือนที่ 5', monthNum: 5, dueDate: '2026-12-02', result: 'Pending' },
      { monthLabel: 'เดือนที่ 6/8', monthNum: 6, dueDate: '2027-01-02', result: 'Pending' }
    ],
    dotsLogs: Array.from({ length: 30 }).map((_, i) => ({
      date: getDateDaysAgo(29 - i),
      taken: true,
      takenTime: '08:30',
      observedBy: 'นางสิริพร (รพ.สต.)'
    }))
  }
];

export const INITIAL_CONTACTS: HouseholdContact[] = [
  {
    id: 'CT-101',
    indexPatientId: 'TB-6701',
    indexPatientName: 'นายสมชาย ใจดี',
    indexPatientHN: 'HN-104829',
    idCard: '1471400291899',
    prefix: 'นาง',
    firstName: 'สมศรี',
    lastName: 'ใจดี',
    age: 49,
    gender: 'หญิง',
    relationship: 'สามี/ภรรยา',
    phone: '081-234-5679',
    subdistrict: 'ตำบลนาแก้ว',
    village: 'หมู่ 1 บ้านนาแก้ว',
    riskFactors: ['ผู้สัมผัสร่วมบ้านใกล้ชิด'],
    symptoms: {
      coughOver2Weeks: true,
      fever: false,
      nightSweats: true,
      weightLoss: false,
      haemoptysis: false
    },
    screeningDate: '2026-05-15',
    cxrResult: 'Abnormal TB Suspect',
    cxrDate: '2026-05-20',
    afbResult: 'Negative',
    afbDate: '2026-05-22',
    outcome: 'TPT Initiated',
    tptRegimen: '3HP (Rapapentine + INH รายสัปดาห์ 12 สัปดาห์)',
    tptStartDate: '2026-06-01',
    nextAppointmentDate: getDateDaysAhead(7),
    notes: 'เริ่ม TPT เรียบร้อย ไม่มีอาการข้างเคียง'
  },
  {
    id: 'CT-102',
    indexPatientId: 'TB-6701',
    indexPatientName: 'นายสมชาย ใจดี',
    indexPatientHN: 'HN-104829',
    idCard: '1471400295555',
    prefix: 'เด็กชาย',
    firstName: 'ป้องเกียรติ',
    lastName: 'ใจดี',
    age: 4,
    gender: 'ชาย',
    relationship: 'บุตร',
    phone: '081-234-5678',
    subdistrict: 'ตำบลนาแก้ว',
    village: 'หมู่ 1 บ้านนาแก้ว',
    riskFactors: ['เด็กอายุ < 5 ปี', 'ผู้สัมผัสร่วมบ้านใกล้ชิด'],
    symptoms: {
      coughOver2Weeks: false,
      fever: false,
      nightSweats: false,
      weightLoss: false,
      haemoptysis: false
    },
    screeningDate: '2026-05-15',
    cxrResult: 'Normal',
    cxrDate: '2026-05-20',
    afbResult: 'Not Done',
    outcome: 'TPT Initiated',
    tptRegimen: '1HP (Rifapentine + Isoniazid รายวัน 1 เดือน)',
    tptStartDate: '2026-05-25',
    notes: 'เด็กอายุต่ำกว่า 5 ปี ได้รับการรักษาป้องกันวัณโรคตามแนวทาง NTP'
  },
  {
    id: 'CT-103',
    indexPatientId: 'TB-6702',
    indexPatientName: 'นางพยอม วงค์คำ',
    indexPatientHN: 'HN-105210',
    idCard: '1471400389999',
    prefix: 'นาย',
    firstName: 'เกรียงไกร',
    lastName: 'วงค์คำ',
    age: 68,
    gender: 'ชาย',
    relationship: 'สามี/ภรรยา',
    phone: '086-543-2110',
    subdistrict: 'ตำบลบ้านโพน',
    village: 'หมู่ 3 บ้านโพนกวาง',
    riskFactors: ['ผู้สูงอายุ > 60 ปี', 'ผู้สัมผัสร่วมบ้านใกล้ชิด'],
    symptoms: {
      coughOver2Weeks: false,
      fever: false,
      nightSweats: false,
      weightLoss: false,
      haemoptysis: false
    },
    screeningDate: '2026-06-05',
    cxrResult: 'Normal',
    cxrDate: '2026-06-10',
    afbResult: 'Negative',
    afbDate: '2026-06-11',
    outcome: 'Cleared',
    notes: 'ผล CXR และ AFB ปกติ แนะนำสังเกตอาการต่อเนื่อง 2 ปี'
  },
  {
    id: 'CT-104',
    indexPatientId: 'TB-6705',
    indexPatientName: 'นางสาวกัลยา ผลงาม',
    indexPatientHN: 'HN-106012',
    idCard: '1471400498888',
    prefix: 'นาง',
    firstName: 'จันทร์เพ็ญ',
    lastName: 'ผลงาม',
    age: 56,
    gender: 'หญิง',
    relationship: 'บิดา/มารดา',
    phone: '098-765-4322',
    subdistrict: 'ตำบลบ้านเมือง',
    village: 'หมู่ 2 บ้านหนองบัวฮี',
    riskFactors: ['มีโรคประจำตัว/ผู้ป่วย HIV', 'ผู้สัมผัสร่วมบ้านใกล้ชิด'],
    symptoms: {
      coughOver2Weeks: true,
      fever: true,
      nightSweats: true,
      weightLoss: true,
      haemoptysis: false
    },
    screeningDate: '2026-07-05',
    cxrResult: 'Pending',
    afbResult: 'Pending',
    outcome: 'Under Evaluation',
    nextAppointmentDate: getDateDaysAhead(2),
    notes: 'ส่งตรวจถ่ายภาพรังสีทรวงอก CXR และ GeneXpert ณ รพ.โพนนาแก้ว'
  }
];

export const INITIAL_LINE_CONFIG: LineNotificationConfig = {
  token: 'SAMPLE_LINE_NOTIFY_TOKEN_PHONNAKAEO_TB',
  autoDailyReminders: true,
  reminderTime: '08:00',
  autoAppointmentReminders: true,
  alertOnMissedDoses: true,
  missedThresholdDays: 2,
  lineGroupName: 'กลุ่มงานควบคุมวัณโรค อ.โพนนาแก้ว (สสอ./รพ.)'
};

export const INITIAL_LOGS: NotificationLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-08-12 08:00:15',
    type: 'daily_dots',
    targetName: 'นายสมชาย ใจดี (TB-6701)',
    message: '💊 [เตือนรับประทานยา DOTS] สวัสดีครับ คุณสมชาย ใจดี ได้เวลาทานยาต้านวัณโรคประจำวัน (08:00 น.) โปรดแจ้ง อสม. พี่เลี้ยงเมื่อทานยาเรียบร้อยครับ',
    status: 'simulated'
  },
  {
    id: 'LOG-002',
    timestamp: '2026-08-12 09:15:00',
    type: 'missed_dose_alert',
    targetName: 'นางสมพร สุขสันต์ (อสม. พี่เลี้ยง)',
    message: '🚨 [แจ้งเตือนขาดส่งผลทานยา] ผู้ป่วย TB-6701 นายสมชาย ใจดี (ต.นาแก้ว ม.1) ขาดบันทึกทานยาติดต่อกัน 2 วัน เจ้าหน้าที่ รพ.สต./อสม. โปรดลงพื้นที่ติดตาม',
    status: 'simulated'
  },
  {
    id: 'LOG-003',
    timestamp: '2026-08-12 10:30:00',
    type: 'appointment',
    targetName: 'นางสาวกัลยา ผลงาม (TB-6705)',
    message: '📅 [แจ้งเตือนวันนัดหมาย] คุณกัลยา ผลงาม มีนัดตรวจติดตามเจาะเลือด LFT ณ รพ.สต.บ้านเมือง ในวันที่ ' + getDateDaysAhead(1) + ' เวลา 08:30 น.',
    status: 'simulated'
  }
];

import { LineNotificationConfig } from '../types';

export function generateGoogleAppsScript(config: LineNotificationConfig): string {
  const token = config.token || 'YOUR_LINE_NOTIFY_TOKEN_HERE';

  return `/**
 * ==============================================================================
 * โปรแกรมควบคุมและติดตามผู้ป่วยวัณโรค อ.โพนนาแก้ว จ.สกลนคร (TB-Care Phon Na Kaeo)
 * พัฒนาสำหรับ Google Apps Script + Google Sheets + LINE Notify Webhook
 * ==============================================================================
 * 
 * วิธีเปิดใช้งาน:
 * 1. สร้าง Google Sheets ใหม่ -> ไปที่เมนู "ส่วนขยาย (Extensions)" -> "Apps Script"
 * 2. คัดลอกโค้ดนี้ทั้งหมดวางลงในไฟล์ Code.gs
 * 3. ใส่ LINE_NOTIFY_TOKEN ด้านล่าง
 * 4. กดเรียกใช้ฟังก์ชัน initializeSheets() เพื่อสร้างหัวตารางอัตโนมัติ
 * 5. กดเรียกใช้ฟังก์ชัน setupTriggers() เพื่อเปิดระบบแจ้งเตือนทานยาและวันนัดอัตโนมัติ
 * 6. (ตัวเลือก) กด "ทำให้ใช้งานได้ (Deploy)" -> "การทำให้ใช้งานได้ใหม่ในฐานะเว็บแอป (New Deployment)"
 */

const LINE_NOTIFY_TOKEN = "${token}";
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/**
 * 1. ฟังก์ชันส่งข้อความ LINE Notify
 */
function sendLineNotify(message, token) {
  const lineToken = token || LINE_NOTIFY_TOKEN;
  if (!lineToken || lineToken.indexOf("YOUR_LINE") !== -1) {
    Logger.log("กรุณาใส่ LINE Notify Token ให้ถูกต้อง");
    return false;
  }
  
  const url = "https://notify-api.line.me/api/notify";
  const options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + lineToken
    },
    "payload": {
      "message": message
    },
    "muteHttpExceptions": true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log("LINE Response: " + response.getContentText());
    return true;
  } catch (e) {
    Logger.log("Error sending LINE Notify: " + e.toString());
    return false;
  }
}

/**
 * 2. งานประจำวัน (Daily Job) เตือนทานยา DOTS ประจำวัน (ตั้งเวลา 08:00 น.)
 */
function dailyDotsReminderJob() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const patientSheet = ss.getSheetByName("TB_Patients");
  if (!patientSheet) return;
  
  const data = patientSheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  let activeCount = 0;
  let reminderList = [];
  
  // วนลูปตรวจสอบผู้ป่วยที่กำลังรักษาอยู่
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const patientId = row[0];
    const name = row[3] + row[4] + " " + row[5];
    const status = row[14]; // สถานะการรักษา
    const subdistrict = row[9];
    const village = row[10];
    const supervisor = row[11];
    
    if (status === "Active" || status === "อยู่ระหว่างรักษา") {
      activeCount++;
      reminderList.push("• " + name + " (" + subdistrict + " " + village + ") - อสม./พี่เลี้ยง: " + supervisor);
    }
  }
  
  if (activeCount > 0) {
    const todayStr = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy");
    let msg = "\\n💊 [เตือนทานยา DOTS ประจำวัน อ.โพนนาแก้ว]\\nประจำวันที่: " + todayStr;
    msg += "\\nยอดผู้ป่วยอยู่ระหว่างรักษา: " + activeCount + " ราย\\n\\nรายชื่อผู้ป่วยที่ต้องรับยาเช้านี้:\\n";
    msg += reminderList.join("\\n");
    msg += "\\n\\nข้อแนะนำ: เจ้าหน้าที่ รพ.สต./อสม. โปรดตรวจสอบการรับประทานยาผ่านแอป TB-Care";
    
    sendLineNotify(msg);
  }
}

/**
 * 3. งานเตือนวันนัดหมายตรวจเสมหะและรับยา (ตั้งเวลา 07:30 น.)
 */
function appointmentReminderJob() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const patientSheet = ss.getSheetByName("TB_Patients");
  if (!patientSheet) return;
  
  const data = patientSheet.getDataRange().getValues();
  if (data.length <= 1) return;
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  let apptList = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const name = row[3] + row[4] + " " + row[5];
    const apptDateRaw = row[16]; // วันนัดถัดไป
    const reason = row[17] || "ตรวจเสมหะ/รับยาตามกำหนด";
    const status = row[14];
    
    if ((status === "Active" || status === "อยู่ระหว่างรักษา") && apptDateRaw) {
      const apptDate = new Date(apptDateRaw);
      apptDate.setHours(0,0,0,0);
      
      const diffTime = apptDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // เตือนล่วงหน้า 1-3 วัน
      if (diffDays >= 0 && diffDays <= 3) {
        const apptStr = Utilities.formatDate(apptDate, "Asia/Bangkok", "dd/MM/yyyy");
        const dayTag = diffDays === 0 ? "⚠️ [นัดวันนี้]" : (diffDays === 1 ? "⏰ [นัดพรุ่งนี้]" : "📅 [อีก " + diffDays + " วัน]");
        apptList.push(dayTag + " " + name + "\\n  วันนัด: " + apptStr + "\\n  เหตุผล: " + reason);
      }
    }
  }
  
  if (apptList.length > 0) {
    let msg = "\\n📅 [แจ้งเตือนนัดหมายติดตามวัณโรค อ.โพนนาแก้ว]\\nมีรายการนัดหมายตรวจเสมหะ/รับยาล่วงหน้าดังนี้:\\n\\n";
    msg += apptList.join("\\n\\n");
    
    sendLineNotify(msg);
  }
}

/**
 * 4. ติดตั้ง Triggers อัตโนมัติ (เปิดใช้งานระบบแจ้งเตือนตามเวลา)
 */
function setupTriggers() {
  // ลบ Trigger เดิมที่มีอยู่
  const existingTriggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < existingTriggers.length; i++) {
    ScriptApp.deleteTrigger(existingTriggers[i]);
  }
  
  // สร้าง Trigger เตือนทานยาประจำวัน ทุกวัน เวลา 08:00 - 09:00 น.
  ScriptApp.newTrigger("dailyDotsReminderJob")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .inTimezone("Asia/Bangkok")
    .create();
    
  // สร้าง Trigger เตือนนัดหมายประจำวัน ทุกวัน เวลา 07:30 - 08:30 น.
  ScriptApp.newTrigger("appointmentReminderJob")
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .nearMinute(30)
    .inTimezone("Asia/Bangkok")
    .create();
    
  Logger.log("ติดตั้งระบบแจ้งเตือนสำเร็จแล้ว!");
  sendLineNotify("\\n✅ [ระบบ TB-Care โพนนาแก้ว]\\nเริ่มต้นระบบแจ้งเตือนอัตโนมัติสำเร็จ (เตือนทานยา 08:00 น. / เตือนนัดหมาย 07:30 น.)");
}

/**
 * 5. ฟังก์ชันสร้าง Sheet หัวตารางเริ่มต้น
 */
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: TB Patients
  let pSheet = ss.getSheetByName("TB_Patients");
  if (!pSheet) {
    pSheet = ss.insertSheet("TB_Patients");
  }
  pSheet.getRange(1, 1, 1, 18).setValues([[
    "ID", "HN", "เลขบัตรประชาชน", "คำนำหน้า", "ชื่อ", "นามสกุล", "เพศ", "อายุ", "เบอร์โทร", 
    "ตำบล", "หมู่บ้าน", "ผู้ควบคุม DOTS", "ตำแหน่งผู้ควบคุม", "เบอร์ผู้ควบคุม", "สถานะการรักษา",
    "วันเริ่มรับยา", "วันนัดถัดไป", "สาเหตุการนัด"
  ]]);
  pSheet.getRange(1, 1, 1, 18).setFontWeight("bold").setBackground("#e2e8f0");
  
  // Sheet 2: Household Contacts
  let cSheet = ss.getSheetByName("TB_Contacts");
  if (!cSheet) {
    cSheet = ss.insertSheet("TB_Contacts");
  }
  cSheet.getRange(1, 1, 1, 12).setValues([[
    "ID ผู้สัมผัส", "ผู้ป่วยดัชนี (Index Case)", "ชื่อผู้สัมผัส", "ความสัมพันธ์", "อายุ", 
    "เบอร์โทร", "ตำบล", "หมู่บ้าน", "ผล CXR", "ผล AFB/GeneXpert", "ผลการคัดกรอง", "หมายเหตุ/TPT"
  ]]);
  cSheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#e2e8f0");
  
  Logger.log("สร้างหัวตารางใน Google Sheets เรียบร้อยแล้ว!");
}

/**
 * 6. Webhook Endpoint สำหรับเชื่อมต่อกับ Web App Client
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "TB-Care Phon Na Kaeo Apps Script Webhook Active",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    
    if (action === "send_custom_notify") {
      const res = sendLineNotify(contents.message, contents.token);
      return ContentService.createTextOutput(JSON.stringify({ success: res })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "ok", actionReceived: action })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
}

import React, { useState } from 'react';
import { LineNotificationConfig, NotificationLog } from '../types';
import { generateGoogleAppsScript } from '../utils/gasCodeGenerator';
import { 
  Bell, Send, Copy, Check, Code, MessageSquare, 
  Settings, History, Sparkles, CheckCircle2, AlertTriangle, ExternalLink
} from 'lucide-react';

interface LineAppsScriptProps {
  lineConfig: LineNotificationConfig;
  onUpdateLineConfig: (newConfig: LineNotificationConfig) => void;
  logs: NotificationLog[];
  onAddLog: (log: NotificationLog) => void;
}

export const LineAppsScript: React.FC<LineAppsScriptProps> = ({
  lineConfig,
  onUpdateLineConfig,
  logs,
  onAddLog
}) => {
  const [tokenInput, setTokenInput] = useState(lineConfig.token);
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Custom Message Sandbox State
  const [customMessage, setCustomMessage] = useState(
    '💊 [เตือนทานยา DOTS ประจำวัน]\nสวัสดีครับ แจ้งเตือน อสม. พี่เลี้ยงติดตามผู้ป่วยวัณโรค ต.นาแก้ว และ ต.บ้านโพน รับประทานยาเช้านี้เรียบร้อยครับ'
  );

  // Generated GAS Code
  const gasCode = generateGoogleAppsScript({ ...lineConfig, token: tokenInput });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveConfig = () => {
    onUpdateLineConfig({ ...lineConfig, token: tokenInput });
    setTestResult({ success: true, msg: 'บันทึก Token และการตั้งค่าเรียบร้อยแล้ว' });
  };

  const handleSendTestNotify = async () => {
    setIsSending(true);
    setTestResult(null);

    try {
      // Call local backend endpoint /api/line-notify
      const res = await fetch('/api/line-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenInput,
          message: customMessage
        })
      });

      const data = await res.json();

      if (data.success) {
        setTestResult({ success: true, msg: 'ส่งข้อความ LINE Notify สำเร็จแล้ว! (ตรวจสอบในแอป LINE)' });
        onAddLog({
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('th-TH'),
          type: 'system',
          targetName: lineConfig.lineGroupName,
          message: customMessage,
          status: 'sent'
        });
      } else {
        // Fallback simulation mode
        setTestResult({ 
          success: true, 
          msg: 'โหมดจำลองสถานการณ์ (Simulated Mode): บันทึก Log ข้อความสำเร็จแล้ว' 
        });
        onAddLog({
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('th-TH'),
          type: 'system',
          targetName: lineConfig.lineGroupName,
          message: customMessage,
          status: 'simulated'
        });
      }
    } catch (err: any) {
      setTestResult({ 
        success: true, 
        msg: 'บันทึกทดลองส่งข้อความจำลองลงในระบบสำเร็จ' 
      });
      onAddLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('th-TH'),
        type: 'system',
        targetName: lineConfig.lineGroupName,
        message: customMessage,
        status: 'simulated'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wide">
            <Bell className="w-4 h-4" />
            <span>ระบบแจ้งเตือนอัตโนมัติผ่าน LINE Notify & Google Apps Script</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            การตั้งค่า LINE Notify & เชื่อมต่อ Google Apps Script
          </h2>
          <p className="text-slate-300 text-xs max-w-2xl">
            แจ้งเตือนการกินยาประจำวัน (08:00 น.), แจ้งเตือนวันนัดตรวจเสมหะ และเตือนผู้ป่วยขาดการรับยาอัตโนมัติถึงกลุ่มเจ้าหน้าที่สาธารณสุข อ.โพนนาแก้ว
          </p>
        </div>

        <button
          onClick={handleCopyCode}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition"
        >
          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{isCopied ? 'คัดลอกโค้ดเรียบร้อย!' : 'คัดลอกโค้ด Apps Script'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Token Setup & Live Test Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>ตั้งค่า LINE Notify Token และกลุ่มงาน</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                LINE Notify Access Token *
              </label>
              <input
                type="text"
                placeholder="วาง LINE Notify Token ของคุณที่นี่..."
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                สร้าง Token ได้ฟรีจากเว็บไซต์ notify-bot.line.me สำหรับส่งเข้ากลุ่มไลน์สาธารณสุข
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-700 font-medium">ชื่อกลุ่มไลน์เป้าหมาย:</span>
              <span className="font-semibold text-emerald-700">{lineConfig.lineGroupName}</span>
            </div>

            <button
              onClick={handleSaveConfig}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition"
            >
              บันทึกการตั้งค่า Token
            </button>
          </div>

          {/* Test Sandbox */}
          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>ทดสอบส่งข้อความแจ้งเตือนด่วน</span>
              </h4>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCustomMessage('💊 [เตือนทานยา DOTS ประจำวัน]\nขอความร่วมมือ อสม. พี่เลี้ยงติดตามผู้ป่วยวัณโรคในพื้นที่ อ.โพนนาแก้ว รับประทานยาตามกำหนดเวลา 08:00 น.')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
              >
                💊 เตือนทานยาประจำวัน
              </button>

              <button
                onClick={() => setCustomMessage('📅 [แจ้งเตือนวันนัดตรวจเสมหะ]\nพรุ่งนี้มีนัดตรวจเสมหะเดือนที่ 2/5/6 ณ รพ.โพนนาแก้ว / รพ.สต. โปรดเน้นย้ำผู้ป่วยนำเสมหะตลับเช้ามาส่ง')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
              >
                📅 เตือนนัดตรวจเสมหะ
              </button>

              <button
                onClick={() => setCustomMessage('🚨 [แจ้งฉุกเฉิน] ตรวจพบผู้ป่วยขาดการทานยาเกิน 2 วันติดต่อกันใน ต.นาแก้ว โปรดลงพื้นที่เยี่ยมบ้านและติดตามยา')}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium text-[11px] transition"
              >
                🚨 เตือนขาดรับยาด่วน
              </button>
            </div>

            <textarea
              rows={4}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans text-xs"
            />

            <button
              onClick={handleSendTestNotify}
              disabled={isSending}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? 'กำลังส่งข้อความ...' : 'ทดสอบส่งข้อความ LINE Notify ทันที'}</span>
            </button>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{testResult.msg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Apps Script Guide & Live Code Generator */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Code className="w-5 h-5 text-emerald-600" />
              <span>ซอร์สโค้ด Google Apps Script (Code.gs)</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>คัดลอกทั้งหมด</span>
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 text-slate-200 font-mono text-[11px] h-[340px] overflow-y-auto leading-relaxed border border-slate-800">
            <pre>{gasCode}</pre>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>วิธีติดตั้งง่ายๆ ใน 3 ขั้นตอน:</span>
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-emerald-800">
              <li>เปิด Google Sheets ใหม่ &rarr; ไปที่ <b>ส่วนขยาย (Extensions) &rarr; Apps Script</b></li>
              <li>คัดลอกโค้ดด้านบนทั้งหมดไปวางแทนที่ในไฟล์ <code>Code.gs</code></li>
              <li>กดเรียกใช้ฟังก์ชัน <code>initializeSheets()</code> แล้วตามด้วย <code>setupTriggers()</code></li>
            </ol>
          </div>
        </div>

      </div>

      {/* Notification History Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <History className="w-5 h-5 text-emerald-600" />
            <span>ประวัติการส่งข้อความแจ้งเตือน (Notification Logs)</span>
          </div>
          <span className="text-xs text-slate-400">จำนวนบันทึก: {logs.length} รายการ</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">เวลาส่ง</th>
                <th className="py-2.5 px-3">ผู้รับ / กลุ่มเป้าหมาย</th>
                <th className="py-2.5 px-3">ข้อความแจ้งเตือน</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {log.targetName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                    {log.message}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      {log.status === 'sent' ? 'ส่งสำเร็จ (LINE)' : 'จำลองระบบ'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

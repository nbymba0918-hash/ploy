import React, { useState } from 'react';
import { NotificationConfig, NotificationLog, AppUser } from '../types';
import {
  Smartphone,
  Mail,
  Send,
  CheckCircle2,
  Bell,
  Clock,
  Shield,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface NotificationSettingsViewProps {
  config: NotificationConfig;
  onSaveConfig: (cfg: NotificationConfig) => void;
  logs: NotificationLog[];
  onAddLog: (log: NotificationLog) => void;
  currentUser: AppUser;
  totalCarriedForward: number;
}

export const NotificationSettingsView: React.FC<NotificationSettingsViewProps> = ({
  config,
  onSaveConfig,
  logs,
  onAddLog,
  currentUser,
  totalCarriedForward,
}) => {
  const [formData, setFormData] = useState<NotificationConfig>(config);
  const [testChannel, setTestChannel] = useState<'SMS' | 'EMAIL'>('SMS');
  const [testRecipient, setTestRecipient] = useState<'director' | 'accountant' | 'statistician'>('director');
  const [testMessage, setTestMessage] = useState(
    `รพ.สังขละบุรี: สรุปยอดลูกหนี้ 52 สิทธิ ประจำเดือน ส.ค. 2569 ปิดงบสำเร็จ ยกไปคงเหลือสุทธิ ${totalCarriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท ขอเชิญตรวจสอบและลงนามรับรอง`
  );
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setFeedback('บันทึกการตั้งค่าเบอร์มือถือและอีเมลสำเร็จเรียบร้อยแล้ว');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSendTest = () => {
    setIsSending(true);
    setTimeout(() => {
      let recipientName = 'นายแพทย์จิรวัฒน์ วงษ์สวัสดิ์ (ผอ.รพ.)';
      let targetAddress = formData.directorPhone;
      if (testRecipient === 'accountant') {
        recipientName = 'นางสาวสุดลัดดา จันทวุฒิ (การเงิน/ธุรการ)';
        targetAddress = testChannel === 'SMS' ? formData.accountantPhone : formData.accountantEmail;
      } else if (testRecipient === 'statistician') {
        recipientName = 'นางสาวมยุรา ปรางจันทร์ (เวชสถิติ)';
        targetAddress = testChannel === 'SMS' ? formData.statisticianPhone : formData.statisticianEmail;
      } else {
        targetAddress = testChannel === 'SMS' ? formData.directorPhone : formData.directorEmail;
      }

      const newLog: NotificationLog = {
        id: `log-${Date.now()}`,
        timestamp: `${new Date().toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })} ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`,
        channel: testChannel,
        recipientName,
        targetAddress,
        title: testChannel === 'SMS' ? 'แจ้งเตือนปิดสรุปยอดลูกหนี้' : 'รายงานสรุปการเรียกเก็บลูกหนี้ 52 สิทธิ รพ.สังขละบุรี',
        message: testMessage,
        status: 'DELIVERED',
      };

      onAddLog(newLog);
      setIsSending(false);
      setFeedback(`ส่งข้อความจำลอง ${testChannel} ไปยัง ${recipientName} (${targetAddress}) สำเร็จ (สถานะ: DELIVERED)`);
      setTimeout(() => setFeedback(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">
          <Bell className="w-4 h-4" />
          ระบบแจ้งเตือนอัตโนมัติ รพ.สังขละบุรี
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
          ระบบแจ้งเตือนผ่านเบอร์มือถือ (SMS) และอีเมล (Email)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          แจ้งเตือนผู้บริหารและเจ้าหน้าที่เมื่อมีการปิดสรุปยอดรายเดือนสำเร็จ พร้อมตรวจสอบประวัติการส่ง (Notification Logs)
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recipient Configuration Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            ตั้งค่าเบอร์มือถือและอีเมลประจำตำแหน่ง
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* 1. Director Settings */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    1. ผู้อำนวยการโรงพยาบาล (ผู้รับรอง)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    นายแพทย์จิรวัฒน์ วงษ์สวัสดิ์
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.directorNotifySms}
                      onChange={(e) =>
                        setFormData({ ...formData, directorNotifySms: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.directorNotifyEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, directorNotifyEmail: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    เบอร์มือถือรับ SMS
                  </label>
                  <input
                    type="text"
                    value={formData.directorPhone}
                    onChange={(e) => setFormData({ ...formData, directorPhone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    อีเมลรับรายงาน
                  </label>
                  <input
                    type="email"
                    value={formData.directorEmail}
                    onChange={(e) => setFormData({ ...formData, directorEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Accountant Settings */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    2. เจ้าหน้าที่การเงิน / ธุรการ (ผู้รายงาน)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    นางสาวสุดลัดดา จันทวุฒิ
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accountantNotifySms}
                      onChange={(e) =>
                        setFormData({ ...formData, accountantNotifySms: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accountantNotifyEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, accountantNotifyEmail: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    เบอร์มือถือรับ SMS
                  </label>
                  <input
                    type="text"
                    value={formData.accountantPhone}
                    onChange={(e) => setFormData({ ...formData, accountantPhone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    อีเมลรับรายงาน
                  </label>
                  <input
                    type="email"
                    value={formData.accountantEmail}
                    onChange={(e) => setFormData({ ...formData, accountantEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Statistician Settings */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    3. เจ้าพนักงานเวชสถิติ (ผู้ตรวจสอบ)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    นางสาวมยุรา ปรางจันทร์
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.statisticianNotifySms}
                      onChange={(e) =>
                        setFormData({ ...formData, statisticianNotifySms: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.statisticianNotifyEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, statisticianNotifyEmail: e.target.checked })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Email</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    เบอร์มือถือรับ SMS
                  </label>
                  <input
                    type="text"
                    value={formData.statisticianPhone}
                    onChange={(e) => setFormData({ ...formData, statisticianPhone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    อีเมลรับรายงาน
                  </label>
                  <input
                    type="email"
                    value={formData.statisticianEmail}
                    onChange={(e) => setFormData({ ...formData, statisticianEmail: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Auto trigger toggle */}
            <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs">
              <span className="text-slate-700 dark:text-slate-300">
                ส่งแจ้งเตือนอัตโนมัติทันทีเมื่อเจ้าหน้าที่กด "ปิดสรุปยอดประจำเดือน"
              </span>
              <input
                type="checkbox"
                checked={formData.autoNotifyOnMonthClose}
                onChange={(e) =>
                  setFormData({ ...formData, autoNotifyOnMonthClose: e.target.checked })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              บันทึกการตั้งค่าการแจ้งเตือน
            </button>
          </form>
        </div>

        {/* Live Test Sender & Smartphone Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              ทดสอบส่งข้อความแจ้งเตือน (Dispatch Test)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">ช่องทาง</label>
                  <select
                    value={testChannel}
                    onChange={(e) => setTestChannel(e.target.value as 'SMS' | 'EMAIL')}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="SMS">มือถือ SMS</option>
                    <option value="EMAIL">จดหมายอิเล็กทรอนิกส์ (Email)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">ผู้รับ</label>
                  <select
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <option value="director">นพ.จิรวัฒน์ (รักษาการ ผอ.)</option>
                    <option value="accountant">น.ส.สุดลัดดา (การเงิน)</option>
                    <option value="statistician">น.ส.มยุรา (เวชสถิติ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">ข้อความที่จะส่ง</label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSending}
                className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {isSending ? (
                  <span>กำลังส่งข้อความผ่านเครือข่าย...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>กดส่งแจ้งเตือนทันที</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Smartphone Simulator Preview */}
          <div className="bg-slate-900 p-4 rounded-3xl border-4 border-slate-700 shadow-xl max-w-xs mx-auto text-white">
            <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 pb-2 border-b border-slate-800">
              <span>09:41</span>
              <span>SKB-ALERT · 5G</span>
              <span>100%</span>
            </div>

            <div className="p-3 my-3 bg-slate-800/90 rounded-2xl border border-slate-700/60 shadow-inner">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  SK
                </span>
                <span className="font-semibold text-xs text-emerald-400">
                  รพ.สังขละบุรี (SKB-SMS)
                </span>
                <span className="text-[10px] text-slate-400 ml-auto">ตอนนี้</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                {testMessage}
              </p>
            </div>

            <div className="text-center text-[10px] text-slate-500">
              จำลองการแจ้งเตือนบนสมาร์ตโฟนผู้บริหาร
            </div>
          </div>
        </div>
      </div>

      {/* Notification Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              ประวัติการส่งข้อความแจ้งเตือน (Notification Logs)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              บันทึกการส่ง SMS และ Email พร้อมสถานะส่งถึงแล้ว (Delivered)
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {logs.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">วัน-เวลา</th>
                <th className="py-3 px-4">ช่องทาง</th>
                <th className="py-3 px-4">ผู้รับ</th>
                <th className="py-3 px-4">เบอร์/อีเมลปลายทาง</th>
                <th className="py-3 px-4">ข้อความสรุป</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.channel === 'SMS'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {item.channel === 'SMS' ? <Smartphone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                      {item.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                    {item.recipientName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {item.targetAddress}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-sm truncate">
                    {item.message}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.status}
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

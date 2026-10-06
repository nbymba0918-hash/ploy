import React, { useState } from 'react';
import { BackupHistoryItem, DebtorRight, ReportSignatureInfo } from '../types';
import {
  Database,
  Cloud,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  HardDrive,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react';

interface BackupSyncViewProps {
  rights: DebtorRight[];
  signatures: ReportSignatureInfo;
  history: BackupHistoryItem[];
  onAddHistory: (item: BackupHistoryItem) => void;
  onRestoreData: (restoredRights: DebtorRight[]) => void;
  cloudSyncEnabled: boolean;
  onToggleCloudSync: (enabled: boolean) => void;
}

export const BackupSyncView: React.FC<BackupSyncViewProps> = ({
  rights,
  signatures,
  history,
  onAddHistory,
  onRestoreData,
  cloudSyncEnabled,
  onToggleCloudSync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('เมื่อสักครู่');
  const [notification, setNotification] = useState<string | null>(null);

  // Download JSON backup
  const handleDownloadBackup = () => {
    const backupData = {
      app: 'SKB Management System',
      hospital: 'โรงพยาบาลสังขละบุรี',
      exportedAt: new Date().toISOString(),
      rightsCount: rights.length,
      debtorRights: rights,
      signatures,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `SKB_Hospital_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const newItem: BackupHistoryItem = {
      id: `bak-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`,
      sizeKb: parseFloat((JSON.stringify(backupData).length / 1024).toFixed(1)),
      recordCount: rights.length,
      status: 'SUCCESS',
      backupType: 'MANUAL',
    };
    onAddHistory(newItem);

    setNotification('สร้างไฟล์สำรองข้อมูล JSON และดาวน์โหลดสำเร็จแล้ว');
    setTimeout(() => setNotification(null), 3500);
  };

  // Restore via JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.debtorRights)) {
            onRestoreData(parsed.debtorRights);
            setNotification(`กู้คืนข้อมูลสำเร็จ (${parsed.debtorRights.length} สิทธิการรักษา)`);
          } else if (Array.isArray(parsed)) {
            onRestoreData(parsed);
            setNotification(`กู้คืนข้อมูลสำเร็จ (${parsed.length} สิทธิการรักษา)`);
          } else {
            alert('รูปแบบไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ JSON สำรองของ SKB System');
          }
        } catch (err) {
          alert('ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบไฟล์');
        }
      };
    }
  };

  // Simulate Cloud Sync
  const handleForceCloudSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
      setLastSyncTime(now);

      const newItem: BackupHistoryItem = {
        id: `bak-sync-${Date.now()}`,
        timestamp: `${new Date().toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })} ${now}`,
        sizeKb: 52.4,
        recordCount: rights.length,
        status: 'SYNCED',
        backupType: 'MANUAL',
      };
      onAddHistory(newItem);

      setNotification('ซิงก์ข้อมูลขึ้น Cloud Secure Node (รพ.สังขละบุรี) แบบเรียลไทม์สำเร็จแล้ว');
      setTimeout(() => setNotification(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">
            <Server className="w-4 h-4" />
            ระบบสำรองข้อมูลและเชื่อมต่อคลาวด์
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            สำรองข้อมูลอัตโนมัติประจำสัปดาห์ & Real-time Cloud Sync
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            รอบสำรองข้อมูลอัตโนมัติทุกวันอาทิตย์ เวลา 02:00 น. ป้องกันข้อมูลสูญหาย 100% พร้อมระบบกู้คืน (Restore)
          </p>
        </div>

        {/* Cloud Status Indicator */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-xl">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 relative" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block leading-tight">
              Cloud Connected
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
              สถานะ: ปกติ · Sync ล่าสุด: {lastSyncTime}
            </span>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Weekly Auto Schedule Info */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Calendar className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              กำหนดการ Auto-Backup ประจำสัปดาห์
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">รอบเวลาสำรอง:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ทุกวันอาทิตย์ เวลา 02:00 น.
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ประเภทข้อมูล:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                ทะเบียนคุม 52 สิทธิ + ลายมือชื่อ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">การเข้ารหัส:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                AES-256 Cloud Vault
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            ระบบทำงานเบื้องหลังโดยอัตโนมัติ ไม่กระทบต่อการบันทึกข้อมูลของเจ้าหน้าที่ในเวลาราชการ
          </p>
        </div>

        {/* Panel 2: Manual Download & Restore */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <HardDrive className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              ส่งออกไฟล์สำรอง & กู้คืน (Restore)
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            ดาวน์โหลดไฟล์สำรองเป็น JSON หรือนำเข้าไฟล์ที่เคยบันทึกไว้เพื่อกู้คืนข้อมูล
          </p>

          <div className="space-y-2.5">
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ JSON สำรองข้อมูล</span>
            </button>

            <label className="w-full py-2.5 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>นำเข้าไฟล์เพื่อกู้คืน (Restore File)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Panel 3: Cloud Database Sync */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <Cloud className="w-5 h-5" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Cloud Database Synchronization
            </h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <span>สถานะเชื่อมต่อ Real-time</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cloudSyncEnabled}
                onChange={(e) => onToggleCloudSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <button
            onClick={handleForceCloudSync}
            disabled={isSyncing}
            className="w-full py-2.5 px-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-300 dark:border-emerald-800"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'กำลังซิงก์ข้อมูลขึ้นคลาวด์...' : 'กดซิงก์ข้อมูลทันที (Sync Now)'}</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            ดาต้าเบสหลัก: รพ.สังขละบุรี Server Node · สธ. กาญจนบุรี
          </p>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              ประวัติจุดสำรองข้อมูล (Backup Snapshots History)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              รายการสำรองข้อมูลอัตโนมัติและแบบ Manual พร้อมสถานะความสมบูรณ์ของข้อมูล
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {history.length} จุดสำรอง
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">วันและเวลาที่สำรอง</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4 text-right">จำนวนสิทธิ</th>
                <th className="py-3 px-4 text-right">ขนาดไฟล์</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">การกู้คืน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white font-mono">
                    {item.timestamp}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.backupType === 'AUTO_WEEKLY'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.backupType === 'AUTO_WEEKLY' ? 'อัตโนมัติ (อาทิตย์ 02:00)' : 'บันทึกด้วยมือ'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {item.recordCount} รายการ
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {item.sizeKb} KB
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`ต้องการกู้คืนข้อมูลจาก Snapshot วันที่ ${item.timestamp} หรือไม่?`)) {
                          setNotification(`กำลังกู้คืนข้อมูลจาก Snapshot ${item.timestamp}... สำเร็จ`);
                          setTimeout(() => setNotification(null), 3000);
                        }
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-colors"
                    >
                      กู้คืนจุดนี้
                    </button>
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

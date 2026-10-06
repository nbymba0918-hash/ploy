import React, { useState } from 'react';
import { DebtorRight, AppUser, MonthlyLedgerArchive, NotificationLog } from '../types';
import {
  Search,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  Edit3,
  RotateCcw,
  Plus,
  CheckCircle,
  Building2,
  Users,
  ShieldAlert,
  Calendar,
  Save,
  Clock,
  ChevronDown,
  Check,
  X,
  History,
  Archive,
  Send,
  Lock,
} from 'lucide-react';

interface DebtorsLedgerViewProps {
  rights: DebtorRight[];
  onOpenEdit: (debtor: DebtorRight) => void;
  onExportExcel: () => void;
  onResetData: () => void;
  initialFilterOverdue?: boolean;
  initialCategory?: 'gov' | 'external' | 'all';
  currentUser: AppUser;
  monthlyArchives: MonthlyLedgerArchive[];
  onSaveMonthlyArchive: (archive: MonthlyLedgerArchive) => void;
  onLoadArchive: (archive: MonthlyLedgerArchive) => void;
  currentPeriodMonth: string;
  currentPeriodYear: string;
  currentAccountingDate: string;
  onChangePeriod: (month: string, year: string, date: string) => void;
  onAddNotifLog: (log: NotificationLog) => void;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const DebtorsLedgerView: React.FC<DebtorsLedgerViewProps> = ({
  rights,
  onOpenEdit,
  onExportExcel,
  onResetData,
  initialFilterOverdue = false,
  initialCategory = 'all',
  currentUser,
  monthlyArchives,
  onSaveMonthlyArchive,
  onLoadArchive,
  currentPeriodMonth,
  currentPeriodYear,
  currentAccountingDate,
  onChangePeriod,
  onAddNotifLog,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'gov' | 'external' | 'overdue'>(
    initialFilterOverdue ? 'overdue' : initialCategory === 'gov' ? 'gov' : initialCategory === 'external' ? 'external' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFund, setSelectedFund] = useState<string>('all');

  // Modals state
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSaveArchiveModal, setShowSaveArchiveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Calendar picker state
  const [tempMonth, setTempMonth] = useState(currentPeriodMonth);
  const [tempYear, setTempYear] = useState(currentPeriodYear);
  const [tempDay, setTempDay] = useState(currentAccountingDate.split(' ')[0] || '31');

  // Monthly archive confirmation form
  const [archiveNotes, setArchiveNotes] = useState(`บันทึกสรุปยอดปิดงบ 52 สิทธิ รพ.สังขละบุรี ประจำเดือน${currentPeriodMonth} ${currentPeriodYear}`);
  const [notifyDirector, setNotifyDirector] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if current month is already saved in archives
  const currentArchive = monthlyArchives.find(
    (a) => a.periodMonth === currentPeriodMonth && a.periodYearBe === currentPeriodYear
  );

  // Filtered dataset
  const filteredRights = rights.filter((r) => {
    if (activeTab === 'gov' && r.category !== 'gov') return false;
    if (activeTab === 'external' && r.category !== 'external') return false;
    if (activeTab === 'overdue' && (r.daysOverdue <= 30 || r.carriedForward <= 0)) return false;

    if (selectedFund !== 'all' && r.fundGroup !== selectedFund) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.remarks?.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Overall Totals
  const totalBroughtForward = rights.reduce((s, r) => s + r.broughtForward, 0);
  const totalNewAmount = rights.reduce((s, r) => s + r.newAmount, 0);
  const totalPaidAmount = rights.reduce((s, r) => s + r.paidAmount, 0);
  const totalBadDebtAmount = rights.reduce((s, r) => s + r.badDebtAmount, 0);
  const totalCarriedForward = rights.reduce((s, r) => s + r.carriedForward, 0);
  const totalBilling = totalBroughtForward + totalNewAmount;
  const collectionRate = totalBilling > 0 ? (totalPaidAmount / totalBilling) * 100 : 0;

  // Subtotals for current filtered view
  const subtotalBrought = filteredRights.reduce((s, r) => s + r.broughtForward, 0);
  const subtotalNew = filteredRights.reduce((s, r) => s + r.newAmount, 0);
  const subtotalPaid = filteredRights.reduce((s, r) => s + r.paidAmount, 0);
  const subtotalBadDebt = filteredRights.reduce((s, r) => s + r.badDebtAmount, 0);
  const subtotalCarried = filteredRights.reduce((s, r) => s + r.carriedForward, 0);

  // Overall counts
  const overdueCount = rights.filter((r) => r.daysOverdue > 30 && r.carriedForward > 0).length;
  const govCount = rights.filter((r) => r.category === 'gov').length;
  const extCount = rights.filter((r) => r.category === 'external').length;

  // Handle Save Monthly Archive
  const handleConfirmMonthlyArchive = (e: React.FormEvent) => {
    e.preventDefault();

    const newArchive: MonthlyLedgerArchive = {
      id: `archive-${currentPeriodYear}-${currentPeriodMonth}`,
      periodMonth: currentPeriodMonth,
      periodYearBe: currentPeriodYear,
      accountingDate: currentAccountingDate,
      savedAt: `${new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`,
      savedBy: currentUser.name,
      savedByRole: currentUser.roleTitle,
      rights: [...rights],
      totalBroughtForward,
      totalNewAmount,
      totalPaidAmount,
      totalBadDebtAmount,
      totalCarriedForward,
      collectionRate,
      remarks: archiveNotes,
      status: 'SAVED',
    };

    onSaveMonthlyArchive(newArchive);
    setShowSaveArchiveModal(false);

    // If auto notification is enabled, send SMS & Email logs
    if (notifyDirector) {
      const nowStr = `${new Date().toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;

      onAddNotifLog({
        id: `notif-sms-${Date.now()}`,
        timestamp: nowStr,
        channel: 'SMS',
        recipientName: 'นายแพทย์จิรวัฒน์ วงษ์สวัสดิ์ (รักษาการ ผอ.รพ.)',
        targetAddress: '081-894-4321',
        title: `แจ้งเตือนจัดเก็บงบประจำเดือน ${currentPeriodMonth} ${currentPeriodYear}`,
        message: `รพ.สังขละบุรี: บันทึกจัดเก็บทะเบียนคุม 52 สิทธิ ประจำเดือน ${currentPeriodMonth} ${currentPeriodYear} เรียบร้อยแล้ว ยกไปคงเหลือสุทธิ ${totalCarriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท`,
        status: 'DELIVERED',
      });

      onAddNotifLog({
        id: `notif-email-${Date.now()}`,
        timestamp: nowStr,
        channel: 'EMAIL',
        recipientName: 'นายแพทย์จิรวัฒน์ วงษ์สวัสดิ์',
        targetAddress: 'director.skb@moph.mail.go.th',
        title: `รายงานสรุปการจัดเก็บข้อมูลลูกหนี้ 52 สิทธิ ประจำเดือน ${currentPeriodMonth} ${currentPeriodYear}`,
        message: `เรียน ผู้อำนวยการ เจ้าหน้าที่ได้ทำการบันทึกจัดเก็บข้อมูลทะเบียนคุมลูกหนี้ 52 สิทธิ ประจำเดือน ${currentPeriodMonth} ${currentPeriodYear} เข้าสู่คลังข้อมูลทางการแพทย์แล้ว`,
        status: 'DELIVERED',
      });
    }

    setToastMessage(`บันทึกจัดเก็บข้อมูลบัญชีลูกหนี้ประจำเดือน ${currentPeriodMonth} ${currentPeriodYear} สำเร็จเรียบร้อย`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Apply Calendar Period
  const handleApplyCalendarPeriod = () => {
    const formattedDate = `${tempDay} ${tempMonth} ${tempYear}`;
    onChangePeriod(tempMonth, tempYear, formattedDate);
    setShowCalendarModal(false);

    // Check if there is an archive for that month
    const match = monthlyArchives.find(
      (a) => a.periodMonth === tempMonth && a.periodYearBe === tempYear
    );
    if (match) {
      onLoadArchive(match);
      setToastMessage(`โหลดข้อมูลที่บันทึกจัดเก็บไว้ของเดือน ${tempMonth} ${tempYear}`);
    } else {
      setToastMessage(`เลือกงวดบัญชี: ${tempMonth} ${tempYear} (ณ วันที่ ${formattedDate})`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-lg flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Action & Accounting Period Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Row 1: Calendar Period Selector & Save Monthly Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Left: Calendar & Accounting Date Display */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Calendar Button */}
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-2xs group"
              title="กดเพื่อเลือกงวดบัญชีลูกหนี้ หรือเลือกวันที่ในปฏิทิน"
            >
              <div className="p-1 rounded-md bg-emerald-600 text-white">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-normal leading-none">
                  เลือกการบันทึกบัญชี (ปฏิทิน)
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                  ประจำเดือน {currentPeriodMonth} พ.ศ. {currentPeriodYear}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Current Accounting Date Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-200/60 dark:border-emerald-800/40">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>เกณฑ์บันทึก ณ: <strong>{currentAccountingDate}</strong></span>
            </div>

            {/* Monthly Saved / Locked Status Badge */}
            {currentArchive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <Check className="w-3 h-3 text-emerald-600" />
                จัดเก็บข้อมูลรายเดือนแล้ว ({currentArchive.savedAt})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                งวดเปิดบันทึก (รอจัดเก็บข้อมูล)
              </span>
            )}
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. ปุ่มบันทึกรายเดือนเพื่อจัดเก็บข้อมูล (Save Monthly Archive Button) */}
            <button
              onClick={() => setShowSaveArchiveModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกรายเดือนเพื่อจัดเก็บข้อมูล</span>
            </button>

            {/* View Monthly History Button */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
              title="ดูประวัติงวดบัญชีที่จัดเก็บไว้"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">ประวัติงวดที่จัดเก็บ ({monthlyArchives.length})</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ส่งออก Excel</span>
            </button>

            {/* Reset Data Button */}
            <button
              onClick={() => {
                if (window.confirm('ต้องการรีเซ็ตข้อมูลกลับสู่ชุดข้อมูลจริง รพ.สังขละบุรี ใช่หรือไม่?')) {
                  onResetData();
                }
              }}
              title="รีเซ็ตเป็นข้อมูลตั้งต้น รพ.สังขละบุรี"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Tab Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              52 สิทธิทั้งหมด ({rights.length})
            </button>
            <button
              onClick={() => setActiveTab('gov')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'gov'
                  ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              หมวด 1 ภาครัฐ ({govCount})
            </button>
            <button
              onClick={() => setActiveTab('external')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'external'
                  ? 'bg-white dark:bg-slate-700 text-amber-800 dark:text-amber-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              หมวด 2 ภายนอก ({extCount})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'overdue'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              หนี้ค้างเกิน 1 เดือน ({overdueCount})
            </button>
          </div>
        </div>

        {/* Search input + Fund filter dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัสบัญชี (เช่น 1102050101.202) หรือชื่อสิทธิการรักษา..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">ทุกกลุ่มกองทุนสิทธิ</option>
              <option value="UC">สิทธิหลักประกันสุขภาพ (UC)</option>
              <option value="ประกันสังคม">ประกันสังคม</option>
              <option value="ข้าราชการ กรมบัญชีกลาง">เบิกจ่ายตรงกรมบัญชีกลาง</option>
              <option value="แรงงานต่างด้าว">คนต่างด้าวและแรงงานต่างด้าว</option>
              <option value="บุคคลมีปัญหาสถานะและสิทธิ">บุคคลมีปัญหาสถานะและสิทธิ</option>
              <option value="อปท.">เบิกจ่ายตรง อปท.</option>
              <option value="พรบ.รถ">พรบ.รถ</option>
              <option value="เบิกต้นสังกัด">เบิกต้นสังกัด / รัฐวิสาหกิจ</option>
              <option value="ชำระเงินเอง">ชำระเงินเอง OP / IP</option>
              <option value="บริการอื่น/ส่งตรวจ">สิ่งส่งตรวจ / ฉุกเฉิน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subtotal Banner for current active view */}
      <div className="bg-emerald-900/5 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold text-emerald-900 dark:text-emerald-300">
            งวดบัญชี {currentPeriodMonth} {currentPeriodYear}:
          </span>{' '}
          <span className="text-slate-600 dark:text-slate-400 font-mono">
            แสดง {filteredRights.length} รายการ
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-700 dark:text-slate-300 font-mono">
          <div>
            <span className="text-[11px] text-slate-500 block">ยกมา:</span>
            <span className="font-semibold">
              {subtotalBrought.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">ตั้งใหม่:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              +{subtotalNew.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">รับชำระ:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              -{subtotalPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {subtotalBadDebt > 0 && (
            <div>
              <span className="text-[11px] text-slate-500 block">หนี้สูญ:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                -{subtotalBadDebt.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="border-l border-emerald-300 dark:border-emerald-700 pl-4">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block">
              คงเหลือยกไปสุทธิ:
            </span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {subtotalCarried.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
            </span>
          </div>
        </div>
      </div>

      {/* Main 52 Rights Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                <th className="py-3 px-3 w-36">รหัสบัญชี</th>
                <th className="py-3 px-3">รายการสิทธิการรักษาพยาบาล</th>
                <th className="py-3 px-3 text-right">ยอดลูกหนี้ยกมา</th>
                <th className="py-3 px-3 text-right">ยอดลูกหนี้ของเดือน</th>
                <th className="py-3 px-3 text-right">ยอดรับชำระ</th>
                <th className="py-3 px-3 text-right">ตัดหนี้สูญ</th>
                <th className="py-3 px-3 text-right bg-emerald-50/50 dark:bg-emerald-950/20 font-bold">
                  ยอดลูกหนี้ยกไป
                </th>
                <th className="py-3 px-2 text-center w-20">ค้างชำระ</th>
                <th className="py-3 px-3">หมายเหตุ</th>
                <th className="py-3 px-2 text-center w-16">แก้ไข</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
              {filteredRights.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    ไม่พบรายการสิทธิที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredRights.map((row) => {
                  const isOverdue = row.daysOverdue > 30 && row.carriedForward > 0;
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isOverdue ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {row.id}
                      </td>

                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <span className="text-slate-400">110205010{row.category === 'gov' ? '1' : '2'}</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          .{row.code.split('.')[1]}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100 leading-tight">
                          {row.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{row.fundGroup}</span>
                          <span>·</span>
                          <span>{row.category === 'gov' ? 'หน่วยงานภาครัฐ' : 'บุคคลภายนอก'}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {row.broughtForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                        {row.newAmount > 0
                          ? row.newAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                          : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {row.paidAmount > 0
                          ? row.paidAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                          : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {row.badDebtAmount > 0
                          ? row.badDebtAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                          : '-'}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-white whitespace-nowrap">
                        {row.carriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        {isOverdue ? (
                          <span
                            title="ค้างเกิน 30 วัน"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono"
                          >
                            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                            {row.daysOverdue}ว.
                          </span>
                        ) : row.daysOverdue > 0 ? (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {row.daysOverdue}ว.
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate text-[11px]">
                        {row.remarks || '-'}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => onOpenEdit(row)}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                          title="แก้ไข / บันทึกรับชำระ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CALENDAR & ACCOUNTING PERIOD SELECTOR */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    ปฏิทินเลือกการบันทึกบัญชีลูกหนี้
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    กำหนดงวดเดือน ปีงบประมาณ และวันที่บันทึกยอดลูกหนี้ 52 สิทธิ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Year and Month Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    ปี พ.ศ. (ปีงบประมาณ)
                  </label>
                  <select
                    value={tempYear}
                    onChange={(e) => setTempYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  >
                    <option value="2568">2568</option>
                    <option value="2569">2569 (ปีงบประมาณปัจจุบัน)</option>
                    <option value="2570">2570</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    วันที่ ณ สิ้นงวด
                  </label>
                  <select
                    value={tempDay}
                    onChange={(e) => setTempDay(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  >
                    <option value="31">31 (สิ้นเดือน)</option>
                    <option value="30">30 (สิ้นเดือน)</option>
                    <option value="28">28 (กุมภาพันธ์)</option>
                    <option value="15">15 (กลางเดือน)</option>
                  </select>
                </div>
              </div>

              {/* Month Grid Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  เลือกเดือนรอบบัญชี:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {THAI_MONTHS.map((m) => {
                    const isSelected = tempMonth === m;
                    const isArchived = monthlyArchives.some(
                      (a) => a.periodMonth === m && a.periodYearBe === tempYear
                    );

                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTempMonth(m)}
                        className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all relative ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div>{m}</div>
                        {isArchived && (
                          <span
                            className={`text-[9px] block mt-0.5 ${
                              isSelected ? 'text-emerald-200' : 'text-emerald-600 dark:text-emerald-400 font-bold'
                            }`}
                          >
                            ● มีข้อมูลจัดเก็บ
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Period Preview Box */}
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">งวดบัญชีที่จะนำมาแสดง:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {tempDay} {tempMonth} พ.ศ. {tempYear}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                    {monthlyArchives.some((a) => a.periodMonth === tempMonth && a.periodYearBe === tempYear)
                      ? '✓ มีข้อมูลประวัติที่จัดเก็บไว้'
                      : '○ งวดใหม่ (เปิดบันทึก)'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCalendarModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleApplyCalendarPeriod}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  เลือกงวดบัญชีนี้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM SAVE MONTHLY ARCHIVE */}
      {showSaveArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    บันทึกจัดเก็บข้อมูลลูกหนี้รายเดือน (Monthly Ledger Archive)
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    ยืนยันการจัดเก็บตัวเลขงวดประจำเดือน {currentPeriodMonth} {currentPeriodYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSaveArchiveModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMonthlyArchive} className="p-6 space-y-4">
              {/* Summary Metrics Snapshot */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>งวดบัญชีที่บันทึก:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ประจำเดือน {currentPeriodMonth} พ.ศ. {currentPeriodYear} ({currentAccountingDate})
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>ผู้บันทึกจัดเก็บ:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {currentUser.name} ({currentUser.roleTitle.split(' ')[0]})
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-slate-400 block">1. ยอดลูกหนี้ยกมา:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {totalBroughtForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">2. ยอดตั้งใหม่ของเดือน:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      +{totalNewAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">3. ยอดรับชำระระหว่างเดือน:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      -{totalPaidAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">4. ยอดตัดหนี้สูญ:</span>
                    <span className="font-semibold text-slate-600">
                      -{totalBadDebtAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ยอดลูกหนี้ยกไปคงเหลือสุทธิ (52 สิทธิ):
                  </span>
                  <span className="font-mono font-bold text-base text-emerald-700 dark:text-emerald-400">
                    {totalCarriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
                  </span>
                </div>
              </div>

              {/* Archive Remarks Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  หมายเหตุประกอบการจัดเก็บงวดบัญชี
                </label>
                <textarea
                  rows={2}
                  value={archiveNotes}
                  onChange={(e) => setArchiveNotes(e.target.value)}
                  placeholder="เช่น ปิดสรุปยอดลูกหนี้ 52 สิทธิ ประจำเดือนเรียบร้อย พร้อมรายงานเสนอผู้บริหาร"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              {/* Notification Checkbox */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    ส่งแจ้งเตือน SMS และ Email สรุปยอดไปยังผู้อำนวยการ รพ. ทันที
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDirector}
                  onChange={(e) => setNotifyDirector(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSaveArchiveModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>ยืนยันจัดเก็บข้อมูลรายเดือน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW MONTHLY ARCHIVE HISTORY */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ประวัติข้อมูลลูกหนี้ที่จัดเก็บรายเดือน (Archived Ledgers)
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              {monthlyArchives.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  ยังไม่มีประวัติการบันทึกจัดเก็บรายเดือน
                </div>
              ) : (
                monthlyArchives.map((arc) => (
                  <div
                    key={arc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          ประจำเดือน {arc.periodMonth} พ.ศ. {arc.periodYearBe}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {arc.accountingDate}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1">
                        บันทึกเมื่อ: {arc.savedAt} โดย {arc.savedBy}
                      </div>
                      <div className="font-mono text-slate-700 dark:text-slate-300 mt-1">
                        ยกไปคงเหลือ: <strong className="text-emerald-700 dark:text-emerald-400">{arc.totalCarriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.</strong> · จัดเก็บได้ {arc.collectionRate.toFixed(1)}%
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onLoadArchive(arc);
                        onChangePeriod(arc.periodMonth, arc.periodYearBe, arc.accountingDate);
                        setShowHistoryModal(false);
                        setToastMessage(`เรียกดูข้อมูลงวด ${arc.periodMonth} ${arc.periodYearBe} สำเร็จ`);
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg self-start sm:self-auto shrink-0 transition-colors"
                    >
                      เปิดดูงวดนี้
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

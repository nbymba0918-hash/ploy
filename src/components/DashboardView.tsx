import React from 'react';
import { DebtorRight } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  FileSpreadsheet,
  Coins,
  Receipt,
  FileX,
  CreditCard,
  ChevronRight,
  GitCompare,
} from 'lucide-react';

interface DashboardViewProps {
  rights: DebtorRight[];
  onNavigateToLedger: (filterOverdue?: boolean, category?: 'gov' | 'external' | 'all') => void;
  onNavigateToReport: () => void;
  onExportExcel: () => void;
  onOpenEdit: (debtor: DebtorRight) => void;
  onNavigateToReconciliation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  rights,
  onNavigateToLedger,
  onNavigateToReport,
  onExportExcel,
  onOpenEdit,
  onNavigateToReconciliation,
}) => {
  // Calculations
  const totalBroughtForward = rights.reduce((s, r) => s + r.broughtForward, 0);
  const totalNewAmount = rights.reduce((s, r) => s + r.newAmount, 0);
  const totalPaidAmount = rights.reduce((s, r) => s + r.paidAmount, 0);
  const totalBadDebtAmount = rights.reduce((s, r) => s + r.badDebtAmount, 0);
  const totalCarriedForward = rights.reduce((s, r) => s + r.carriedForward, 0);

  const totalBilling = totalBroughtForward + totalNewAmount;
  const collectionRate = totalBilling > 0 ? (totalPaidAmount / totalBilling) * 100 : 0;

  // Breakdown Gov vs External
  const govRights = rights.filter((r) => r.category === 'gov');
  const extRights = rights.filter((r) => r.category === 'external');

  const govCarried = govRights.reduce((s, r) => s + r.carriedForward, 0);
  const extCarried = extRights.reduce((s, r) => s + r.carriedForward, 0);

  const govPaid = govRights.reduce((s, r) => s + r.paidAmount, 0);
  const extPaid = extRights.reduce((s, r) => s + r.paidAmount, 0);

  const govPercentage = totalCarriedForward > 0 ? (govCarried / totalCarriedForward) * 100 : 0;
  const extPercentage = totalCarriedForward > 0 ? (extCarried / totalCarriedForward) * 100 : 0;

  // Overdue > 30 Days (1 Month)
  const overdueRights = rights.filter((r) => r.daysOverdue > 30 && r.carriedForward > 0);
  const overdueTotalAmount = overdueRights.reduce((s, r) => s + r.carriedForward, 0);

  // Group by Fund Groups
  const fundGroups = [
    { name: 'สิทธิหลักประกันสุขภาพ (UC)', group: 'UC', color: 'bg-emerald-500' },
    { name: 'สิทธิข้าราชการ/เบิกตรงกรมบัญชีกลาง', group: 'ข้าราชการ กรมบัญชีกลาง', color: 'bg-blue-500' },
    { name: 'สิทธิบุคคลมีปัญหาสถานะและสิทธิ', group: 'บุคคลมีปัญหาสถานะและสิทธิ', color: 'bg-amber-500' },
    { name: 'คนต่างด้าวและแรงงานต่างด้าว', group: 'แรงงานต่างด้าว', color: 'bg-indigo-500' },
    { name: 'ผู้ป่วยชำระเงินเอง (OP/IP)', group: 'ชำระเงินเอง', color: 'bg-rose-500' },
    { name: 'ประกันสังคม (OP/IP/กองทุนทดแทน)', group: 'ประกันสังคม', color: 'bg-purple-500' },
    { name: 'เบิกจ่ายตรง อปท.', group: 'อปท.', color: 'bg-teal-500' },
    { name: 'พรบ.คุ้มครองผู้ประสบภัยจากรถ', group: 'พรบ.รถ', color: 'bg-orange-500' },
    { name: 'เบิกต้นสังกัด/อื่นๆ', group: 'เบิกต้นสังกัด', color: 'bg-slate-500' },
  ];

  const fundData = fundGroups.map((fg) => {
    const items = rights.filter((r) => r.fundGroup === fg.group);
    const amount = items.reduce((s, r) => s + r.carriedForward, 0);
    const share = totalCarriedForward > 0 ? (amount / totalCarriedForward) * 100 : 0;
    return {
      ...fg,
      count: items.length,
      amount,
      share,
    };
  }).sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Top Banner / Month Period */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ข้อมูลรอบบัญชีสิงหาคม 2569 · โรงพยาบาลสังขละบุรี
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            แดชบอร์ดภาพรวมสถานะทะเบียนคุมลูกหนี้ 52 สิทธิ
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
            ระบบติดตามการเรียกเก็บ ยอดรับชำระ และบริหารหนี้ค้างชำระตามแบบฟอร์มทางการ รพ.สังขละบุรี
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToReconciliation}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xs transition-colors border border-white/15"
          >
            <GitCompare className="w-4 h-4 text-emerald-300" />
            นำเข้าข้อมูลเปรียบเทียบ
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-xs transition-colors border border-white/15"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            ส่งออก Excel (.xlsx)
          </button>
          <button
            onClick={onNavigateToReport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-sm"
          >
            <Receipt className="w-4 h-4" />
            พิมพ์รายงานเสนอ ผอ.
          </button>
        </div>
      </div>

      {/* Flashing Urgent Alarm Callout (if overdue > 30 days exist) */}
      {overdueRights.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-400/80 dark:border-rose-700/80 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {/* Flashing Red Beacon */}
              <div className="relative mt-0.5">
                <span className="animate-urgent-flash flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/50">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200">
                    URGENT ALERT · หนี้ค้างชำระเกินกำหนด &gt; 30 วัน
                  </span>
                  <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                    ({overdueRights.length} สิทธิการรักษา)
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-rose-950 dark:text-rose-100 mt-1">
                  แจ้งเตือนลูกหนี้ค้างชำระเกิน 1 เดือน ยอดรวม{' '}
                  <span className="font-mono text-rose-700 dark:text-rose-400 underline decoration-rose-300">
                    {overdueTotalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>{' '}
                  บาท
                </h3>
                <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
                  จำเป็นต้องเร่งติดตาม e-Claim ส่วนกลาง, ส่งหนังสือทวงถามสิทธิชำระเงินเอง, หรือพิจารณาตั้งเรื่องจำหน่ายหนี้สูญตามระเบียบ
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateToLedger(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap"
            >
              <span>กรองดูรายการเร่งด่วนทันที ({overdueRights.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Brought Forward (ยกมา) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>1. ยอดลูกหนี้ยกมา</span>
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalBroughtForward.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            ยกมา ณ 31 ก.ค. 2569
          </p>
        </div>

        {/* 2. New Amount (ยอดตั้งใหม่) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>2. ยอดลูกหนี้ของเดือน</span>
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {totalNewAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            ยอดตั้งหนี้ใหม่ ส.ค. 2569
          </p>
        </div>

        {/* 3. Paid Amount (ยอดรับชำระ) + Collection Rate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>3. ยอดรับชำระระหว่างเดือน</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {totalPaidAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {collectionRate.toFixed(1)}% จัดเก็บ
            </span>
          </div>
        </div>

        {/* 4. Bad Debt (ตัดหนี้สูญ) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>4. ยอดตัดหนี้สูญ</span>
            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <FileX className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-300">
              {totalBadDebtAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            อนุมัติตัดจำหน่ายหนี้สูญ
          </p>
        </div>

        {/* 5. Carried Forward (คงเหลือยกไป) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-emerald-500/40 dark:border-emerald-500/40 shadow-xs bg-emerald-50/10 dark:bg-emerald-950/10">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 text-xs font-semibold">
            <span>5. ยอดลูกหนี้ยกไปสุทธิ</span>
            <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {totalCarriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
            ณ 31 ส.ค. 2569 (52 สิทธิ)
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid: Category Comparison & Fund Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Comparison: หมวด 1 ภาครัฐ vs หมวด 2 บุคคลภายนอก */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                เปรียบเทียบสัดส่วน 2 หมวดลูกหนี้
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ภาครัฐ (รหัส 1102050101) vs บุคคลภายนอก (รหัส 1102050102)
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              52 สิทธิรวม
            </span>
          </div>

          {/* Dual Progress Stack Bar */}
          <div className="space-y-1.5">
            <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
              <div
                className="bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center transition-all duration-500"
                style={{ width: `${govPercentage}%` }}
                title={`ภาครัฐ: ${govPercentage.toFixed(1)}%`}
              >
                {govPercentage > 15 ? `${govPercentage.toFixed(1)}%` : ''}
              </div>
              <div
                className="bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center transition-all duration-500"
                style={{ width: `${extPercentage}%` }}
                title={`บุคคลภายนอก: ${extPercentage.toFixed(1)}%`}
              >
                {extPercentage > 15 ? `${extPercentage.toFixed(1)}%` : ''}
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                หมวด 1: หน่วยงานภาครัฐ ({govPercentage.toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                หมวด 2: บุคคลภายนอก ({extPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Cards for each category */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Gov card */}
            <div
              onClick={() => onNavigateToLedger(false, 'gov')}
              className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer hover:border-emerald-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  หมวด 1 ภาครัฐ (33 รายการ)
                </span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-2">
                {govCarried.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>รับชำระเดือนนี้:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {govPaid.toLocaleString('th-TH')}
                </span>
              </div>
            </div>

            {/* External card */}
            <div
              onClick={() => onNavigateToLedger(false, 'external')}
              className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  หมวด 2 ภายนอก (19 รายการ)
                </span>
                <Users className="w-4 h-4 text-amber-600" />
              </div>
              <div className="font-mono text-base font-bold text-slate-900 dark:text-white mt-2">
                {extCarried.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                <span>รับชำระเดือนนี้:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {extPaid.toLocaleString('th-TH')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-200/60 dark:border-slate-800">
            💡 <strong>ข้อสังเกต:</strong> ลูกหนี้หมวด 2 มีสัดส่วนผู้ป่วยชำระเงินเอง OP/IP และ UC นอกสังกัด สธ. ที่รอการประมวลผลสูง จึงมียอดคงเหลือกว่า 5.72 ล้านบาท
          </div>
        </div>

        {/* Breakdown by Fund / Right Groups */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                สัดส่วนลูกหนี้คงเหลือยกไปแยกตามกองทุนสิทธิ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                วิเคราะห์แยกตามประเภทกองทุนหลัก 9 กลุ่ม
              </p>
            </div>
            <button
              onClick={() => onNavigateToLedger()}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              ดูทั้งหมด 52 สิทธิ <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bar List */}
          <div className="space-y-3 pt-1">
            {fundData.map((item) => (
              <div key={item.group} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    {item.name}
                    <span className="text-slate-400 text-[11px]">({item.count} สิทธิ)</span>
                  </span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">
                      {item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      ({item.share.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${Math.max(item.share, item.amount > 0 ? 1 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Urgent Debts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                รายการลูกหนี้ที่มีวันค้างชำระสูงสุด (ต้องเร่งรัดติดตาม)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                Overdue Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              แสดง 5 รายการที่มีความเสี่ยงหนี้สูญหรือค้างนานเกิน 30 วันขึ้นไป
            </p>
          </div>

          <button
            onClick={() => onNavigateToLedger(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
          >
            ดูรายงานค้างชำระทั้งหมด ({overdueRights.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">รหัสบัญชี</th>
                <th className="py-3 px-4">ชื่อสิทธิการรักษาพยาบาล</th>
                <th className="py-3 px-4">หมวด</th>
                <th className="py-3 px-4 text-right">ยอดคงเหลือยกไป</th>
                <th className="py-3 px-4 text-center">วันค้างชำระ</th>
                <th className="py-3 px-4">สถานะ / ข้อความติดตาม</th>
                <th className="py-3 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
              {overdueRights.slice(0, 5).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {row.code}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {row.category === 'gov' ? 'หมวด 1 ภาครัฐ' : 'หมวด 2 บุคคลภายนอก'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {row.carriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono">
                      {row.daysOverdue} วัน
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 italic">
                    {row.remarks || 'รอติดตามสิทธิ'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onOpenEdit(row)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md transition-colors"
                    >
                      ปรับปรุงยอด
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

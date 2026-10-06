import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { DebtorRight, AppUser } from '../types';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  Check,
  Zap,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  SlidersHorizontal,
  Download,
  FileText,
} from 'lucide-react';

interface ReconciliationViewProps {
  rights: DebtorRight[];
  onApplyReconciliation: (reconciledRights: DebtorRight[]) => void;
  currentUser: AppUser;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  rights,
  onApplyReconciliation,
  currentUser,
}) => {
  // Preset comparison sources
  const [importSource, setImportSource] = useState<'hosxp' | 'gl' | 'eclaim' | 'custom'>('hosxp');

  // Comparison records (Key: Right ID, Value: Comparison Amount)
  const [comparisonRecords, setComparisonRecords] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    rights.forEach((r) => {
      // Create realistic preset differences from HIS (HOSxP)
      if (r.id === 7) init[r.id] = 1040000.00; // UC-IP: 8,905 diff
      else if (r.id === 14) init[r.id] = 255000.00; // SS OP Net: 4,666.59 diff
      else if (r.id === 22) init[r.id] = 1135000.00; // Comptroller OP: -3,458.20 diff
      else if (r.id === 38) init[r.id] = 890000.00; // Self pay OP: 4,483.00 diff
      else init[r.id] = r.carriedForward;
    });
    return init;
  });

  const [filterMode, setFilterMode] = useState<'all' | 'diff' | 'matched' | 'system_higher' | 'system_lower'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [customInputText, setCustomInputText] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);

  // Switch comparison presets
  const handleSelectPreset = (source: 'hosxp' | 'gl' | 'eclaim') => {
    setImportSource(source);
    const newRecords: Record<number, number> = {};
    rights.forEach((r) => {
      if (source === 'hosxp') {
        if (r.id === 7) newRecords[r.id] = 1040000.00;
        else if (r.id === 14) newRecords[r.id] = 255000.00;
        else if (r.id === 22) newRecords[r.id] = 1135000.00;
        else if (r.id === 38) newRecords[r.id] = 890000.00;
        else newRecords[r.id] = r.carriedForward;
      } else if (source === 'gl') {
        // Accounting GL Ledger discrepancies
        if (r.id === 5) newRecords[r.id] = 100000.00;
        else if (r.id === 11) newRecords[r.id] = 220000.00;
        else if (r.id === 44) newRecords[r.id] = 2130000.00;
        else newRecords[r.id] = r.carriedForward;
      } else if (source === 'eclaim') {
        // e-Claim Clearing discrepancies
        if (r.id === 6) newRecords[r.id] = 1522578.00;
        else if (r.id === 8) newRecords[r.id] = 142000.00;
        else if (r.id === 32) newRecords[r.id] = 2580000.00;
        else newRecords[r.id] = r.carriedForward;
      }
    });
    setComparisonRecords(newRecords);
    const names = {
      hosxp: 'ระบบเวชระเบียน HIS (HOSxP)',
      gl: 'ระบบบัญชีแยกประเภททั่วไป (General Ledger GL)',
      eclaim: 'ระบบประมวลผล e-Claim สปสช. ส่วนกลาง',
    };
    setSuccessToast(`โหลดข้อมูลเปรียบเทียบจาก "${names[source]}" สำเร็จ`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Compare records calculation
  const comparedList = rights.map((r) => {
    const compVal = comparisonRecords[r.id] !== undefined ? comparisonRecords[r.id] : r.carriedForward;
    const diff = Number((r.carriedForward - compVal).toFixed(2));
    const isMatched = Math.abs(diff) < 0.01;
    const variancePercent = compVal !== 0 ? ((diff / compVal) * 100) : 0;

    return {
      right: r,
      systemVal: r.carriedForward,
      comparisonVal: compVal,
      diff,
      absDiff: Math.abs(diff),
      isMatched,
      variancePercent,
      direction: diff > 0.01 ? 'higher' : diff < -0.01 ? 'lower' : 'equal',
    };
  });

  // Totals and Metrics Calculation
  const totalSystemBalance = comparedList.reduce((s, item) => s + item.systemVal, 0);
  const totalComparisonBalance = comparedList.reduce((s, item) => s + item.comparisonVal, 0);
  const netTotalDifference = totalSystemBalance - totalComparisonBalance;
  const grossAbsoluteVariance = comparedList.reduce((s, item) => s + item.absDiff, 0);

  const matchedItems = comparedList.filter((item) => item.isMatched);
  const diffItems = comparedList.filter((item) => !item.isMatched);
  const systemHigherItems = comparedList.filter((item) => item.diff > 0.01);
  const systemLowerItems = comparedList.filter((item) => item.diff < -0.01);

  const matchRate = (matchedItems.length / rights.length) * 100;
  const systemHigherAmount = systemHigherItems.reduce((s, item) => s + item.diff, 0);
  const systemLowerAmount = systemLowerItems.reduce((s, item) => s + Math.abs(item.diff), 0);

  // Filter based on selected filterMode
  const displayedItems = comparedList.filter((item) => {
    if (filterMode === 'diff') return !item.isMatched;
    if (filterMode === 'matched') return item.isMatched;
    if (filterMode === 'system_higher') return item.diff > 0.01;
    if (filterMode === 'system_lower') return item.diff < -0.01;
    return true;
  });

  // 1-Click Auto Reconcile All to Match Comparison Data
  const handleAutoReconcileAll = () => {
    const updatedRights = rights.map((r) => {
      const compVal = comparisonRecords[r.id];
      if (compVal !== undefined && Math.abs(r.carriedForward - compVal) >= 0.01) {
        const delta = Number((compVal - r.carriedForward).toFixed(2));
        return {
          ...r,
          carriedForward: compVal,
          remarks: `${r.remarks ? r.remarks + ' | ' : ''}ปรับยอดให้ตรงกับข้อมูลเปรียบเทียบ (${delta > 0 ? '+' : ''}${delta.toLocaleString('th-TH')} บ.)`,
          lastUpdated: new Date().toISOString(),
        };
      }
      return r;
    });

    onApplyReconciliation(updatedRights);
    setSuccessToast(`คำนวณและปรับยอดอัตโนมัติครบถ้วน ${diffItems.length} รายการให้ตรงกับข้อมูลเปรียบเทียบแล้ว`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Reconcile Single Item
  const handleReconcileSingle = (rightId: number, compVal: number) => {
    const updatedRights = rights.map((r) => {
      if (r.id === rightId) {
        const delta = Number((compVal - r.carriedForward).toFixed(2));
        return {
          ...r,
          carriedForward: compVal,
          remarks: `${r.remarks ? r.remarks + ' | ' : ''}ปรับยอดตรงตามข้อมูลนำเข้า (${delta > 0 ? '+' : ''}${delta.toLocaleString('th-TH')} บ.)`,
          lastUpdated: new Date().toISOString(),
        };
      }
      return r;
    });

    onApplyReconciliation(updatedRights);
    setSuccessToast(`ปรับปรุงยอดสิทธิลำดับที่ ${rightId} สำเร็จ`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Handle Excel File Upload for Comparison
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const newRecords: Record<number, number> = { ...comparisonRecords };
        let importedCount = 0;

        data.forEach((row) => {
          if (!row || row.length < 2) return;
          const firstCol = String(row[0]).trim();
          // match by right ID or right Code
          const matchById = rights.find((r) => String(r.id) === firstCol);
          const matchByCode = rights.find((r) => r.code === firstCol);
          const target = matchById || matchByCode;

          if (target) {
            // Find numeric amount in row
            for (let i = 1; i < row.length; i++) {
              const val = parseFloat(String(row[i]).replace(/,/g, ''));
              if (!isNaN(val)) {
                newRecords[target.id] = val;
                importedCount++;
                break;
              }
            }
          }
        });

        if (importedCount > 0) {
          setComparisonRecords(newRecords);
          setImportSource('custom');
          setSuccessToast(`นำเข้าและคำนวณยอดเปรียบเทียบจากไฟล์สำเร็จ (${importedCount} สิทธิ)`);
        } else {
          alert('ไม่พบข้อมูลรหัสสิทธิหรือยอดเงินที่ตรงกับ 52 สิทธิในไฟล์');
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel/CSV');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export Comparison Calculation Report to Excel
  const handleExportComparisonExcel = () => {
    const wb = XLSX.utils.book_new();

    const reportHeader = [
      ['รายงานสรุปผลการคำนวณยอดเปรียบเทียบลูกหนี้ 52 สิทธิ โรงพยาบาลสังขละบุรี'],
      [`แหล่งข้อมูลเปรียบเทียบ: ${importSource.toUpperCase()}`],
      [`วันที่คำนวณเปรียบเทียบ: ${new Date().toLocaleDateString('th-TH')}`],
      [],
      ['สรุปภาพรวมการคำนวณ:'],
      ['1. ยอดรวมในระบบ SKB ปัจจุบัน', totalSystemBalance],
      ['2. ยอดรวมข้อมูลที่นำเข้าเปรียบเทียบ', totalComparisonBalance],
      ['3. ผลต่างรวมสุทธิ (Net Difference)', netTotalDifference],
      ['4. ผลต่างรวมสัมบูรณ์ (Gross Absolute Variance)', grossAbsoluteVariance],
      ['5. อัตราความสอดคล้องตรงกัน (Match Rate)', `${matchRate.toFixed(1)}%`],
      ['6. จำนวนสิทธิที่ยอดตรงกันสมบูรณ์', matchedItems.length],
      ['7. จำนวนสิทธิที่พบผลต่าง (Discrepancy)', diffItems.length],
      [],
      [
        'ลำดับ',
        'รหัสบัญชี',
        'รายการสิทธิการรักษาพยาบาล',
        'กลุ่มกองทุน',
        'หมวด',
        'ยอดระบบ SKB (บาท)',
        'ยอดนำเข้าเปรียบเทียบ (บาท)',
        'ผลต่าง (บาท)',
        'ผลต่างสัมบูรณ์ (บาท)',
        'เปอร์เซ็นต์ผลต่าง (%)',
        'สถานะการเปรียบเทียบ',
      ],
    ];

    const rows = comparedList.map((item) => [
      item.right.id,
      item.right.code,
      item.right.name,
      item.right.fundGroup,
      item.right.category === 'gov' ? 'หน่วยงานภาครัฐ' : 'บุคคลภายนอก',
      item.systemVal,
      item.comparisonVal,
      item.diff,
      item.absDiff,
      `${item.variancePercent.toFixed(2)}%`,
      item.isMatched ? 'ยอดตรงกัน' : item.diff > 0 ? 'ระบบสูงกว่า' : 'ระบบต่ำกว่า',
    ]);

    const fullSheetData = [...reportHeader, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(fullSheetData);
    XLSX.utils.book_append_sheet(wb, ws, 'ผลการคำนวณเปรียบเทียบ');

    XLSX.writeFile(wb, `รายงานผลการคำนวณเปรียบเทียบลูกหนี้_รพ_สังขละบุรี_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">
            <GitCompare className="w-4 h-4" />
            ระบบนำเข้าข้อมูลและคำนวณยอดเปรียบเทียบ (Data Import & Reconciliation Calculator)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            นำเข้าข้อมูลเปรียบเทียบ & คำนวณผลต่างลูกหนี้ 52 สิทธิ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            เปรียบเทียบยอดคงเหลือ 52 สิทธิกับระบบภายนอก คำนวณผลต่างสุทธิ อัตราส่วนความถูกต้อง และปรับยอดได้ในคลิกเดียว
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* File Upload Button */}
          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>นำเข้าไฟล์ Excel/CSV</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Export Comparison Excel */}
          <button
            onClick={handleExportComparisonExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกผลการคำนวณ</span>
          </button>

          {/* 1-Click Auto Reconcile */}
          <button
            onClick={handleAutoReconcileAll}
            disabled={diffItems.length === 0}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
              diffItems.length > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-emerald-600 text-white opacity-75 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>ปรับยอดให้ตรงทันที ({diffItems.length})</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Preset Source Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span>เลือกแหล่งข้อมูลนำเข้าเปรียบเทียบ:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => handleSelectPreset('hosxp')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
              importSource === 'hosxp'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            1. ระบบเวชระเบียน HIS (HOSxP)
          </button>
          <button
            onClick={() => handleSelectPreset('gl')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
              importSource === 'gl'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            2. บัญชีแยกประเภท (GL Ledger)
          </button>
          <button
            onClick={() => handleSelectPreset('eclaim')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
              importSource === 'eclaim'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            3. ระบบ e-Claim สปสช.
          </button>
          {importSource === 'custom' && (
            <span className="px-3 py-1.5 font-semibold bg-emerald-600 text-white rounded-lg">
              ไฟล์นำเข้าจากภายนอก
            </span>
          )}
        </div>
      </div>

      {/* Comprehensive Calculation Metric Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Current System */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>1. ยอดรวมระบบ SKB ปัจจุบัน</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalSystemBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ยอดลูกหนี้ยกไปรวม 52 สิทธิ
          </p>
        </div>

        {/* Card 2: Total Imported Balance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>2. ยอดรวมข้อมูลนำเข้าเปรียบเทียบ</span>
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {totalComparisonBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            จากแหล่ง {importSource.toUpperCase()}
          </p>
        </div>

        {/* Card 3: Net Difference & Absolute Variance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>3. ผลต่างรวมสุทธิ (Net Difference)</span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span
              className={`font-mono text-xl sm:text-2xl font-bold tracking-tight ${
                Math.abs(netTotalDifference) < 0.01
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {netTotalDifference > 0 ? `+${netTotalDifference.toLocaleString('th-TH', { minimumFractionDigits: 2 })}` : netTotalDifference.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 ml-1">บาท</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ผลต่างสัมบูรณ์: {grossAbsoluteVariance.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
          </p>
        </div>

        {/* Card 4: Match Rate % */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>4. อัตราความตรงกัน (Match Rate)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {matchRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 ml-1">สอดคล้อง</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ตรงกัน {matchedItems.length} จาก 52 สิทธิ (ต่าง {diffItems.length} สิทธิ)
          </p>
        </div>
      </div>

      {/* Breakdown by Variance Direction & Formula Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Matched */}
        <div
          onClick={() => setFilterMode('matched')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'matched'
              ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Equal className="w-4 h-4 text-emerald-600" />
              ยอดตรงกันสมบูรณ์ (0.00 บ.)
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {matchedItems.length} สิทธิ
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ยอดลูกหนี้ยกไปในระบบและข้อมูลนำเข้าเท่ากันพอดี 100%
          </p>
        </div>

        {/* System Higher */}
        <div
          onClick={() => setFilterMode('system_higher')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'system_higher'
              ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-1 ring-amber-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-amber-600" />
              ระบบสูงกว่าข้อมูลนำเข้า (+Over)
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {systemHigherItems.length} สิทธิ
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ยอดส่วนเกินรวม: +{systemHigherAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
          </p>
        </div>

        {/* System Lower */}
        <div
          onClick={() => setFilterMode('system_lower')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            filterMode === 'system_lower'
              ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40 ring-1 ring-rose-500'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              ระบบต่ำกว่าข้อมูลนำเข้า (-Under)
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              {systemLowerItems.length} สิทธิ
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ยอดส่วนขาดรวม: -{systemLowerAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บ.
          </p>
        </div>
      </div>

      {/* Main Comparison Calculation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              แสดงทั้งหมด ({comparedList.length})
            </button>
            <button
              onClick={() => setFilterMode('diff')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterMode === 'diff'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              เฉพาะที่มีผลต่าง ({diffItems.length})
            </button>
            <button
              onClick={() => setFilterMode('matched')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all whitespace-nowrap ${
                filterMode === 'matched'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              เฉพาะยอดตรงกัน ({matchedItems.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            แสดง {displayedItems.length} จาก 52 รายการสิทธิ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 text-center w-12">ลำดับ</th>
                <th className="py-3 px-3 w-32">รหัสบัญชี</th>
                <th className="py-3 px-3">รายการสิทธิการรักษาพยาบาล</th>
                <th className="py-3 px-3 text-right">ยอดในระบบ SKB (บาท)</th>
                <th className="py-3 px-3 text-right">ยอดนำเข้าเปรียบเทียบ (บาท)</th>
                <th className="py-3 px-3 text-right">ผลต่าง (Difference)</th>
                <th className="py-3 px-3 text-right">% ส่วนต่าง</th>
                <th className="py-3 px-3 text-center">สถานะ</th>
                <th className="py-3 px-3 text-center">การปรับยอด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    ไม่พบรายการตามเงื่อนไขตัวกรอง
                  </td>
                </tr>
              ) : (
                displayedItems.map(({ right, systemVal, comparisonVal, diff, absDiff, isMatched, variancePercent }) => (
                  <tr
                    key={right.id}
                    className={`transition-colors ${
                      isMatched
                        ? 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        : diff > 0
                        ? 'bg-amber-50/30 dark:bg-amber-950/15 hover:bg-amber-50/60 dark:hover:bg-amber-950/30'
                        : 'bg-rose-50/30 dark:bg-rose-950/15 hover:bg-rose-50/60 dark:hover:bg-rose-950/30'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                      {right.id}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {right.code}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 dark:text-white leading-tight">
                        {right.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {right.fundGroup} · {right.category === 'gov' ? 'ภาครัฐ' : 'ภายนอก'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                      {systemVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {comparisonVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {isMatched ? (
                        <span className="text-emerald-600 dark:text-emerald-400">0.00</span>
                      ) : diff > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          +{diff.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">
                          {diff.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-500">
                      {isMatched ? '0.00%' : `${variancePercent.toFixed(2)}%`}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          ตรงกัน
                        </span>
                      ) : diff > 0 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          <ArrowUpRight className="w-3 h-3 text-amber-600" />
                          ระบบสูงกว่า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                          ระบบต่ำกว่า
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!isMatched ? (
                        <button
                          onClick={() => handleReconcileSingle(right.id, comparisonVal)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors shadow-2xs whitespace-nowrap"
                        >
                          ปรับให้ตรง
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer with Summary Calculation */}
            <tfoot className="bg-slate-100/90 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
              <tr>
                <td colSpan={3} className="py-3 px-3 text-center">
                  รวมทั้งสิ้น ({displayedItems.length} รายการที่แสดง)
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {displayedItems.reduce((s, i) => s + i.systemVal, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                  {displayedItems.reduce((s, i) => s + i.comparisonVal, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {displayedItems.reduce((s, i) => s + i.diff, 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={3} className="py-3 px-3 text-center text-xs text-slate-500">
                  ความตรงกันเฉลี่ย: {matchRate.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

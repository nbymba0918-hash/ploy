import React, { useState } from 'react';
import { DebtorRight, ReportSignatureInfo, AppUser } from '../types';
import { HospitalLogo } from './HospitalLogo';
import {
  Printer,
  FileSpreadsheet,
  CheckCircle,
  FileCheck,
  Calendar,
  PenTool,
  Clock,
  Download,
} from 'lucide-react';

interface OfficialReportViewProps {
  rights: DebtorRight[];
  signatures: ReportSignatureInfo;
  onUpdateSignatures: (signatures: ReportSignatureInfo) => void;
  onExportExcel: () => void;
  currentUser: AppUser;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  rights,
  signatures,
  onUpdateSignatures,
  onExportExcel,
  currentUser,
}) => {
  const [reportMonth, setReportMonth] = useState('สิงหาคม');
  const [prevMonth, setPrevMonth] = useState('กรกฎาคม');
  const [reportYear, setReportYear] = useState('2569');

  const govRights = rights.filter((r) => r.category === 'gov');
  const extRights = rights.filter((r) => r.category === 'external');

  // Gov totals
  const govBrought = govRights.reduce((s, r) => s + r.broughtForward, 0);
  const govNew = govRights.reduce((s, r) => s + r.newAmount, 0);
  const govPaid = govRights.reduce((s, r) => s + r.paidAmount, 0);
  const govCarried = govRights.reduce((s, r) => s + r.carriedForward, 0);

  // External totals
  const extBrought = extRights.reduce((s, r) => s + r.broughtForward, 0);
  const extNew = extRights.reduce((s, r) => s + r.newAmount, 0);
  const extPaid = extRights.reduce((s, r) => s + r.paidAmount, 0);
  const extCarried = extRights.reduce((s, r) => s + r.carriedForward, 0);

  // Grand totals
  const totalBrought = govBrought + extBrought;
  const totalNew = govNew + extNew;
  const totalPaid = govPaid + extPaid;
  const totalCarried = govCarried + extCarried;

  const handlePrint = () => {
    window.print();
  };

  const handleSign = (role: 'reporter' | 'checker' | 'approver') => {
    const nowStr = `${new Date().toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })} เวลา ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;

    const updated = { ...signatures };
    if (role === 'reporter') {
      updated.reporterSigned = !updated.reporterSigned;
      updated.reporterSignedDate = updated.reporterSigned ? nowStr : undefined;
    } else if (role === 'checker') {
      updated.checkerSigned = !updated.checkerSigned;
      updated.checkerSignedDate = updated.checkerSigned ? nowStr : undefined;
    } else if (role === 'approver') {
      updated.approverSigned = !updated.approverSigned;
      updated.approverSignedDate = updated.approverSigned ? nowStr : undefined;
    }
    onUpdateSignatures(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="no-print bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            รายงานสรุปการเรียกเก็บลูกหนี้และยอดคงเหลือลูกหนี้แต่ละสิทธิ (แบบฟอร์มทางการ)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            เอกสารทางการเสนอผู้บริหาร พร้อมระบบตรวจทานและลงนาม 3 ลำดับชั้นตามระเบียบราชการ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>เดือน:</span>
            <select
              value={reportMonth}
              onChange={(e) => {
                setReportMonth(e.target.value);
                if (e.target.value === 'สิงหาคม') setPrevMonth('กรกฎาคม');
                else if (e.target.value === 'กันยายน') setPrevMonth('สิงหาคม');
                else if (e.target.value === 'กรกฎาคม') setPrevMonth('มิถุนายน');
              }}
              className="bg-transparent font-medium text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="มิถุนายน">มิถุนายน</option>
              <option value="กรกฎาคม">กรกฎาคม</option>
              <option value="สิงหาคม">สิงหาคม</option>
              <option value="กันยายน">กันยายน</option>
              <option value="ตุลาคม">ตุลาคม</option>
            </select>
            <span>พ.ศ.</span>
            <input
              type="text"
              value={reportYear}
              onChange={(e) => setReportYear(e.target.value)}
              className="w-12 bg-transparent text-center font-medium text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <FileSpreadsheet className="w-4 h-4" />
            ส่งออก Excel (.xlsx)
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            พิมพ์รายงาน (Print A4)
          </button>
        </div>
      </div>

      {/* Signature Approval Bar for Active User (no-print) */}
      <div className="no-print bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            สถานะการลงนามตามลำดับชั้น ({currentUser.name}):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSign('reporter')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              signatures.reporterSigned
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${signatures.reporterSigned ? 'text-emerald-600' : 'text-slate-300'}`} />
            1. ผู้รายงาน (จนท.ธุรการ) {signatures.reporterSigned ? '✓ ลงนามแล้ว' : 'กดลงนาม'}
          </button>

          <button
            onClick={() => handleSign('checker')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              signatures.checkerSigned
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${signatures.checkerSigned ? 'text-emerald-600' : 'text-slate-300'}`} />
            2. ผู้ตรวจสอบ (เวชสถิติ) {signatures.checkerSigned ? '✓ ตรวจสอบแล้ว' : 'กดตรวจสอบ'}
          </button>

          <button
            onClick={() => handleSign('approver')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              signatures.approverSigned
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            3. ผู้รับรอง (ผอ.รพ.) {signatures.approverSigned ? '✓ รับรองอนุมัติแล้ว' : 'กดรับรองรายงาน'}
          </button>
        </div>
      </div>

      {/* Official Document Sheet Container (Formatted for Standard A4 Landscape) */}
      <div className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 print:text-black">
        {/* Header Block with Official Sangkhlaburi Hospital Emblem */}
        <div className="text-center mb-6 relative">
          {/* Hospital Logo in Center Top */}
          <div className="flex justify-center mb-2">
            <HospitalLogo size={64} />
          </div>

          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black font-sans">
            รายงานสรุปการเรียกเก็บลูกหนี้และยอดคงเหลือลูกหนี้แต่ละสิทธิ
          </h1>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 print:text-black mt-1">
            ประจำเดือน...{reportMonth}...{reportYear}.......
          </p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 print:text-black">
            งานประกันสุขภาพฯ โรงพยาบาลสังขละบุรี จังหวัดกาญจนบุรี
          </p>
        </div>

        {/* 52 Rights Table formatted exactly as hospital document */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] print:text-[8.5pt] border-collapse border border-slate-400 dark:border-slate-700 print:border-black">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 print:bg-slate-100 text-slate-900 dark:text-slate-100 print:text-black text-center font-bold">
                <th className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 w-10">
                  ลำดับ
                </th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-1.5 text-left">
                  รายการ
                </th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 w-32 text-right">
                  ยอดลูกหนี้ยกมา ณ..31 {prevMonth}..{reportYear.slice(2)}..
                </th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 w-28 text-right">
                  ยอดลูกหนี้ของเดือน
                </th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 w-28 text-right">
                  ยอดรับชำระระหว่างเดือน
                </th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 w-32 text-right">
                  ยอดลูกหนี้ยกไป ณ..31 {reportMonth}..{reportYear.slice(2)}..
                </th>
                <th className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 w-36 text-center">
                  หมายเหตุ
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Category 1 Header */}
              <tr className="bg-slate-50 dark:bg-slate-800/50 print:bg-slate-50 font-bold">
                <td
                  colSpan={7}
                  className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-1 text-slate-900 dark:text-white print:text-black"
                >
                  ลูกหนี้การค้า-หน่วยงานภาครัฐ (รหัส 1102050101)
                </td>
              </tr>

              {/* Items 1 to 33 */}
              {govRights.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 print:hover:bg-transparent"
                >
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-center font-mono">
                    {row.id}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1">
                    <span className="font-mono text-[10px] print:text-[8pt] text-slate-600 dark:text-slate-300 print:text-black mr-2">
                      {row.code}
                    </span>
                    <span>{row.name}</span>
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono">
                    {row.broughtForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono">
                    {row.newAmount > 0
                      ? row.newAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono">
                    {row.paidAmount > 0
                      ? row.paidAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono font-medium">
                    {row.carriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-[10px] text-slate-600 dark:text-slate-400 print:text-black">
                    {row.remarks}
                  </td>
                </tr>
              ))}

              {/* Subtotal Category 1 */}
              <tr className="bg-slate-100/80 dark:bg-slate-800 font-bold print:bg-slate-100">
                <td
                  colSpan={2}
                  className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-1.5 text-center"
                >
                  รวม หมวด 1: ลูกหนี้การค้า-หน่วยงานภาครัฐ
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {govBrought.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {govNew.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {govPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {govCarried.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-center">
                  33 สิทธิ
                </td>
              </tr>

              {/* Category 2 Header */}
              <tr className="bg-slate-50 dark:bg-slate-800/50 print:bg-slate-50 font-bold">
                <td
                  colSpan={7}
                  className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-1 text-slate-900 dark:text-white print:text-black"
                >
                  ลูกหนี้การค้า - บุคคลภายนอก (รหัส 1102050102)
                </td>
              </tr>

              {/* Items 34 to 52 */}
              {extRights.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 print:hover:bg-transparent"
                >
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-center font-mono">
                    {row.id}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1">
                    <span className="font-mono text-[10px] print:text-[8pt] text-slate-600 dark:text-slate-300 print:text-black mr-2">
                      {row.code}
                    </span>
                    <span>{row.name}</span>
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono">
                    {row.broughtForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono">
                    {row.newAmount > 0
                      ? row.newAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono">
                    {row.paidAmount > 0
                      ? row.paidAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                      : '0.00'}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-right font-mono font-medium">
                    {row.carriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1 text-[10px] text-slate-600 dark:text-slate-400 print:text-black">
                    {row.remarks}
                  </td>
                </tr>
              ))}

              {/* Subtotal Category 2 */}
              <tr className="bg-slate-100/80 dark:bg-slate-800 font-bold print:bg-slate-100">
                <td
                  colSpan={2}
                  className="border border-slate-300 dark:border-slate-700 print:border-black px-3 py-1.5 text-center"
                >
                  รวม หมวด 2: ลูกหนี้การค้า-บุคคลภายนอก
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {extBrought.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {extNew.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {extPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-right font-mono">
                  {extCarried.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 dark:border-slate-700 print:border-black px-2 py-1.5 text-center">
                  19 สิทธิ
                </td>
              </tr>

              {/* Grand Total Row */}
              <tr className="bg-emerald-100/70 dark:bg-emerald-950/60 font-black print:bg-slate-200 text-slate-950 dark:text-emerald-100 print:text-black">
                <td
                  colSpan={2}
                  className="border-2 border-slate-400 dark:border-slate-600 print:border-black px-3 py-2 text-center text-xs"
                >
                  รวมทั้งหมด (52 สิทธิการรักษาพยาบาล)
                </td>
                <td className="border-2 border-slate-400 dark:border-slate-600 print:border-black px-2 py-2 text-right font-mono text-xs">
                  {totalBrought.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border-2 border-slate-400 dark:border-slate-600 print:border-black px-2 py-2 text-right font-mono text-xs">
                  {totalNew.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border-2 border-slate-400 dark:border-slate-600 print:border-black px-2 py-2 text-right font-mono text-xs">
                  {totalPaid.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border-2 border-slate-400 dark:border-slate-600 print:border-black px-2 py-2 text-right font-mono text-xs font-black">
                  {totalCarried.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border-2 border-slate-400 dark:border-slate-600 print:border-black px-2 py-2 text-center text-[10px]">
                  ครบถ้วน 52 รายการ
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3-Tier Official Signature Block strictly from Sangkhlaburi Hospital Document */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700/60 print:border-black print-avoid-break">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs sm:text-sm">
            {/* 1. ผู้รายงาน */}
            <div className="space-y-1">
              <div className="h-14 flex items-center justify-center">
                {signatures.reporterSigned ? (
                  <div className="inline-flex flex-col items-center">
                    <span className="font-serif italic text-base text-emerald-800 dark:text-emerald-400 font-bold print:text-black">
                      สุดลัดดา จันทวุฒิ
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      (Digital Signed: {signatures.reporterSignedDate || '31 ส.ค. 2569'})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">(รอลงนาม)</span>
                )}
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100 print:text-black">
                (......{signatures.reporterName}......)
              </p>
              <p className="text-slate-600 dark:text-slate-400 print:text-black">
                ตำแหน่ง....{signatures.reporterTitle}.....
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black pt-1">
                ผู้รายงาน
              </p>
            </div>

            {/* 2. ผู้ตรวจสอบ */}
            <div className="space-y-1">
              <div className="h-14 flex items-center justify-center">
                {signatures.checkerSigned ? (
                  <div className="inline-flex flex-col items-center">
                    <span className="font-serif italic text-base text-emerald-800 dark:text-emerald-400 font-bold print:text-black">
                      มยุรา ปรางจันทร์
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      (Verified: {signatures.checkerSignedDate || '31 ส.ค. 2569'})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">(รอตรวจสอบ)</span>
                )}
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100 print:text-black">
                (......{signatures.checkerName}......)
              </p>
              <p className="text-slate-600 dark:text-slate-400 print:text-black">
                ตำแหน่ง...{signatures.checkerTitle}.....
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-200 print:text-black pt-1">
                ผู้ตรวจสอบ
              </p>
            </div>

            {/* 3. ผู้รับรอง */}
            <div className="space-y-1">
              <div className="h-14 flex items-center justify-center">
                {signatures.approverSigned ? (
                  <div className="inline-flex flex-col items-center">
                    <span className="font-serif italic text-base text-emerald-800 dark:text-emerald-400 font-bold print:text-black">
                      จิรวัฒน์ วงษ์สวัสดิ์
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      (Approved: {signatures.approverSignedDate || '1 ก.ย. 2569'})
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-xs">(รอการรับรอง)</span>
                )}
              </div>
              <p className="font-medium text-slate-900 dark:text-slate-100 print:text-black">
                (.....{signatures.approverName}......)
              </p>
              <p className="text-slate-600 dark:text-slate-400 print:text-black text-xs leading-tight">
                ตำแหน่ง......นายแพทย์ชำนาญการ(ด้านเวชกรรม).......
              </p>
              <p className="text-slate-600 dark:text-slate-400 print:text-black text-xs">
                รักษาการในตำแหน่งผู้อำนวยการโรงพยาบาลสังขละบุรี
              </p>
              <p className="font-bold text-slate-900 dark:text-white print:text-black pt-1">
                ผู้รับรอง
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import * as XLSX from 'xlsx';
import { DebtorRight } from '../types';

export const exportDebtorsToExcel = (
  rights: DebtorRight[],
  monthName: string = 'สิงหาคม',
  yearBe: string = '2569'
): void => {
  const wb = XLSX.utils.book_new();

  // 1. Data arrays for 52 Rights Sheet
  const govRights = rights.filter((r) => r.category === 'gov');
  const extRights = rights.filter((r) => r.category === 'external');

  const totalBroughtForward = rights.reduce((s, r) => s + r.broughtForward, 0);
  const totalNewAmount = rights.reduce((s, r) => s + r.newAmount, 0);
  const totalPaidAmount = rights.reduce((s, r) => s + r.paidAmount, 0);
  const totalBadDebtAmount = rights.reduce((s, r) => s + r.badDebtAmount, 0);
  const totalCarriedForward = rights.reduce((s, r) => s + r.carriedForward, 0);

  const govBrought = govRights.reduce((s, r) => s + r.broughtForward, 0);
  const govNew = govRights.reduce((s, r) => s + r.newAmount, 0);
  const govPaid = govRights.reduce((s, r) => s + r.paidAmount, 0);
  const govBad = govRights.reduce((s, r) => s + r.badDebtAmount, 0);
  const govCarried = govRights.reduce((s, r) => s + r.carriedForward, 0);

  const extBrought = extRights.reduce((s, r) => s + r.broughtForward, 0);
  const extNew = extRights.reduce((s, r) => s + r.newAmount, 0);
  const extPaid = extRights.reduce((s, r) => s + r.paidAmount, 0);
  const extBad = extRights.reduce((s, r) => s + r.badDebtAmount, 0);
  const extCarried = extRights.reduce((s, r) => s + r.carriedForward, 0);

  // SHEET 1: Summary Sheet
  const summaryData = [
    ['รายงานสรุปการเรียกเก็บลูกหนี้และยอดคงเหลือลูกหนี้แต่ละสิทธิ โรงพยาบาลสังขละบุรี'],
    [`ประจำเดือน ${monthName} พ.ศ. ${yearBe}`],
    ['งานประกันสุขภาพฯ โรงพยาบาลสังขละบุรี จังหวัดกาญจนบุรี'],
    [],
    ['รายการสรุป', 'ยอดลูกหนี้ยกมา', 'ยอดลูกหนี้ของเดือน', 'ยอดรับชำระระหว่างเดือน', 'ยอดตัดหนี้สูญ', 'ยอดคงเหลือยกไป', '% จัดเก็บ'],
    [
      'หมวด 1: ลูกหนี้การค้า - หน่วยงานภาครัฐ (33 สิทธิ)',
      govBrought,
      govNew,
      govPaid,
      govBad,
      govCarried,
      govBrought + govNew > 0 ? Number(((govPaid / (govBrought + govNew)) * 100).toFixed(2)) : 0,
    ],
    [
      'หมวด 2: ลูกหนี้การค้า - บุคคลภายนอก (19 สิทธิ)',
      extBrought,
      extNew,
      extPaid,
      extBad,
      extCarried,
      extBrought + extNew > 0 ? Number(((extPaid / (extBrought + extNew)) * 100).toFixed(2)) : 0,
    ],
    [
      'รวมทั้งสิ้น (52 สิทธิการรักษา)',
      totalBroughtForward,
      totalNewAmount,
      totalPaidAmount,
      totalBadDebtAmount,
      totalCarriedForward,
      totalBroughtForward + totalNewAmount > 0
        ? Number(((totalPaidAmount / (totalBroughtForward + totalNewAmount)) * 100).toFixed(2))
        : 0,
    ],
    [],
    ['สูตรคำนวณ:', 'ยอดลูกหนี้ยกไป = ยอดลูกหนี้ยกมา + ยอดลูกหนี้ของเดือน - ยอดรับชำระ - ยอดตัดหนี้สูญ'],
    [],
    ['ผู้ลงนามรับรองตามลำดับชั้น:'],
    ['1. ผู้รายงาน:', 'นางสาวสุดลัดดา จันทวุฒิ', 'ตำแหน่ง เจ้าหน้าที่ธุรการ'],
    ['2. ผู้ตรวจสอบ:', 'นางสาวมยุรา ปรางจันทร์', 'ตำแหน่ง เจ้าพนักงานเวชสถิติชำนาญงาน'],
    ['3. ผู้รับรอง:', 'นายแพทย์จิรวัฒน์ วงษ์สวัสดิ์', 'รักษาการในตำแหน่งผู้อำนวยการโรงพยาบาลสังขละบุรี'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'สรุปยอดผู้บริหาร');

  // Helper for 52 Rights table formatting
  const makeTableRows = (items: DebtorRight[]) => {
    return items.map((r, idx) => ({
      ลำดับ: idx + 1,
      รหัสบัญชี: r.code,
      รายการสิทธิการรักษาพยาบาล: r.name,
      กลุ่มกองทุน: r.fundGroup,
      หมวด: r.category === 'gov' ? 'หน่วยงานภาครัฐ' : 'บุคคลภายนอก',
      ยอดลูกหนี้ยกมา: r.broughtForward,
      ยอดตั้งใหม่ของเดือน: r.newAmount,
      ยอดรับชำระระหว่างเดือน: r.paidAmount,
      ยอดตัดหนี้สูญ: r.badDebtAmount,
      ยอดลูกหนี้ยกไป: r.carriedForward,
      วันค้างชำระ: r.daysOverdue,
      สถานะ: r.daysOverdue > 30 ? 'ค้างเกิน 1 เดือน (เร่งด่วน)' : 'ปกติ',
      หมายเหตุ: r.remarks,
    }));
  };

  // SHEET 2: Full 52 Rights
  const wsFull = XLSX.utils.json_to_sheet(makeTableRows(rights));
  XLSX.utils.book_append_sheet(wb, wsFull, 'ทะเบียนคุม 52 สิทธิ');

  // SHEET 3: Gov
  const wsGov = XLSX.utils.json_to_sheet(makeTableRows(govRights));
  XLSX.utils.book_append_sheet(wb, wsGov, 'หมวด 1 ภาครัฐ (33)');

  // SHEET 4: External
  const wsExt = XLSX.utils.json_to_sheet(makeTableRows(extRights));
  XLSX.utils.book_append_sheet(wb, wsExt, 'หมวด 2 ภายนอก (19)');

  // SHEET 5: Overdue > 30 Days
  const overdueRights = rights.filter((r) => r.daysOverdue > 30 && r.carriedForward > 0);
  const wsOverdue = XLSX.utils.json_to_sheet(makeTableRows(overdueRights));
  XLSX.utils.book_append_sheet(wb, wsOverdue, 'หนี้เกิน 1 เดือน');

  // Write and trigger download
  const fileName = `ทะเบียนคุมลูกหนี้_52สิทธิ_รพ_สังขละบุรี_${monthName}_${yearBe}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

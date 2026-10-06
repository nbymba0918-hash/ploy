export type DebtorCategory = 'gov' | 'external';

export type FundGroup =
  | 'UC'
  | 'ประกันสังคม'
  | 'ข้าราชการ กรมบัญชีกลาง'
  | 'แรงงานต่างด้าว'
  | 'บุคคลมีปัญหาสถานะและสิทธิ'
  | 'อปท.'
  | 'พรบ.รถ'
  | 'เบิกต้นสังกัด'
  | 'ชำระเงินเอง'
  | 'บริการอื่น/ส่งตรวจ';

export interface DebtorRight {
  id: number;
  code: string;
  name: string;
  category: DebtorCategory;
  fundGroup: FundGroup;
  broughtForward: number; // ยอดลูกหนี้ยกมา ณ สิ้นเดือนก่อน
  newAmount: number;      // ยอดลูกหนี้ของเดือน (ยอดตั้งใหม่)
  paidAmount: number;     // ยอดรับชำระระหว่างเดือน
  badDebtAmount: number;  // ยอดตัดหนี้สูญ
  carriedForward: number; // ยอดลูกหนี้ยกไป = ยกมา + ตั้งใหม่ - รับชำระ - หนี้สูญ
  remarks: string;
  daysOverdue: number;    // จำนวนวันค้างชำระ (สำหรับเตือน > 30 วัน)
  lastUpdated?: string;
}

export type UserRole = 'executive' | 'statistician' | 'accountant' | 'superadmin';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  department: string;
}

export interface ReportSignatureInfo {
  reporterName: string;
  reporterTitle: string;
  reporterSigned: boolean;
  reporterSignedDate?: string;

  checkerName: string;
  checkerTitle: string;
  checkerSigned: boolean;
  checkerSignedDate?: string;

  approverName: string;
  approverTitle: string;
  approverSigned: boolean;
  approverSignedDate?: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'EMAIL';
  recipientName: string;
  targetAddress: string;
  title: string;
  message: string;
  status: 'DELIVERED' | 'FAILED';
}

export interface NotificationConfig {
  directorPhone: string;
  directorEmail: string;
  directorNotifySms: boolean;
  directorNotifyEmail: boolean;
  accountantPhone: string;
  accountantEmail: string;
  accountantNotifySms: boolean;
  accountantNotifyEmail: boolean;
  statisticianPhone: string;
  statisticianEmail: string;
  statisticianNotifySms: boolean;
  statisticianNotifyEmail: boolean;
  autoNotifyOnMonthClose: boolean;
}

export interface BackupHistoryItem {
  id: string;
  timestamp: string;
  sizeKb: number;
  recordCount: number;
  status: 'SUCCESS' | 'SYNCED';
  backupType: 'AUTO_WEEKLY' | 'MANUAL';
}

export interface MonthlyLedgerArchive {
  id: string;
  periodMonth: string;
  periodYearBe: string;
  accountingDate: string;
  savedAt: string;
  savedBy: string;
  savedByRole: string;
  rights: DebtorRight[];
  totalBroughtForward: number;
  totalNewAmount: number;
  totalPaidAmount: number;
  totalBadDebtAmount: number;
  totalCarriedForward: number;
  collectionRate: number;
  remarks?: string;
  status: 'SAVED' | 'LOCKED';
}

export interface ReconciliationRecord {
  code: string;
  name: string;
  systemCarriedForward: number;
  legacySystemBalance: number;
  difference: number;
  notes?: string;
}

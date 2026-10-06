import { DebtorRight, AppUser, ReportSignatureInfo, NotificationConfig, NotificationLog, BackupHistoryItem, MonthlyLedgerArchive } from '../types';
import { INITIAL_DEBTOR_RIGHTS, INITIAL_USERS, DEFAULT_SIGNATURE_INFO, DEFAULT_NOTIFICATION_CONFIG } from '../data/initialRights';

const STORAGE_KEYS = {
  RIGHTS: 'skb_debtor_rights_v1',
  USERS: 'skb_users_v1',
  ACTIVE_USER: 'skb_active_user_id_v1',
  SIGNATURES: 'skb_signatures_v1',
  NOTIF_CONFIG: 'skb_notif_config_v1',
  NOTIF_LOGS: 'skb_notif_logs_v1',
  BACKUP_HISTORY: 'skb_backup_history_v1',
  DARK_MODE: 'skb_dark_mode_v1',
  SELECTED_PERIOD: 'skb_period_v1',
  CLOUD_SYNC_STATUS: 'skb_cloud_sync_v1',
  MONTHLY_ARCHIVES: 'skb_monthly_archives_v1',
};

export const getStoredDebtorRights = (): DebtorRight[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RIGHTS);
    if (!raw) {
      saveStoredDebtorRights(INITIAL_DEBTOR_RIGHTS);
      return INITIAL_DEBTOR_RIGHTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading debtor rights:', err);
    return INITIAL_DEBTOR_RIGHTS;
  }
};

export const saveStoredDebtorRights = (rights: DebtorRight[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RIGHTS, JSON.stringify(rights));
  } catch (err) {
    console.error('Error saving debtor rights:', err);
  }
};

export const getStoredUsers = (): AppUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveStoredUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: AppUser[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users:', err);
  }
};

export const getStoredActiveUser = (): AppUser | null => {
  const users = getStoredUsers();
  try {
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (activeId) {
      const match = users.find((u) => u.id === activeId);
      if (match) return match;
    }
  } catch {}
  return null;
};

export const saveStoredActiveUserId = (id: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, id);
  } catch (err) {
    console.error(err);
  }
};

export const clearStoredActiveUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  } catch (err) {
    console.error(err);
  }
};

export const getStoredSignatures = (): ReportSignatureInfo => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIGNATURES);
    return raw ? JSON.parse(raw) : DEFAULT_SIGNATURE_INFO;
  } catch {
    return DEFAULT_SIGNATURE_INFO;
  }
};

export const saveStoredSignatures = (signatures: ReportSignatureInfo): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SIGNATURES, JSON.stringify(signatures));
  } catch (err) {
    console.error(err);
  }
};

export const getStoredNotificationConfig = (): NotificationConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIF_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_NOTIFICATION_CONFIG;
  } catch {
    return DEFAULT_NOTIFICATION_CONFIG;
  }
};

export const saveStoredNotificationConfig = (config: NotificationConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIF_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error(err);
  }
};

export const getStoredNotificationLogs = (): NotificationLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIF_LOGS);
    if (!raw) {
      const defaultLogs: NotificationLog[] = [
        {
          id: 'log-1',
          timestamp: '31 ส.ค. 2569 17:30',
          channel: 'SMS',
          recipientName: 'นายแพทย์จิรวัฒน์ วงษ์สวัสดิ์ (รักษาการ ผอ.รพ.)',
          targetAddress: '081-894-4321',
          title: 'แจ้งเตือนปิดงบประจำเดือน',
          message: 'รพ.สังขละบุรี: สรุปยอดลูกหนี้ 52 สิทธิ ประจำเดือน ส.ค. 69 ยกไปคงเหลือ 14,988,727.69 บาท รอการรับรอง',
          status: 'DELIVERED',
        },
        {
          id: 'log-2',
          timestamp: '31 ส.ค. 2569 17:31',
          channel: 'EMAIL',
          recipientName: 'นพ.จิรวัฒน์ วงษ์สวัสดิ์',
          targetAddress: 'director.skb@moph.mail.go.th',
          title: 'รายงานการเรียกเก็บลูกหนี้และยอดคงเหลือลูกหนี้แต่ละสิทธิ เดือน ส.ค. 2569',
          message: 'เรียน ผู้อำนวยการ งานประกันสุขภาพฯ ได้จัดทำรายงานทะเบียนคุม 52 สิทธิ เรียบร้อยแล้ว พร้อมแนบไฟล์สรุป',
          status: 'DELIVERED',
        },
        {
          id: 'log-3',
          timestamp: '31 ส.ค. 2569 16:45',
          channel: 'SMS',
          recipientName: 'นางสาวมยุรา ปรางจันทร์ (เวชสถิติ)',
          targetAddress: '089-765-4321',
          title: 'ตรวจสอบยอดลูกหนี้',
          message: 'ฝ่ายการเงินส่งรายงานทะเบียนคุม 52 สิทธิ ให้ตรวจสอบความถูกต้องตรงกับ HIS แล้ว',
          status: 'DELIVERED',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIF_LOGS, JSON.stringify(defaultLogs));
      return defaultLogs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredNotificationLogs = (logs: NotificationLog[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIF_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error(err);
  }
};

export const getStoredBackupHistory = (): BackupHistoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_HISTORY);
    if (!raw) {
      const defaultHistory: BackupHistoryItem[] = [
        {
          id: 'bak-1',
          timestamp: 'วันอาทิตย์ที่ 30 ส.ค. 2569 02:00 น.',
          sizeKb: 48.6,
          recordCount: 52,
          status: 'SYNCED',
          backupType: 'AUTO_WEEKLY',
        },
        {
          id: 'bak-2',
          timestamp: 'วันอาทิตย์ที่ 23 ส.ค. 2569 02:00 น.',
          sizeKb: 47.9,
          recordCount: 52,
          status: 'SYNCED',
          backupType: 'AUTO_WEEKLY',
        },
        {
          id: 'bak-3',
          timestamp: 'วันอาทิตย์ที่ 16 ส.ค. 2569 02:00 น.',
          sizeKb: 46.2,
          recordCount: 52,
          status: 'SYNCED',
          backupType: 'AUTO_WEEKLY',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(defaultHistory));
      return defaultHistory;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredBackupHistory = (items: BackupHistoryItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(items));
  } catch (err) {
    console.error(err);
  }
};

export const getStoredMonthlyArchives = (): MonthlyLedgerArchive[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MONTHLY_ARCHIVES);
    if (!raw) {
      // Default archive for August 2569
      const defaultArchives: MonthlyLedgerArchive[] = [
        {
          id: 'archive-2569-08',
          periodMonth: 'สิงหาคม',
          periodYearBe: '2569',
          accountingDate: '31 สิงหาคม 2569',
          savedAt: '31 ส.ค. 2569 16:30 น.',
          savedBy: 'นางสาวสุดลัดดา จันทวุฒิ',
          savedByRole: 'เจ้าหน้าที่ธุรการ',
          rights: INITIAL_DEBTOR_RIGHTS,
          totalBroughtForward: 15886925.72,
          totalNewAmount: 10537047.60,
          totalPaidAmount: 11435245.63,
          totalBadDebtAmount: 0.00,
          totalCarriedForward: 14988727.69,
          collectionRate: 43.27,
          remarks: 'ปิดสรุปยอดลูกหนี้ 52 สิทธิ ประจำเดือนสิงหาคม 2569 ครบถ้วนตรงตามหลักฐาน',
          status: 'SAVED',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.MONTHLY_ARCHIVES, JSON.stringify(defaultArchives));
      return defaultArchives;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredMonthlyArchives = (archives: MonthlyLedgerArchive[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_ARCHIVES, JSON.stringify(archives));
  } catch (err) {
    console.error('Error saving monthly archives:', err);
  }
};

export const resetToHospitalOfficialData = (): DebtorRight[] => {
  saveStoredDebtorRights(INITIAL_DEBTOR_RIGHTS);
  saveStoredSignatures(DEFAULT_SIGNATURE_INFO);
  return INITIAL_DEBTOR_RIGHTS;
};

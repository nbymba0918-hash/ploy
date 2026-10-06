import React, { useState, useEffect } from 'react';
import {
  DebtorRight,
  AppUser,
  ReportSignatureInfo,
  NotificationConfig,
  NotificationLog,
  BackupHistoryItem,
  MonthlyLedgerArchive,
} from './types';
import {
  getStoredDebtorRights,
  saveStoredDebtorRights,
  getStoredUsers,
  saveStoredUsers,
  getStoredActiveUser,
  saveStoredActiveUserId,
  clearStoredActiveUser,
  getStoredSignatures,
  saveStoredSignatures,
  getStoredNotificationConfig,
  saveStoredNotificationConfig,
  getStoredNotificationLogs,
  saveStoredNotificationLogs,
  getStoredBackupHistory,
  saveStoredBackupHistory,
  getStoredMonthlyArchives,
  saveStoredMonthlyArchives,
  resetToHospitalOfficialData,
} from './utils/storage';
import { exportDebtorsToExcel } from './utils/excelExport';
import { auth, testFirestoreConnection } from './lib/firebase';
import { signOut } from 'firebase/auth';
import {
  seedInitialDataIfEmpty,
  subscribeToDebtorRights,
  saveDebtorRightToFirebase,
  batchSaveDebtorRightsToFirebase,
  subscribeToMonthlyArchives,
  saveMonthlyArchiveToFirebase,
  subscribeToSignatures,
  saveSignaturesToFirebase,
  subscribeToNotificationLogs,
  saveNotificationLogToFirebase,
  subscribeToUsers,
  saveUserProfileToFirebase,
} from './services/firebaseService';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { DebtorsLedgerView } from './components/DebtorsLedgerView';
import { OfficialReportView } from './components/OfficialReportView';
import { ReconciliationView } from './components/ReconciliationView';
import { NotificationSettingsView } from './components/NotificationSettingsView';
import { UserManagementView } from './components/UserManagementView';
import { BackupSyncView } from './components/BackupSyncView';
import { EditDebtorModal } from './components/EditDebtorModal';
import { LoginView } from './components/LoginView';
import { HospitalLogo } from './components/HospitalLogo';

export default function App() {
  // Authentication & Active User State
  const [activeUser, setActiveUser] = useState<AppUser | null>(() => getStoredActiveUser());

  // Domain Data State Initialization
  const [rights, setRights] = useState<DebtorRight[]>(() => getStoredDebtorRights());
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [signatures, setSignatures] = useState<ReportSignatureInfo>(() => getStoredSignatures());
  const [notifConfig, setNotifConfig] = useState<NotificationConfig>(() =>
    getStoredNotificationConfig()
  );
  const [notifLogs, setNotifLogs] = useState<NotificationLog[]>(() =>
    getStoredNotificationLogs()
  );
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>(() =>
    getStoredBackupHistory()
  );
  const [monthlyArchives, setMonthlyArchives] = useState<MonthlyLedgerArchive[]>(() =>
    getStoredMonthlyArchives()
  );
  const [currentPeriodMonth, setCurrentPeriodMonth] = useState('สิงหาคม');
  const [currentPeriodYear, setCurrentPeriodYear] = useState('2569');
  const [currentAccountingDate, setCurrentAccountingDate] = useState('31 สิงหาคม 2569');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('skb_dark_mode') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);

  // Modal & Ledger Filter parameters
  const [editingDebtor, setEditingDebtor] = useState<DebtorRight | null>(null);
  const [ledgerInitialOverdue, setLedgerInitialOverdue] = useState(false);
  const [ledgerInitialCategory, setLedgerInitialCategory] = useState<'all' | 'gov' | 'external'>('all');

  // Sync Dark Mode to HTML document tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('skb_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('skb_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Firebase Real-time Subscriptions & Cloud Synchronization
  useEffect(() => {
    if (!activeUser) return;

    // 1. Test connection to Firebase Firestore
    testFirestoreConnection().catch((err) =>
      console.warn('Firebase connection check:', err)
    );

    // 2. Seed initial 52 rights to Firebase if empty
    seedInitialDataIfEmpty().catch((err) =>
      console.warn('Initial seeding note:', err)
    );

    // 3. Real-time subscribe to 52 Debtor Rights
    const unsubRights = subscribeToDebtorRights(
      (newRights) => {
        if (newRights && newRights.length > 0) {
          setRights(newRights);
          saveStoredDebtorRights(newRights);
        }
      },
      (err) => console.warn('Debtor rights listener sync notice:', err)
    );

    // 4. Real-time subscribe to Monthly Archives
    const unsubArchives = subscribeToMonthlyArchives((archives) => {
      setMonthlyArchives(archives);
      saveStoredMonthlyArchives(archives);
    });

    // 5. Real-time subscribe to Signatures
    const unsubSignatures = subscribeToSignatures((sigs) => {
      setSignatures(sigs);
      saveStoredSignatures(sigs);
    });

    // 6. Real-time subscribe to Notification Logs
    const unsubLogs = subscribeToNotificationLogs((logs) => {
      setNotifLogs(logs);
      saveStoredNotificationLogs(logs);
    });

    // 7. Real-time subscribe to Users
    const unsubUsers = subscribeToUsers((userList) => {
      setUsers(userList);
      saveStoredUsers(userList);
    });

    return () => {
      unsubRights();
      unsubArchives();
      unsubSignatures();
      unsubLogs();
      unsubUsers();
    };
  }, [activeUser]);

  // Handle Login Success
  const handleLoginSuccess = (user: AppUser) => {
    setActiveUser(user);
    saveStoredActiveUserId(user.id);
    // Also save user profile to Firebase
    saveUserProfileToFirebase(user).catch((err) =>
      console.warn('User profile sync to Firebase:', err)
    );
  };

  // Handle Logout (No direct user-switching allowed; must logout cleanly)
  const handleLogout = () => {
    signOut(auth).catch(() => {});
    clearStoredActiveUser();
    setActiveUser(null);
  };

  // Handlers for Data Updates with Firebase Firestore Cloud Sync
  const handleUpdateDebtor = (updated: DebtorRight) => {
    const updatedList = rights.map((r) => (r.id === updated.id ? updated : r));
    setRights(updatedList);
    saveStoredDebtorRights(updatedList);
    saveDebtorRightToFirebase(updated).catch((err) =>
      console.warn('Firebase debtor write error:', err)
    );
  };

  const handleUpdateAllRights = (newRights: DebtorRight[]) => {
    setRights(newRights);
    saveStoredDebtorRights(newRights);
    batchSaveDebtorRightsToFirebase(newRights).catch((err) =>
      console.warn('Firebase batch debtor write error:', err)
    );
  };

  const handleUpdateUsers = (newUsers: AppUser[]) => {
    setUsers(newUsers);
    saveStoredUsers(newUsers);
    newUsers.forEach((u) => {
      saveUserProfileToFirebase(u).catch(() => {});
    });
  };

  const handleUpdateSignatures = (newSignatures: ReportSignatureInfo) => {
    setSignatures(newSignatures);
    saveStoredSignatures(newSignatures);
    saveSignaturesToFirebase(newSignatures).catch((err) =>
      console.warn('Firebase signatures write error:', err)
    );
  };

  const handleUpdateNotifConfig = (cfg: NotificationConfig) => {
    setNotifConfig(cfg);
    saveStoredNotificationConfig(cfg);
  };

  const handleAddNotifLog = (log: NotificationLog) => {
    const nextLogs = [log, ...notifLogs];
    setNotifLogs(nextLogs);
    saveStoredNotificationLogs(nextLogs);
    saveNotificationLogToFirebase(log).catch((err) =>
      console.warn('Firebase notification log write error:', err)
    );
  };

  const handleAddBackupHistory = (item: BackupHistoryItem) => {
    const nextList = [item, ...backupHistory];
    setBackupHistory(nextList);
    saveStoredBackupHistory(nextList);
  };

  const handleSaveMonthlyArchive = (archive: MonthlyLedgerArchive) => {
    const existingIdx = monthlyArchives.findIndex((a) => a.id === archive.id);
    let updated: MonthlyLedgerArchive[];
    if (existingIdx >= 0) {
      updated = [...monthlyArchives];
      updated[existingIdx] = archive;
    } else {
      updated = [archive, ...monthlyArchives];
    }
    setMonthlyArchives(updated);
    saveStoredMonthlyArchives(updated);
    saveMonthlyArchiveToFirebase(archive).catch((err) =>
      console.warn('Firebase monthly archive write error:', err)
    );
  };

  const handleLoadArchive = (archive: MonthlyLedgerArchive) => {
    setRights(archive.rights);
    saveStoredDebtorRights(archive.rights);
  };

  const handleChangePeriod = (month: string, year: string, date: string) => {
    setCurrentPeriodMonth(month);
    setCurrentPeriodYear(year);
    setCurrentAccountingDate(date);
  };

  const handleResetData = () => {
    const reset = resetToHospitalOfficialData();
    setRights(reset);
    batchSaveDebtorRightsToFirebase(reset).catch(() => {});
  };

  const handleExportExcel = () => {
    exportDebtorsToExcel(rights, currentPeriodMonth, currentPeriodYear);
  };

  const handleNavigateToLedger = (filterOverdue = false, category: 'gov' | 'external' | 'all' = 'all') => {
    setLedgerInitialOverdue(filterOverdue);
    setLedgerInitialCategory(category);
    setActiveTab('ledger');
  };

  // If not logged in, show Login Window first
  if (!activeUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Overdue count (> 30 days) and total balance
  const overdueCount = rights.filter((r) => r.daysOverdue > 30 && r.carriedForward > 0).length;
  const totalCarriedForward = rights.reduce((s, r) => s + r.carriedForward, 0);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 antialiased overflow-x-hidden">
      {/* 1. Left Sidebar Navigation Menu (Always situated on the left) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'ledger') {
            setLedgerInitialOverdue(false);
            setLedgerInitialCategory('all');
          }
          setActiveTab(tab);
        }}
        currentUser={activeUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        overdueCount={overdueCount}
        cloudSyncEnabled={cloudSyncEnabled}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Main Content Area (Offset to the right on desktop, full width on mobile/tablet) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 xl:pl-72 transition-all duration-300">
        {/* Slim Top Bar Header */}
        <TopHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          currentUser={activeUser}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          overdueCount={overdueCount}
          onSelectTab={setActiveTab}
          onExportExcel={handleExportExcel}
        />

        {/* Grand Header Banner with Large, Eye-Catching, Prominent Typography */}
        <section className="no-print bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white border-b border-emerald-900/60 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
              {/* Left Brand Area */}
              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md shrink-0 ring-2 ring-emerald-500/40">
                  <HospitalLogo size={54} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-300">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold tracking-wide">โรงพยาบาลสังขละบุรี</span>
                    <span className="text-emerald-400/50">·</span>
                    <span className="text-emerald-200 font-mono">รอบบัญชี{currentPeriodMonth} {currentPeriodYear}</span>
                    <span className="text-emerald-400/50">·</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-medium hidden sm:inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Firebase Firestore เชื่อมต่อแล้ว
                    </span>
                  </div>

                  {/* Large, Eye-catching Head Title */}
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-snug text-white">
                    ระบบสารสนเทศบริหารจัดการทะเบียนคุมลูกหนี้ทางการแพทย์ โรงพยาบาลสังขละบุรี (SKB Management System)
                  </h1>

                  <p className="text-xs sm:text-sm text-emerald-100/90 font-normal">
                    ทะเบียนคุม 52 สิทธิการรักษาพยาบาล · ตรวจสอบสถานะการเงินเรียลไทม์ · นำเข้าข้อมูลเปรียบเทียบ & คำนวณผลต่าง · พิมพ์รายงานมาตรฐานราชการ
                  </p>
                </div>
              </div>

              {/* Right Quick Summary Badge */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-2.5 shrink-0 border-t lg:border-t-0 lg:border-l border-white/15 pt-3 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-xs text-emerald-300 block font-medium">
                    ยอดลูกหนี้ยกไปรวม (52 สิทธิ)
                  </span>
                  <span className="font-mono text-lg sm:text-2xl font-bold text-white tracking-tight">
                    {totalCarriedForward.toLocaleString('th-TH', { minimumFractionDigits: 2 })}{' '}
                    <span className="text-xs sm:text-sm font-sans text-emerald-300 font-normal">บาท</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-semibold">
                    52 สิทธิครบถ้วน
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/20 text-[11px] font-medium">
                    {activeUser.name.replace('นายแพทย์', 'นพ.').replace('นางสาว', 'น.ส.')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Viewport Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              rights={rights}
              onNavigateToLedger={handleNavigateToLedger}
              onNavigateToReport={() => setActiveTab('report')}
              onExportExcel={handleExportExcel}
              onOpenEdit={(d) => setEditingDebtor(d)}
              onNavigateToReconciliation={() => setActiveTab('reconciliation')}
            />
          )}

          {activeTab === 'ledger' && (
            <DebtorsLedgerView
              key={`ledger-${ledgerInitialOverdue}-${ledgerInitialCategory}-${currentPeriodMonth}-${currentPeriodYear}`}
              rights={rights}
              onOpenEdit={(d) => setEditingDebtor(d)}
              onExportExcel={handleExportExcel}
              onResetData={handleResetData}
              initialFilterOverdue={ledgerInitialOverdue}
              initialCategory={ledgerInitialCategory}
              currentUser={activeUser}
              monthlyArchives={monthlyArchives}
              onSaveMonthlyArchive={handleSaveMonthlyArchive}
              onLoadArchive={handleLoadArchive}
              currentPeriodMonth={currentPeriodMonth}
              currentPeriodYear={currentPeriodYear}
              currentAccountingDate={currentAccountingDate}
              onChangePeriod={handleChangePeriod}
              onAddNotifLog={handleAddNotifLog}
            />
          )}

          {activeTab === 'report' && (
            <OfficialReportView
              rights={rights}
              signatures={signatures}
              onUpdateSignatures={handleUpdateSignatures}
              onExportExcel={handleExportExcel}
              currentUser={activeUser}
            />
          )}

          {activeTab === 'reconciliation' && (
            <ReconciliationView
              rights={rights}
              onApplyReconciliation={handleUpdateAllRights}
              currentUser={activeUser}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationSettingsView
              config={notifConfig}
              onSaveConfig={handleUpdateNotifConfig}
              logs={notifLogs}
              onAddLog={handleAddNotifLog}
              currentUser={activeUser}
              totalCarriedForward={totalCarriedForward}
            />
          )}

          {activeTab === 'users' && (
            <UserManagementView
              users={users}
              activeUser={activeUser}
              onLogout={handleLogout}
              onUpdateUsers={handleUpdateUsers}
            />
          )}

          {activeTab === 'backup' && (
            <BackupSyncView
              rights={rights}
              signatures={signatures}
              history={backupHistory}
              onAddHistory={handleAddBackupHistory}
              onRestoreData={handleUpdateAllRights}
              cloudSyncEnabled={cloudSyncEnabled}
              onToggleCloudSync={setCloudSyncEnabled}
            />
          )}
        </main>

        {/* Quiet Government Footer */}
        <footer className="no-print border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <HospitalLogo size={24} />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                โรงพยาบาลสังขละบุรี (Sangkhlaburi Hospital) · จังหวัดกาญจนบุรี
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              ทะเบียนคุมลูกหนี้ทางการแพทย์ 52 สิทธิ · ฐานข้อมูล Cloud Firestore · ปีงบประมาณ 2569
            </div>
          </div>
        </footer>
      </div>

      {/* Edit Debtor Figure Modal */}
      <EditDebtorModal
        isOpen={!!editingDebtor}
        onClose={() => setEditingDebtor(null)}
        debtor={editingDebtor}
        onSave={handleUpdateDebtor}
        currentUser={activeUser}
      />
    </div>
  );
}

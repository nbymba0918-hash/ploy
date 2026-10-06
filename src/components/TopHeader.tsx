import React from 'react';
import { AppUser } from '../types';
import {
  Menu,
  ShieldAlert,
  Moon,
  Sun,
  Printer,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react';

interface TopHeaderProps {
  activeTab: string;
  onOpenMobileMenu: () => void;
  currentUser: AppUser;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  overdueCount: number;
  onSelectTab: (tab: string) => void;
  onExportExcel: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  currentUser,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  overdueCount,
  onSelectTab,
  onExportExcel,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'แดชบอร์ดภาพรวมสถานะการเงิน';
      case 'ledger':
        return 'ทะเบียนคุมลูกหนี้ 52 สิทธิการรักษาพยาบาล';
      case 'report':
        return 'รายงานสรุปการเรียกเก็บลูกหนี้เสนอผู้บริหาร';
      case 'reconciliation':
        return 'นำเข้าข้อมูลเปรียบเทียบ & คำนวณผลต่าง';
      case 'notifications':
        return 'ระบบแจ้งเตือนผ่าน SMS และ Email';
      case 'users':
        return 'ระบบจัดการผู้ใช้งานตามลำดับชั้น (RBAC)';
      case 'backup':
        return 'ระบบสำรองข้อมูลอัตโนมัติ & Cloud Sync';
      default:
        return 'ระบบสารสนเทศ รพ.สังขละบุรี';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Mobile Hamburger & Current Page Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="เปิดเมนูด้านซ้าย"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold tracking-wider uppercase hidden sm:block">
                โรงพยาบาลสังขละบุรี · SKB Management System
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {getTabTitle()}
              </h2>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Urgent Overdue Alert Button */}
            {overdueCount > 0 && (
              <button
                onClick={() => onSelectTab('ledger')}
                title={`แจ้งเตือน: มีลูกหนี้ค้างเกิน 30 วัน ${overdueCount} รายการ`}
                className="animate-urgent-flash flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-transform active:scale-95 shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">หนี้เกิน 1 เดือน</span>
                <span className="bg-white/20 px-1 rounded-sm text-[10px]">{overdueCount}</span>
              </button>
            )}

            {/* Print View Shortcut */}
            <button
              onClick={() => onSelectTab('report')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title="เปิดมุมมองรายงานเสนอผู้บริหาร"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-600" />
              <span>พิมพ์รายงาน</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด (ถนอมสายตา/เวรดึก)'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div
                onClick={() => onSelectTab('users')}
                className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors"
                title={`เข้าสู่ระบบโดย: ${currentUser.name} (${currentUser.roleTitle})`}
              >
                {currentUser.name.slice(0, 1)}
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="ออกจากระบบ (Log Out)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

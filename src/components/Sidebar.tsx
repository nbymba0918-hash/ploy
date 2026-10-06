import React from 'react';
import { HospitalLogo } from './HospitalLogo';
import { AppUser } from '../types';
import {
  LayoutDashboard,
  TableProperties,
  Printer,
  GitCompare,
  Bell,
  Users,
  Database,
  ShieldAlert,
  Moon,
  Sun,
  Cloud,
  ChevronRight,
  UserCheck,
  X,
  FileSpreadsheet,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: AppUser;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  overdueCount: number;
  cloudSyncEnabled: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onExportExcel: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  overdueCount,
  cloudSyncEnabled,
  isOpenMobile,
  onCloseMobile,
  onExportExcel,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ดภาพรวม', icon: LayoutDashboard },
    { id: 'ledger', label: 'ทะเบียนคุม 52 สิทธิ', icon: TableProperties, badge: overdueCount },
    { id: 'report', label: 'รายงานเสนอ ผอ.', icon: Printer },
    { id: 'reconciliation', label: 'นำเข้าข้อมูลเปรียบเทียบ', icon: GitCompare },
    { id: 'notifications', label: 'แจ้งเตือน SMS/Email', icon: Bell },
    { id: 'users', label: 'ผู้ใช้งาน & สิทธิ์', icon: Users },
    { id: 'backup', label: 'สำรองข้อมูล & คลาวด์', icon: Database },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 xl:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out no-print ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Area: Logo & Hospital Name */}
        <div className="flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HospitalLogo size={42} />
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-slate-900 dark:text-white">
                  รพ.สังขละบุรี
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold tracking-wide">
                  SKB Management System
                </span>
                <span className="text-[10px] text-slate-400">
                  ทะเบียนคุมลูกหนี้ 52 สิทธิ
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-270px)]">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              เมนูหลักการทำงาน
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-rose-500 text-white'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
                  ) : null}
                </button>
              );
            })}

            {/* Quick Export Button in Sidebar */}
            <div className="pt-2">
              <button
                onClick={onExportExcel}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-200/80 dark:border-emerald-800/40"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>ส่งออก Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Area: User Profile, Logout & System Status */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 space-y-3">
          {/* Active User Card with Logout Button */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ผู้ใช้งานปัจจุบัน
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {currentUser.role === 'executive'
                  ? 'ผอ.รพ.'
                  : currentUser.role === 'statistician'
                  ? 'เวชสถิติ'
                  : currentUser.role === 'accountant'
                  ? 'การเงิน'
                  : 'แอดมิน'}
              </span>
            </div>

            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mb-2">
              {currentUser.roleTitle}
            </div>

            {/* Logout Button (Replacing Switch User Selector) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <button
                onClick={onLogout}
                className="w-full py-1.5 px-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 rounded-lg transition-all border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-center gap-2 active:scale-98"
                title="ออกจากระบบ เพื่อลงชื่อเข้าใช้ด้วยบัญชีอื่น"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>ออกจากระบบ (Log Out)</span>
              </button>
            </div>
          </div>

          {/* Quick System Bar: Cloud & Dark Mode */}
          <div className="flex items-center justify-between px-1 text-xs">
            {/* Cloud Status */}
            <div
              title="เชื่อมต่อฐานข้อมูล Firebase Firestore แบบเรียลไทม์"
              className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-emerald-700 dark:text-emerald-400">Firebase Cloud</span>
            </div>

            {/* Dark Mode Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
              title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด (ถนอมสายตาเวรดึก)'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDarkMode ? 'สว่าง' : 'โหมดมืด'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

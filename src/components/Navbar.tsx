import React from 'react';
import { HospitalLogo } from './HospitalLogo';
import { AppUser } from '../types';
import {
  Moon,
  Sun,
  ShieldAlert,
  Cloud,
  UserCheck,
  ChevronDown,
  LayoutDashboard,
  TableProperties,
  Printer,
  GitCompare,
  Bell,
  Users,
  Database,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: AppUser;
  allUsers: AppUser[];
  onSwitchUser: (user: AppUser) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  overdueCount: number;
  cloudSyncEnabled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  allUsers,
  onSwitchUser,
  isDarkMode,
  onToggleDarkMode,
  overdueCount,
  cloudSyncEnabled,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'ledger', label: 'ทะเบียนคุม 52 สิทธิ', icon: TableProperties },
    { id: 'report', label: 'รายงานเสนอ ผอ.', icon: Printer },
    { id: 'reconciliation', label: 'นำเข้าข้อมูลเปรียบเทียบ', icon: GitCompare },
    { id: 'notifications', label: 'แจ้งเตือน SMS/Email', icon: Bell },
    { id: 'users', label: 'ผู้ใช้งาน', icon: Users },
    { id: 'backup', label: 'สำรองข้อมูล', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark with Hospital Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3 text-left group focus:outline-hidden"
            >
              <HospitalLogo size={38} />
              <div className="hidden sm:block">
                <span className="font-bold text-sm lg:text-base leading-tight tracking-tight text-slate-900 dark:text-white block group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  รพ.สังขละบุรี
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-normal block">
                  ระบบทะเบียนคุมลูกหนี้ 52 สิทธิ (SKB)
                </span>
              </div>
            </button>

            {/* Cloud Status Indicator Chip */}
            <div
              title={cloudSyncEnabled ? 'Cloud Sync พร้อมใช้งาน' : 'Cloud Sync ออฟไลน์'}
              className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 ml-2"
            >
              <span className={`w-2 h-2 rounded-full ${cloudSyncEnabled ? 'bg-emerald-500' : 'bg-slate-400'} animate-pulse`} />
              <span>Cloud Sync</span>
            </div>
          </div>

          {/* Zone 2: Primary Nav Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.id === 'ledger' && overdueCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Urgent Overdue Alert Button */}
            {overdueCount > 0 && (
              <button
                onClick={() => onSelectTab('ledger')}
                title={`แจ้งเตือน: มีลูกหนี้ค้างเกิน 30 วัน ${overdueCount} รายการ`}
                className="animate-urgent-flash flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-transform active:scale-95"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">หนี้เกิน 1 เดือน</span>
                <span className="bg-white/20 px-1 rounded-sm text-[10px]">{overdueCount}</span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด (ถนอมสายตา/เวรดึก)'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick User Switcher Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="hidden md:block max-w-[120px] lg:max-w-[150px] truncate">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser.name.replace('นายแพทย์', 'นพ.').replace('นางสาว', 'น.ส.')}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.role === 'executive'
                      ? 'รักษาการ ผอ.'
                      : currentUser.role === 'statistician'
                      ? 'เวชสถิติ'
                      : currentUser.role === 'accountant'
                      ? 'การเงิน/ธุรการ'
                      : 'Admin'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 hidden group-hover:block hover:block z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  สลับผู้ใช้งานทันที (RBAC Switch)
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{u.roleTitle}</div>
                    </div>
                    {u.id === currentUser.id && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-emerald-600" />
                  <span>{item.label}</span>
                </div>
                {item.id === 'ledger' && overdueCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white">
                    {overdueCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

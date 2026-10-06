import React, { useState } from 'react';
import { HospitalLogo } from './HospitalLogo';
import { AppUser } from '../types';
import { INITIAL_USERS } from '../data/initialRights';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Building2,
  Sparkles,
  Server,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [selectedStaff, setSelectedStaff] = useState<AppUser>(INITIAL_USERS[0]);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'role' | 'google' | 'credentials'>('role');

  // Handle Quick Staff Role Sign-in
  const handleStaffLogin = (user: AppUser) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(user);
    }, 400);
  };

  // Handle Google Login with Firebase Popup
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const matchedUser: AppUser = {
        id: fbUser.uid,
        name: fbUser.displayName || 'บุคลากร รพ.สังขละบุรี',
        email: fbUser.email || 'staff@moph.mail.go.th',
        role: fbUser.email?.includes('director') ? 'executive' : 'accountant',
        roleTitle: 'เจ้าหน้าที่ผู้มีสิทธิ์เข้าถึงระบบสารสนเทศ รพ.สังขละบุรี',
        department: 'งานประกันสุขภาพ โรงพยาบาลสังขละบุรี',
        phone: fbUser.phoneNumber || '034-595-032',
      };
      onLoginSuccess(matchedUser);
    } catch (err: any) {
      console.warn('Google sign-in exception:', err);
      // Fallback friendly message if popup is closed or blocked
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('การเข้าสู่ระบบผ่าน Google ถูกยกเลิกโดยผู้ใช้');
      } else {
        setErrorMessage(
          'ไม่สามารถเชื่อมต่อ Google Sign-In ได้ในหน้าต่างนี้ กรุณาเลือกเข้าสู่ระบบด้วยตำแหน่งบุคลากรด้านล่าง'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Form Submit
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Find matching staff by email or default to accountant
      const match = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === emailInput.toLowerCase()
      );
      if (match) {
        onLoginSuccess(match);
      } else {
        onLoginSuccess(selectedStaff);
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden backdrop-blur-md">
        {/* Top Header Section */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-emerald-900/40 via-transparent to-transparent border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700">
              <HospitalLogo size={70} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>โรงพยาบาลสังขละบุรี · สำนักงานปลัดกระทรวงสาธารณสุข</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            ระบบสารสนเทศบริหารจัดการทะเบียนคุมลูกหนี้ทางการแพทย์
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            (SKB Management System · Medical Debtors Registry)
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <Server className="w-3.5 h-3.5 text-emerald-600" />
            <span>เชื่อมต่อฐานข้อมูล Cloud Firestore & Firebase Auth</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Method 1: Hospital Staff Role Quick Login (Preferred for Testing & Staff) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                เลือกเข้าสู่ระบบตามตำแหน่งบุคลากร:
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ระบุตัวตนรายบุคคล
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {INITIAL_USERS.map((user) => {
                const isSelected = selectedStaff.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedStaff(user);
                      handleStaffLogin(user);
                    }}
                    disabled={isSubmitting}
                    className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'border-2 border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {user.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.roleTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {user.role === 'executive'
                          ? 'ผู้บริหาร'
                          : user.role === 'statistician'
                          ? 'เวชสถิติ'
                          : user.role === 'accountant'
                          ? 'การเงิน'
                          : 'แอดมิน'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="shrink-0 mx-4 text-[11px] text-slate-400 uppercase font-semibold">หรือเข้าสู่ระบบด้วยช่องทางอื่น</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Method 2: Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 transition-all flex items-center justify-center gap-3 shadow-2xs active:scale-98"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>เข้าสู่ระบบด้วย Google Workspace / บัญชีทางการ</span>
          </button>
        </div>

        {/* Security Footer Notice */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            มาตรฐานความปลอดภัยข้อมูลสารสนเทศ รพ.สังขละบุรี
          </span>
          <span className="font-mono text-slate-400">Firebase v11.x</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import {
  Users,
  Shield,
  UserCheck,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  KeyRound,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

interface UserManagementViewProps {
  users: AppUser[];
  activeUser: AppUser;
  onLogout?: () => void;
  onUpdateUsers: (users: AppUser[]) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  activeUser,
  onLogout,
  onUpdateUsers,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('accountant');
  const [newTitle, setNewTitle] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const permissions = [
    {
      action: 'ดูแดชบอร์ด & วิเคราะห์ยอดลูกหนี้',
      roles: ['executive', 'statistician', 'accountant', 'superadmin'],
    },
    {
      action: 'บันทึกรับชำระ / ตั้งหนี้ใหม่ / ตัดหนี้สูญ',
      roles: ['accountant', 'superadmin'],
    },
    {
      action: 'ตรวจสอบความถูกต้อง & เปรียบเทียบข้อมูล HIS',
      roles: ['statistician', 'superadmin'],
    },
    {
      action: 'ลงนามดิจิทัล / รับรองรายงานเสนอ ผอ.',
      roles: ['executive', 'superadmin'],
    },
    {
      action: 'ส่งแจ้งเตือน SMS / Email หาผู้บริหาร',
      roles: ['executive', 'statistician', 'accountant', 'superadmin'],
    },
    {
      action: 'นำเข้าไฟล์ / กู้คืนข้อมูล (Restore) / Backup',
      roles: ['superadmin', 'statistician', 'accountant'],
    },
    {
      action: 'จัดการสิทธิ์ผู้ใช้งาน (User & Role Config)',
      roles: ['superadmin'],
    },
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: newName,
      role: newRole,
      roleTitle: newTitle,
      email: newEmail,
      phone: newPhone,
      department: newDept,
    };
    onUpdateUsers([...users, newUser]);
    setShowAddModal(false);
    setNewName('');
    setNewTitle('');
    setNewEmail('');
    setNewPhone('');
    setNewDept('');
    setSuccessMsg(`เพิ่มผู้ใช้งาน "${newUser.name}" เรียบร้อยแล้ว`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (users.length <= 1) {
      alert('ไม่สามารถลบผู้ใช้คนสุดท้ายได้');
      return;
    }
    if (window.confirm(`ยืนยันการลบผู้ใช้ ${name} ออกจากระบบ?`)) {
      const remaining = users.filter((u) => u.id !== id);
      onUpdateUsers(remaining);
      if (activeUser.id === id && onLogout) {
        onLogout();
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'executive':
        return {
          label: 'ผู้บริหาร (ผู้อำนวยการ)',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
        };
      case 'statistician':
        return {
          label: 'เจ้าพนักงานเวชสถิติ',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
        };
      case 'accountant':
        return {
          label: 'เจ้าหน้าที่การเงิน/ธุรการ',
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        };
      case 'superadmin':
        return {
          label: 'ผู้ดูแลระบบ (Super Admin)',
          color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase">
            <Shield className="w-4 h-4" />
            ระบบความปลอดภัยและสิทธิ์การเข้าถึง (RBAC)
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            จัดการผู้ใช้งานตามลำดับชั้นข้อมูล รพ.สังขละบุรี
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            กำหนดบทบาทหน้าที่ 4 ลำดับชั้นอย่างเคร่งครัด พร้อมระบบรักษาความปลอดภัยผ่านการ Login / Logout
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          เพิ่มผู้ใช้งานใหม่
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {users.map((u) => {
          const isActive = u.id === activeUser.id;
          const badge = getRoleBadge(u.role);
          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl border transition-all relative bg-white dark:bg-slate-900 ${
                isActive
                  ? 'border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300'
              }`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  กำลังใช้งาน
                </span>
              )}

              <div className="space-y-3">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${badge.color}`}>
                    {badge.label}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-tight">
                    {u.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {u.roleTitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>สังกัด:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 max-w-[140px] truncate">
                      {u.department}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>เบอร์โทร:</span>
                    <span className="font-mono">{u.phone}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  {!isActive ? (
                    <button
                      onClick={onLogout}
                      className="w-full py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-rose-200/60 dark:border-rose-900/40"
                      title="ออกจากระบบ เพื่อลงชื่อเข้าใช้ด้วยบัญชีนี้"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      ออกจากระบบเพื่อสลับบัญชี
                    </button>
                  ) : (
                    <div className="w-full py-1.5 text-xs text-center font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      บัญชีปัจจุบันที่เข้าใช้งานอยู่
                    </div>
                  )}

                  {users.length > 1 && u.role !== 'superadmin' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                      title="ลบผู้ใช้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            ตารางกำหนดสิทธิ์การเข้าถึงฟังก์ชัน (Role Permission Matrix)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            จำแนกสิทธิ์อย่างเคร่งครัดตามสายการบังคับบัญชาและบทบาทงานประกันสุขภาพ รพ.สังขละบุรี
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">ฟังก์ชัน / สิทธิ์การดำเนินการ</th>
                <th className="py-3 px-3 text-center">ผอ.รพ. (Executive)</th>
                <th className="py-3 px-3 text-center">เจ้าพนักงานเวชสถิติ</th>
                <th className="py-3 px-3 text-center">การเงิน/ธุรการ</th>
                <th className="py-3 px-3 text-center">ผู้ดูแลระบบ (Admin)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {p.action}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.roles.includes('executive') ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.roles.includes('statistician') ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.roles.includes('accountant') ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.roles.includes('superadmin') ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 text-xs text-slate-800 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                เพิ่มผู้ใช้งานใหม่
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block font-medium mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น นายแพทย์สมชาย ใจดี"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">บทบาทหน้าที่ (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <option value="accountant">เจ้าหน้าที่การเงิน / ธุรการ</option>
                  <option value="statistician">เจ้าพนักงานเวชสถิติชำนาญงาน</option>
                  <option value="executive">ผู้บริหาร / ผู้อำนวยการ รพ.</option>
                  <option value="superadmin">ผู้ดูแลระบบสารสนเทศ (Super Admin)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">ตำแหน่งตามหนังสือราชการ</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เจ้าหน้าที่ธุรการปฏิบัติงาน"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">เบอร์มือถือ</label>
                  <input
                    type="text"
                    required
                    placeholder="08X-XXX-XXXX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">อีเมล</label>
                  <input
                    type="email"
                    required
                    placeholder="name@moph.mail.go.th"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">กลุ่มงาน / สังกัด</label>
                <input
                  type="text"
                  required
                  placeholder="งานประกันสุขภาพ โรงพยาบาลสังขละบุรี"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  บันทึกผู้ใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

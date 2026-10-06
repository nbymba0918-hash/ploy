import React, { useState, useEffect } from 'react';
import { DebtorRight, AppUser } from '../types';
import { X, Calculator, Check, AlertCircle } from 'lucide-react';

interface EditDebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtor: DebtorRight | null;
  onSave: (updated: DebtorRight) => void;
  currentUser: AppUser;
}

export const EditDebtorModal: React.FC<EditDebtorModalProps> = ({
  isOpen,
  onClose,
  debtor,
  onSave,
  currentUser,
}) => {
  const [broughtForward, setBroughtForward] = useState<number>(0);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [badDebtAmount, setBadDebtAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [daysOverdue, setDaysOverdue] = useState<number>(0);

  useEffect(() => {
    if (debtor) {
      setBroughtForward(debtor.broughtForward);
      setNewAmount(debtor.newAmount);
      setPaidAmount(debtor.paidAmount);
      setBadDebtAmount(debtor.badDebtAmount || 0);
      setRemarks(debtor.remarks || '');
      setDaysOverdue(debtor.daysOverdue || 0);
    }
  }, [debtor]);

  if (!isOpen || !debtor) return null;

  // Auto calculate carried forward
  const calculatedCarriedForward = Number(
    (broughtForward + newAmount - paidAmount - badDebtAmount).toFixed(2)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...debtor,
      broughtForward,
      newAmount,
      paidAmount,
      badDebtAmount,
      carriedForward: calculatedCarriedForward,
      remarks,
      daysOverdue,
      lastUpdated: new Date().toISOString(),
    });
    onClose();
  };

  const isReadOnly = currentUser.role === 'statistician' && false; // all can edit or inspect, but show badge

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                {debtor.code}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {debtor.category === 'gov' ? 'หมวด 1 ภาครัฐ' : 'หมวด 2 บุคคลภายนอก'}
              </span>
            </div>
            <h3 className="font-semibold text-base mt-1 text-slate-900 dark:text-white line-clamp-1">
              {debtor.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Formula Callout */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
            <Calculator className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-medium">สูตรคำนวณอัตโนมัติ (ตามระเบียบ รพ.สังขละบุรี):</p>
              <p className="font-mono text-[11px] mt-0.5 text-emerald-700 dark:text-emerald-400">
                ยกไป = ยกมา ({broughtForward.toLocaleString('th-TH')}) + ตั้งใหม่ ({newAmount.toLocaleString('th-TH')}) - รับชำระ ({paidAmount.toLocaleString('th-TH')}) - ตัดหนี้สูญ ({badDebtAmount.toLocaleString('th-TH')})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Brought Forward */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                1. ยอดลูกหนี้ยกมา (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={broughtForward}
                onChange={(e) => setBroughtForward(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-right font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* New Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                2. ยอดลูกหนี้ของเดือน/ตั้งใหม่ (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-right font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                3. ยอดรับชำระระหว่างเดือน (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-right font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Bad Debt Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                4. ยอดตัดหนี้สูญ (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                value={badDebtAmount}
                onChange={(e) => setBadDebtAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-right font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Result: Carried Forward (Computed) */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                ยอดลูกหนี้ยกไปคงเหลือคำนวณสุทธิ
              </span>
              <span className="text-xs text-slate-400">
                ณ สิ้นเดือน 31 สิงหาคม 2569
              </span>
            </div>
            <div className="text-right">
              <span
                className={`font-mono font-bold text-xl ${
                  calculatedCarriedForward > 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {calculatedCarriedForward.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">บาท</span>
            </div>
          </div>

          {/* Overdue Days & Remarks */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                วันค้างชำระ
              </label>
              <input
                type="number"
                value={daysOverdue}
                onChange={(e) => setDaysOverdue(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-center font-mono text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {daysOverdue > 30 && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> เกิน 30 วัน (เร่งด่วน)
                </span>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                หมายเหตุ / สถานะการติดตาม
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="เช่น รอโอนจาก e-Claim / ออกหนังสือเตือน"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* User stamp indicator */}
          <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
            บันทึกโดย: {currentUser.name} ({currentUser.roleTitle.split(' ')[0]})
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

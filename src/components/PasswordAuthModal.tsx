import React, { useState, useEffect, useRef } from 'react';
import { Lock, X, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordAuthModal: React.FC<Props> = ({
  isOpen,
  title = '管理員權限驗證',
  description = '此操作需要管理員權限，請輸入管理員密碼：',
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setShowPassword(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = password.trim().toLowerCase();
    if (cleanInput === 'admin') {
      setError(false);
      onClose();
      // Ensure state updates unmount modal cleanly before triggering onSuccess action
      setTimeout(() => {
        onSuccess();
      }, 50);
    } else {
      setError(true);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/80 rounded-xl text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{title}</h3>
              <p className="text-xs text-indigo-200 mt-0.5">請驗證管理員身份 (管理者專用)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>{description}</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              管理員密碼
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="請輸入密碼"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-500 focus:ring-rose-200 text-rose-900'
                    : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>密碼錯誤，請重新輸入 (預設管理員密碼：admin)</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>解鎖並繼續</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

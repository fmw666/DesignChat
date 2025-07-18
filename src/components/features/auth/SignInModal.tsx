/**
 * @file SignInModal.tsx
 * @description Modal for user sign-in with invite code, email verification, and animated UI.
 * @author fmw666@github
 * @date 2025-07-18
 */

// =================================================================================================
// Imports
// =================================================================================================

// --- Core Libraries ---
import { useState, useEffect, useCallback, FormEvent } from 'react';

// --- Core-related Libraries ---
import { useTranslation } from 'react-i18next';

// --- Third-party Libraries ---
import { EnvelopeIcon, KeyIcon, TicketIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// --- Internal Libraries ---
// --- Components ---
import { Modal } from '@/components/shared/common/Modal';
// --- Hooks ---
import { useAuth } from '@/hooks/auth';

// =================================================================================================
// Type Definitions
// =================================================================================================

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// =================================================================================================
// Constants
// =================================================================================================

const INVITE_CODE = import.meta.env.VITE_AUTH_INVITE_CODE || 'designchat';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_COUNTDOWN = 60;

// =================================================================================================
// Component
// =================================================================================================

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // --- State and Refs ---
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [isInviteVerified, setIsInviteVerified] = useState(false);

  // --- Hooks ---
  const { t } = useTranslation();
  const { sendVerificationCode, verifyCode } = useAuth();

  // --- Logic and Event Handlers ---
  const setErrorMessage = useCallback((message: string | null) => {
    setError(message);
    if (message) setErrorKey((prev) => prev + 1);
  }, []);

  const handleInviteVerification = useCallback(() => {
    setErrorMessage(null);
    if (inviteCode === INVITE_CODE) {
      setIsInviteVerified(true);
    } else {
      setErrorMessage(t('auth.signIn.inviteCode.invalid'));
    }
  }, [inviteCode, setErrorMessage, t]);

  const handleSendCode = useCallback(async () => {
    if (!isInviteVerified) {
      setErrorMessage(t('auth.signIn.inviteCode.required'));
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage(t('auth.signIn.email.invalid'));
      return;
    }
    try {
      setErrorMessage(null);
      setIsSendingCode(true);
      await sendVerificationCode(email);
      setCountdown(VERIFICATION_CODE_COUNTDOWN);
    } catch (err) {
      setErrorMessage(t('auth.signIn.verificationCode.sendFailed'));
    } finally {
      setIsSendingCode(false);
    }
  }, [isInviteVerified, email, sendVerificationCode, t, setErrorMessage]);

  const handleSignIn = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!isInviteVerified) {
      setErrorMessage(t('auth.signIn.inviteCode.required'));
      return;
    }
    if (!email || !verificationCode) {
      setErrorMessage(t('auth.signIn.verificationCode.required'));
      return;
    }
    setIsSubmitting(true);
    try {
      await verifyCode(email, verificationCode);
      onSuccess?.();
      onClose();
      setEmail('');
      setVerificationCode('');
      setInviteCode('');
      setIsInviteVerified(false);
    } catch (err) {
      setErrorMessage(t('auth.signIn.verificationCode.invalid'));
    } finally {
      setIsSubmitting(false);
    }
  }, [isInviteVerified, email, verificationCode, verifyCode, onSuccess, onClose, t, setErrorMessage]);

  // --- Side Effects ---
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // --- Render Logic ---
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      closeOnBackdropClick={false}
    >
      {/* 欢迎文本与动画背景 */}
      <div className="relative mb-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 overflow-hidden"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl backdrop-blur-sm" 
          />
          <div className="absolute inset-0 dark:from-gray-900/50 dark:to-gray-900/50 backdrop-blur-[2px]" />
        </motion.div>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-center relative z-10 px-6 py-2 rounded-2xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3 drop-shadow-sm"
            >
              {t('auth.signIn.subtitle')}
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="flex items-center justify-center gap-2 mb-4"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-300/80 dark:via-gray-600/80 to-transparent" />
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {t('auth.signIn.description')}
              </span>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-gray-300/80 dark:via-gray-600/80 to-transparent" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400"
            >
              <div className="flex items-center gap-1.5 bg-white/30 dark:bg-gray-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>安全可靠</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300/50 dark:bg-gray-600/50" />
              <div className="flex items-center gap-1.5 bg-white/30 dark:bg-gray-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
                <span>简单易用</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300/50 dark:bg-gray-600/50" />
              <div className="flex items-center gap-1.5 bg-white/30 dark:bg-gray-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 dark:bg-pink-400" />
                <span>功能强大</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* 错误提示 */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key={errorKey}
            initial={{ opacity: 0, y: -8, scale: 0.98, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: 'spring', stiffness: 1000, damping: 20, mass: 0.3, duration: 0.12 } }}
            exit={{ opacity: 0, y: -8, scale: 0.98, rotateX: -10, transition: { duration: 0.1 } }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 text-sm rounded-lg shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      {/* 表单 */}
      <form onSubmit={handleSignIn} className="space-y-6">
        {/* 邀请码输入框 */}
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.signIn.inviteCode.label')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <TicketIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder={t('auth.signIn.inviteCode.placeholder')}
              disabled={isInviteVerified}
              className={`block w-full outline-none pl-10 pr-32 py-3.5 border ${
                isInviteVerified ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:text-gray-400' : 'border-gray-200 dark:border-gray-800'
              } rounded-xl bg-white dark:bg-gray-900 shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-base dark:text-gray-100`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={handleInviteVerification}
                disabled={isInviteVerified || !inviteCode}
                className={`text-sm font-medium ${
                  isInviteVerified || !inviteCode
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500'
                }`}
              >
                {isInviteVerified ? t('auth.signIn.inviteCode.verified') : t('auth.signIn.inviteCode.verify')}
              </button>
            </div>
          </div>
        </div>
        {/* 邮箱输入框 */}
        <div className={`transition-opacity duration-200 ${isInviteVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.signIn.email.label')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.signIn.email.placeholder')}
              disabled={!isInviteVerified}
              className="block w-full bg-white dark:bg-gray-900 outline-none pl-10 pr-3 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-base dark:text-gray-100"
            />
          </div>
        </div>
        {/* 验证码输入框 */}
        <div className={`transition-opacity duration-200 ${isInviteVerified ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('auth.signIn.verificationCode.label')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={t('auth.signIn.verificationCode.placeholder')}
              disabled={!isInviteVerified}
              className="block w-full bg-white dark:bg-gray-900 outline-none pl-10 pr-32 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-base dark:text-gray-100"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || !email || !isInviteVerified || isSendingCode}
                className={`text-sm font-medium ${
                  countdown > 0 || !email || !isInviteVerified || isSendingCode
                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500'
                }`}
              >
                {isSendingCode ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mr-1" />
                    {t('auth.signIn.verificationCode.sending')}
                  </div>
                ) : countdown > 0 ? (
                  t('auth.signIn.verificationCode.countdown', { count: countdown })
                ) : (
                  t('auth.signIn.verificationCode.send')
                )}
              </button>
            </div>
          </div>
        </div>
        {/* 登录按钮 */}
        <button
          type="submit"
          disabled={isSubmitting || !isInviteVerified || !email || !verificationCode}
          className={`w-full py-3.5 px-4 rounded-xl text-white font-medium text-base ${
            isSubmitting || !isInviteVerified || !email || !verificationCode
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {t('auth.signIn.submit.loading')}
            </div>
          ) : (
            t('auth.signIn.submit.default')
          )}
        </button>
      </form>
      {/* 底部提示 */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('auth.signIn.terms.prefix')}
          <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 mx-1">
            {t('auth.signIn.terms.terms')}
          </a>
          {t('auth.signIn.terms.and')}
          <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-500 mx-1">
            {t('auth.signIn.terms.privacy')}
          </a>
        </p>
      </div>
    </Modal>
  );
};

// =================================================================================================
// Default Export
// =================================================================================================

export default SignInModal;

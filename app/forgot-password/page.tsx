// app/forgot-password/ForgotPasswordPage.tsx
"use client";

import { useMemo, useState } from "react";
import styles from "./ForgotPassword.module.css";
import { requestResetOTP, verifyResetOTP, resetPassword } from "../../lib/authApi";
import { useRouter } from "next/navigation";

type Notice = { type: "success" | "error" | "info"; text: string } | null;

/* -------- Validators -------- */
const validateEmail = (v: string) => {
  const val = v.trim().toLowerCase();
  if (!val) return "Vui lòng nhập email.";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  return ok ? "" : "Email không hợp lệ.";
};

const validateOTP = (v: string) => {
  const val = v.trim();
  if (!val) return "Vui lòng nhập mã OTP.";
  // đa số OTP là 4–6 số; cho linh hoạt 4–8
  return /^\d{4,8}$/.test(val) ? "" : "OTP phải là 4–8 chữ số.";
};

const validatePassword = (v: string) => {
  if (!v) return "Vui lòng nhập mật khẩu.";
  if (v.length < 8) return "Mật khẩu phải từ 8 ký tự.";
  if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return "Mật khẩu cần cả chữ và số.";
  if (/\s/.test(v)) return "Mật khẩu không chứa khoảng trắng.";
  return "";
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [touched, setTouched] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [notice, setNotice] = useState<Notice>(null);
  const [submitting, setSubmitting] = useState(false);

  /* -------- Field errors (realtime) -------- */
  const emailErr = useMemo(() => validateEmail(email), [email]);
  const otpErr = useMemo(() => validateOTP(otp), [otp]);
  const pwErr = useMemo(() => validatePassword(newPassword), [newPassword]);
  const confirmErr = useMemo(() => {
    if (!confirmPassword) return "Vui lòng nhập lại mật khẩu.";
    if (confirmPassword !== newPassword) return "Mật khẩu xác nhận không khớp.";
    return "";
  }, [confirmPassword, newPassword]);

  /* -------- Per-step submit handlers -------- */
  const submitStep1 = async () => {
    setTouched((t) => ({ ...t, email: true }));
    setNotice(null);
    if (emailErr) {
      setNotice({ type: "error", text: emailErr });
      return;
    }
    setSubmitting(true);
    try {
      const res = await requestResetOTP(email.trim().toLowerCase());
      const msg = (res as any)?.message || "Mã OTP đã được gửi đến email của bạn.";
      setNotice({ type: "success", text: msg });
      setStep(2);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gửi OTP thất bại.";
      setNotice({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const submitStep2 = async () => {
    setTouched((t) => ({ ...t, otp: true }));
    setNotice(null);
    if (otpErr) {
      setNotice({ type: "error", text: otpErr });
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyResetOTP(email.trim().toLowerCase(), otp.trim());
      const msg = (res as any)?.message || "OTP xác minh thành công.";
      setNotice({ type: "success", text: msg });
      setStep(3);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.";
      setNotice({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const submitStep3 = async () => {
    setTouched((t) => ({ ...t, newPassword: true, confirmPassword: true }));
    setNotice(null);
    if (pwErr || confirmErr) {
      setNotice({ type: "error", text: pwErr || confirmErr });
      return;
    }
    setSubmitting(true);
    try {
      const res = await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      const msg = (res as any)?.message || "Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...";
      setNotice({ type: "success", text: msg });
      setTimeout(() => router.push("/login"), 900);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Lỗi đặt lại mật khẩu.";
      setNotice({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  /* -------- Single onSubmit based on step -------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) submitStep1();
    else if (step === 2) submitStep2();
    else submitStep3();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.left}>
          <h1>Khôi phục mật khẩu 🔐</h1>
          <p>Chúng tôi sẽ giúp bạn lấy lại quyền truy cập nhanh chóng.</p>
          <img src="/images/reset-password.svg" alt="Reset Password" />
        </div>

        <form className={styles.form} noValidate onSubmit={handleSubmit}>
          <h2 className={styles.title}>Quên mật khẩu</h2>

          {/* Notice banner */}
          {notice && (
            <div
              className={`${styles.notice} ${
                notice.type === "success"
                  ? styles.noticeSuccess
                  : notice.type === "error"
                  ? styles.noticeError
                  : styles.noticeInfo
              }`}
              role="alert"
              aria-live="assertive"
            >
              {notice.text}
            </div>
          )}

          {/* Step 1: nhập email */}
          {(step === 1 || step === 2) && (
            <>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className={`${styles.input} ${touched.email && emailErr ? styles.invalid : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                required
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                disabled={step > 1}
                aria-invalid={!!(touched.email && emailErr)}
                aria-describedby="email-error"
              />
              {touched.email && emailErr && (
                <p id="email-error" className={styles.error} role="alert">
                  {emailErr}
                </p>
              )}
            </>
          )}

          {/* Step 1 button */}
          {step === 1 && (
            <button
              type="submit"
              className={styles.button}
              disabled={!!emailErr || submitting}
            >
              {submitting ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          )}

          {/* Step 2: nhập OTP */}
          {step === 2 && (
            <>
              <input
                type="text"
                placeholder="Nhập mã OTP"
                className={`${styles.input} ${touched.otp && otpErr ? styles.invalid : ""}`}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, otp: true }))}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{4,8}"
                aria-invalid={!!(touched.otp && otpErr)}
                aria-describedby="otp-error"
              />
              {touched.otp && otpErr && (
                <p id="otp-error" className={styles.error} role="alert">
                  {otpErr}
                </p>
              )}

              <button
                type="submit"
                className={styles.button}
                disabled={!!otpErr || submitting}
              >
                {submitting ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
            </>
          )}

          {/* Step 3: đặt mật khẩu mới */}
          {step === 3 && (
            <>
              <input
                type="password"
                placeholder="Mật khẩu mới"
                className={`${styles.input} ${touched.newPassword && pwErr ? styles.invalid : ""}`}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, newPassword: true }))}
                required
                minLength={8}
                autoComplete="new-password"
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$"
                aria-invalid={!!(touched.newPassword && pwErr)}
                aria-describedby="password-error"
              />
              {touched.newPassword && pwErr && (
                <p id="password-error" className={styles.error} role="alert">
                  {pwErr}
                </p>
              )}

              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className={`${styles.input} ${touched.confirmPassword && confirmErr ? styles.invalid : ""}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                required
                autoComplete="new-password"
                aria-invalid={!!(touched.confirmPassword && confirmErr)}
                aria-describedby="confirm-error"
              />
              {touched.confirmPassword && confirmErr && (
                <p id="confirm-error" className={styles.error} role="alert">
                  {confirmErr}
                </p>
              )}

              <button
                type="submit"
                className={styles.button}
                disabled={!!(pwErr || confirmErr) || submitting}
              >
                {submitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

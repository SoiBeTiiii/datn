// app/register/RegisterPage.tsx
"use client";

import { useMemo, useState } from "react";
import styles from "./Register.module.css";
import Link from "next/link";
import { register } from "../../lib/authApi";
import { useRouter } from "next/navigation";

/* ---------- Validators & helpers ---------- */
function validateEmail(v: string) {
  const val = v.trim().toLowerCase();
  if (!val) return "Vui lòng nhập email.";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  return ok ? "" : "Email không hợp lệ.";
}

function validatePassword(v: string) {
  if (!v) return "Vui lòng nhập mật khẩu.";
  if (v.length < 8) return "Mật khẩu phải từ 8 ký tự.";
  if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return "Mật khẩu cần cả chữ và số.";
  if (/\s/.test(v)) return "Mật khẩu không chứa khoảng trắng.";
  return "";
}

function normalizeVNPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("84")) return "+84" + digits.slice(2);
  if (digits.startsWith("0")) return "+84" + digits.slice(1);
  if (digits.length === 9) return "+84" + digits; // ví dụ "912345678"
  return input.trim();
}

function validateVNPhone(input: string) {
  const raw = input.trim();
  if (!raw) return "Vui lòng nhập số điện thoại.";
  const vnRegex = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/; // mobile VN
  return vnRegex.test(raw.replace(/\s/g, "")) || vnRegex.test(normalizeVNPhone(raw))
    ? ""
    : "Số điện thoại không hợp lệ (VN).";
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirm: false,
    phone: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();

  /* ---------- Field errors ---------- */
  const nameErr = useMemo(() => {
    const v = name.trim();
    if (!v) return "Vui lòng nhập họ và tên.";
    if (v.length < 2) return "Họ tên quá ngắn.";
    return "";
  }, [name]);

  const emailErr = useMemo(() => validateEmail(email), [email]);
  const passwordErr = useMemo(() => validatePassword(password), [password]);

  const confirmErr = useMemo(() => {
    if (!confirmPassword) return "Vui lòng nhập lại mật khẩu.";
    if (confirmPassword !== password) return "Mật khẩu xác nhận không khớp.";
    return "";
  }, [confirmPassword, password]);

  const phoneErr = useMemo(() => validateVNPhone(phone), [phone]);

  const formInvalid = !!(nameErr || emailErr || passwordErr || confirmErr || phoneErr);

  /* ---------- Submit ---------- */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true, phone: true });
    setServerError(null);

    if (formInvalid || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: normalizeVNPhone(phone),
        confirmPassword, // nếu BE yêu cầu
      };

      const res = (await register(payload)) as { success: boolean; message?: string };

      if (res.success) {
        localStorage.setItem("verify_email", payload.email);
        router.push("/verify-otp");
      } else {
        if (res.message?.includes("OTP")) {
          localStorage.setItem("verify_email", payload.email);
          router.push("/verify-otp");
        } else {
          setServerError(res.message || "Đăng ký thất bại.");
        }
      }
    } catch (err: any) {
      setServerError(err?.message || "Đã có lỗi xảy ra khi đăng ký.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.leftPanel}>
          <h1>Tạo tài khoản mới ✨</h1>
          <p>Gia nhập cộng đồng yêu làm đẹp và nhận ưu đãi độc quyền!</p>
          <img src="/images/register-illustration.svg" alt="Register" />
          <Link className={styles.btn} href="/">Về trang chủ</Link>
        </div>

        <form noValidate onSubmit={handleRegister} className={styles.form}>
          <h2>Đăng ký</h2>

          <input
            type="text"
            placeholder="Họ và tên"
            className={`${styles.input} ${touched.name && nameErr ? styles.invalid : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            required
            autoComplete="name"
            aria-invalid={!!(touched.name && nameErr)}
            aria-describedby="name-error"
          />
          {touched.name && nameErr && (
            <p id="name-error" className={styles.error} role="alert" aria-live="polite">
              {nameErr}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            className={`${styles.input} ${touched.email && emailErr ? styles.invalid : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            required
            inputMode="email"
            autoCapitalize="none"
            autoComplete="email"
            aria-invalid={!!(touched.email && emailErr)}
            aria-describedby="email-error"
          />
          {touched.email && emailErr && (
            <p id="email-error" className={styles.error} role="alert" aria-live="polite">
              {emailErr}
            </p>
          )}

          <input
            type="password"
            placeholder="Mật khẩu"
            className={`${styles.input} ${touched.password && passwordErr ? styles.invalid : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            required
            minLength={8}
            autoComplete="new-password"
            pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,}$"
            aria-invalid={!!(touched.password && passwordErr)}
            aria-describedby="password-error"
          />
          {touched.password && passwordErr && (
            <p id="password-error" className={styles.error} role="alert" aria-live="polite">
              {passwordErr}
            </p>
          )}

          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            className={`${styles.input} ${touched.confirm && confirmErr ? styles.invalid : ""}`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            required
            autoComplete="new-password"
            aria-invalid={!!(touched.confirm && confirmErr)}
            aria-describedby="confirm-error"
          />
          {touched.confirm && confirmErr && (
            <p id="confirm-error" className={styles.error} role="alert" aria-live="polite">
              {confirmErr}
            </p>
          )}

          <input
            type="tel"
            placeholder="Số điện thoại (VN)"
            className={`${styles.input} ${touched.phone && phoneErr ? styles.invalid : ""}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            required
            inputMode="tel"
            autoComplete="tel"
            pattern="^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$"
            aria-invalid={!!(touched.phone && phoneErr)}
            aria-describedby="phone-error"
          />
          {touched.phone && phoneErr && (
            <p id="phone-error" className={styles.error} role="alert" aria-live="polite">
              {phoneErr}
            </p>
          )}

          {serverError && (
            <p className={styles.error} role="alert" aria-live="polite">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={formInvalid || submitting}
          >
            {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>

          <p className={styles.link}>
            Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

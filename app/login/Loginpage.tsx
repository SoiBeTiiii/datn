// app/login/LoginPage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Login.module.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import Link from "next/link";
import { login, userInfo } from "../../lib/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import authAxios from "../../lib/authAxios";
import BackToHomeButton from "../components/BackToHomeButton";

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
function sanitizeRedirect(raw: string | null | undefined) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // thêm các state/ctx/hook khác...
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirect(searchParams.get("redirect"));

  // ⚠️ Di chuyển các useMemo LÊN TRÊN guard để luôn được gọi ở mọi render
  const emailErr = useMemo(() => validateEmail(email), [email]);
  const passwordErr = useMemo(() => validatePassword(password), [password]);
  const formInvalid = !!emailErr || !!passwordErr;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guard render (sau khi TẤT CẢ hooks đã gọi)
  if (!mounted) return null;

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      const response = await authAxios.get<{ data: { url: string } }>(`/redirect/${provider}`);
      const redirectUrl = response.data?.data?.url;
      if (redirectUrl) window.location.assign(redirectUrl);
      else setServerError("Không lấy được URL đăng nhập từ server.");
    } catch (e) {
      setServerError("Lỗi khi gọi API social login.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError(null);
    if (formInvalid || submitting) return;

    setSubmitting(true);
    try {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success && res.data) {
        localStorage.setItem("authToken", res.data.token);
        const profile = await userInfo();
        setUser({
          id: (profile as any).id,
          name: (profile as any).name,
          email: (profile as any).email,
          role: (profile as any).role,
          phone: (profile as any).phone,
        });
        localStorage.setItem("user", JSON.stringify(profile));
        router.push(redirect);
      } else {
        setServerError(res.message || "Đăng nhập thất bại.");
      }
    } catch (err: any) {
      setServerError(err?.message || "Lỗi đăng nhập.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className={styles.container}>
      <BackToHomeButton />
      <div className={styles.card}>
        <div className={styles.leftPanel}>
          <h1>Chào mừng trở lại 👋</h1>
          <p>Khám phá các sản phẩm làm đẹp mới nhất từ EGOMall!</p>
         
        </div>

        <form noValidate onSubmit={handleLogin} className={styles.form}>
          <h2>Đăng nhập</h2>

          <input
            type="email"
            placeholder="Email của bạn"
            className={`${styles.input} ${touched.email && emailErr ? styles.invalid : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            required
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
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
            autoComplete="current-password"
            pattern="^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d\\S]{8,}$"
            aria-invalid={!!(touched.password && passwordErr)}
            aria-describedby="password-error"
          />
          {touched.password && passwordErr && (
            <p id="password-error" className={styles.error} role="alert" aria-live="polite">
              {passwordErr}
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
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <div className={styles.socials}>
            <button
              type="button"
              className={styles.google}
              onClick={() => handleSocialLogin("google")}
              disabled={submitting}
            >
              <FaGoogle /> Google
            </button>
            <button
              type="button"
              className={styles.facebook}
              onClick={() => handleSocialLogin("facebook")}
              disabled={submitting}
            >
              <FaFacebookF /> Facebook
            </button>
          </div>

          <div className={styles.links}>
            <Link href="/forgot-password">Quên mật khẩu?</Link>
            <Link href="/register">Tạo tài khoản</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

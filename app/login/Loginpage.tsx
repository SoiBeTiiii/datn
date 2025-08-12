// app/login/LoginPage.tsx
'use client';

import { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import Link from "next/link";
import { getSocialRedirectUrl, login, userInfo } from "../../lib/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      const url = await getSocialRedirectUrl(provider);
      if (url) {
        window.location.href = url;
      } else {
        alert("Không lấy được URL đăng nhập từ server");
      }
    } catch (err) {
      alert("Lỗi khi gọi API social login");
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await login(email, password);
      if ((res as { success: boolean }).success) {
        const user = await userInfo();
        setUser(user);
        router.push(redirect);
      } else {
        alert((res as { message?: string }).message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi đăng nhập");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.leftPanel}>
          <h1>Chào mừng trở lại 👋</h1>
          <p>Khám phá các sản phẩm làm đẹp mới nhất từ EGOMall!</p>
          <Link href="/" passHref>Trang chủ</Link>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <h2>Đăng nhập</h2>

          <input
            type="email"
            placeholder="Email của bạn"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className={styles.button}>Đăng nhập</button>

          <div className={styles.socials}>
            <button type="button" className={styles.google} onClick={() => handleSocialLogin("google")}>
              <FaGoogle /> Google
            </button>
            <button type="button" className={styles.facebook} onClick={() => handleSocialLogin("facebook")}>
              <FaFacebookF /> Facebook
            </button>
          </div>

          <div className={styles.links}>
            <Link href="/forgot-password" passHref>Quên mật khẩu?</Link>
            <Link href="/register" passHref>Tạo tài khoản</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// app/login/LoginPage.tsx
"use client";

import { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import Link from "next/link";
import { getSocialRedirectUrl, login, userInfo } from "../../lib/authApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import authAxios from "../../lib/authAxios";

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
    const response = await authAxios.get<{ data: { url: string } }>(
      `/redirect/${provider}`
    );
    const redirectUrl = response.data.data.url;

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      alert("Không lấy được URL đăng nhập từ server");
    }
  } catch (error) {
    console.error("Lỗi khi gọi API social login", error);
    alert("Lỗi khi gọi API social login");
  }
};

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await login(email, password); // ApiResponse<LoginResponse>

    if (res.success && res.data) {
      // Lưu token
      localStorage.setItem("authToken", res.data.token);

      // Lấy profile ngay sau login
      const profile = await userInfo();

      // setUser trực tiếp object User (không dùng callback)
      setUser({
        id: (profile as any).id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
      });

      // Lưu snapshot để UI hiện ngay khi điều hướng
      localStorage.setItem("user", JSON.stringify(profile));

      router.push(redirect);
    } else {
      alert(res.message || "Đăng nhập thất bại");
    }
  } catch (err: any) {
    console.error("Login error:", err);
    alert(err.message || "Lỗi đăng nhập");
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.leftPanel}>
          <h1>Chào mừng trở lại 👋</h1>
          <p>Khám phá các sản phẩm làm đẹp mới nhất từ EGOMall!</p>
          <Link href="/" passHref>
            Trang chủ
          </Link>
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

          <button type="submit" className={styles.button}>
            Đăng nhập
          </button>

          <div className={styles.socials}>
            <button
              type="button"
              className={styles.google}
              onClick={() => handleSocialLogin("google")}
            >
              <FaGoogle /> Google
            </button>
            <button
              type="button"
              className={styles.facebook}
              onClick={() => handleSocialLogin("facebook")}
            >
              <FaFacebookF /> Facebook
            </button>
          </div>

          <div className={styles.links}>
            <Link href="/forgot-password" passHref>
              Quên mật khẩu?
            </Link>
            <Link href="/register" passHref>
              Tạo tài khoản
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

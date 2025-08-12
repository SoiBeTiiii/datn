"use client";
import { useEffect, useState } from "react";
import styles from "./VerifyOtp.module.css";
import { useRouter } from "next/navigation";
import authAxios from "../../lib/authAxios";

// Define the expected response type from the backend
type VerifyOtpResponse = {
  success: boolean;
  message?: string;
};

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("verify_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      alert("Không tìm thấy email để xác minh. Vui lòng đăng ký lại.");
      router.push("/register");
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();

  const email = localStorage.getItem("verify_email");
  if (!email || !otp) {
    alert("Email hoặc mã OTP không được để trống.");
    return;
  }

  const payload = {
    email: email.trim(),
    otp: otp.trim(),
  };

  try {
    const res = await authAxios.post('verify-otp', payload);

    // ✅ Chỉ cần response trả về 2xx là coi là thành công
    alert("Xác minh thành công!");
    localStorage.removeItem("verify_email");
    router.push("/login");
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "OTP không đúng hoặc đã hết hạn.";
    alert("Lỗi xác minh: " + errorMessage);
    console.error("Chi tiết lỗi:", err.response?.data);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Xác minh OTP</h2>
        <form onSubmit={handleVerify} className={styles.form}>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            className={styles.input}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className={styles.button}>
            Xác minh
          </button>
        </form>
      </div>
    </div>
  );
}

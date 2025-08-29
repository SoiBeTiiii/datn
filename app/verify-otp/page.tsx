"use client";
import { useEffect, useState } from "react";
import styles from "./VerifyOtp.module.css";
import { useRouter } from "next/navigation";
import authAxios from "../../lib/authAxios";

type Notice = { type: "success" | "error" | "info"; text: string } | null;

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("verify_email");
    if (storedEmail) {
      setEmail(storedEmail);
      setNotice({
        type: "info",
        text: `Mã OTP đã được gửi tới ${storedEmail}. Vui lòng kiểm tra hộp thư.`,
      });
    } else {
      setNotice({
        type: "error",
        text: "Không tìm thấy email để xác minh. Vui lòng đăng ký lại.",
      });
      // Không dùng alert + không redirect ngay để người dùng thấy thông báo
      // Có thể cho một nút quay lại đăng ký bên dưới
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp.trim()) {
      setNotice({ type: "error", text: "Email hoặc mã OTP không được để trống." });
      return;
    }

    const payload = { email: email.trim(), otp: otp.trim() };

    try {
      setSubmitting(true);
      await authAxios.post("verify-otp", payload);

      // Thành công: hiển thị thông báo đẹp + chuyển trang
      setNotice({ type: "success", text: "Xác minh thành công! Đang chuyển đến trang đăng nhập..." });
      localStorage.removeItem("verify_email");

      // Chuyển trang sau một nhịp ngắn để người dùng kịp thấy thông báo
      setTimeout(() => router.push("/login"), 800);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "OTP không đúng hoặc đã hết hạn.";
      setNotice({ type: "error", text: `Lỗi xác minh: ${errorMessage}` });
      console.error("Chi tiết lỗi:", err?.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Xác minh OTP</h2>

        {/* Notice banner (thay cho alert) */}
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

        <form onSubmit={handleVerify} className={styles.form} noValidate>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            className={styles.input}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d*"
            required
            aria-label="Mã OTP"
          />

          <button
            type="submit"
            className={styles.button}
            disabled={submitting || !otp.trim() || !email}
          >
            {submitting ? "Đang xác minh..." : "Xác minh"}
          </button>

          {/* Khi thiếu email trong localStorage */}
          {!email && (
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => router.push("/register")}
            >
              Quay lại đăng ký
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

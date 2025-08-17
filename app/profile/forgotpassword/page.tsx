"use client";

import { useState } from "react";
import styles from "./forgotpassword.module.css";
import { changePassword } from "@/lib/authApi";

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    setStatus("loading");
    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (res.data.success) {
        setStatus("success");
        setMessage("Đổi mật khẩu thành công.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus("error");
        setMessage(res.data.message || "Đổi mật khẩu thất bại.");
      }
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setMessage(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau."
      );
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Đổi mật khẩu</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="password"
          placeholder="Mật khẩu hiện tại"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.submitButton} disabled={status === "loading"}>
          {status === "loading" ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </form>
      {status !== "idle" && (
        <p className={status === "success" ? styles.success : styles.error}>{message}</p>
      )}
    </div>
  );
}
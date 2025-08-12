// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import styles from "./Profile.module.css";
import { updateUserInfo, userInfo } from "../../lib/authApi";
import { useUserContext } from "../context/UserContext";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const { avatar } = useUserContext(); // lấy file avatar đã chọn từ layout

  useEffect(() => {
    const fetchUser = async () => {
      const user = await userInfo();
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phone", form.phone);
    if (avatar) formData.append("image", avatar);

    try {
      await updateUserInfo(formData);
      alert("Cập nhật thành công");
    } catch (err) {
      alert("Cập nhật thất bại");
    }
  };

  return (
    <>
      <h2 className={styles.title}>Tài khoản</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <label>Tên *</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Email *</label>
            <input name="email" value={form.email} readOnly className={styles.readOnly} />
          </div>
          <div>
            <label>Số điện thoại *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required />
          </div>
        </div>
        <button type="submit" className={styles.saveButton}>
          Lưu
        </button>
      </form>
    </>
  );
}

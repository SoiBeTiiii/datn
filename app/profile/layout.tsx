// app/profile/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { userInfo } from "../../lib/authApi";
import styles from "./Profile.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserProvider, useUserContext } from "../context/UserContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { avatar, setAvatar, avatarPreview, setAvatarPreview } =
    useUserContext();
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const user = await userInfo();
      setFullName(user.name || "");
      if (user.image) {
        // Nếu user.image đã là full URL (http...), thì dùng trực tiếp
        setAvatarPreview(
          user.image.startsWith("http")
            ? user.image
            : `${process.env.NEXT_PUBLIC_API_IMAGE_URL}/${user.image}`
        );
      }
    };
    fetchUser();
  }, [setAvatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.card}>
          <label className={styles.avatarUpload}>
            {avatarPreview ? (
              <img src={avatarPreview} className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarIcon}>👤</div>
            )}
            <div className={styles.overlayText}>Tải ảnh lên</div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              hidden
            />
          </label>
          <strong>{fullName}</strong>
        </div>

        <nav className={styles.menu}>
          <Link
            href="/profile"
            className={pathname === "/profile" ? styles.active : ""}
          >
            Tài khoản
          </Link>
          <Link
            href="/profile/orders"
            className={pathname.includes("/orders") ? styles.active : ""}
          >
            Đơn hàng
          </Link>
          <Link
            href="/profile/address"
            className={pathname.includes("/address") ? styles.active : ""}
          >
            Địa chỉ giao nhận
          </Link>
          <Link
            href="/profile/forgotpassword"
            className={pathname.includes("/forgotpassword") ? styles.active : ""}
          >
            Đổi mật khẩu
          </Link>
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <LayoutContent>{children}</LayoutContent>
    </UserProvider>
  );
}

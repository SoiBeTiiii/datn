"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { userInfo } from "../../lib/authApi";
import { useRouter } from "next/navigation";
import authAxios from "@/lib/authAxios";
import { toast } from "react-toastify";

/** ==== Types ==== */
export interface User {
  id?: string | number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextProps {
  user: User | null;
  // Cho phép set trực tiếp object hoặc callback updater
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  /** 1) Nạp nhanh từ localStorage để UI hiện tức thì */
  useEffect(() => {
    try {
      const cached = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // ignore
    }
  }, []);

  /** 2) Nếu có token -> làm tươi profile từ server.
   *  - Không set null ngay nếu fail, chỉ dọn dẹp khi chắc chắn lỗi xác thực
   */
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) return;

    (async () => {
      try {
        const fresh = await userInfo(); // trả về object User
        if (fresh && typeof fresh === "object") {
          setUser(fresh);
          localStorage.setItem("user", JSON.stringify(fresh));
        }
      } catch (err) {
        // Token không hợp lệ -> dọn dẹp
        console.warn("userInfo failed", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
      }
    })();
  }, []);

  /** 3) Nếu đã đăng nhập mà đang ở /login -> đẩy về trang chủ */
  useEffect(() => {
    if (user && typeof window !== "undefined" && window.location.pathname === "/login") {
      router.replace("/");
    }
  }, [user, router]);

  /** 4) Đăng xuất */
  const logout = async () => {
    try {
      await authAxios.post("/logout");
    } catch (error) {
      console.error("logout fail", error);
    }
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Đăng xuất thành công");
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

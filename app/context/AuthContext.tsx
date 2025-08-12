"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { userInfo } from "../../lib/authApi";
import { useRouter } from "next/navigation";
import authAxios from "@/lib/authAxios";

interface User {
  name: string;
  email: string;
  role: string;
  phone: string;
}

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const hasRedirected = useRef(false);
useEffect(() => {
  (async () => {
    try {
      const data = await userInfo();
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  })();
}, []);

  useEffect(() => {
    if (user && !hasRedirected.current && window.location.pathname === "/login" ) {
      hasRedirected.current = true;
      router.push("/"); 
    }
  }, [user, router]);

  const logout = async () => {
    try {
      await authAxios.post("/logout");
    } catch (error) {
      console.error("logout fail", error);
    }
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

 useEffect(() => {
  const token = localStorage.getItem('authToken');
  // ...existing code...
if (token) {
  (async () => {
    try {
      const data = await userInfo(); // <-- Remove user argument
      setUser(data);
    } catch (err) {
      setUser(null);
      localStorage.removeItem('authToken');
    }
  })();
} else {
  setUser(null);
}
// ...existing code...
}, []);


  // Redirect if user is logged in and tries to access login page
  useEffect(() => {
    if (user && window.location.pathname === "/login") {
      router.push("/"); 
    }
  }, [user, router]);

  const logout = async () => {
    try {
      await authAxios.post("/logout");
      localStorage.removeItem("authToken"); // Clear token after logout
    } catch (error) {
      console.error("logout fail", error);
    }
    setUser(null);
    router.push("/login"); // Ensure redirect after logout
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

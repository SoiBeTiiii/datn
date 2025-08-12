// context/UserContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

type UserContextType = {
  avatar: File | null;
  setAvatar: (file: File | null) => void;
  avatarPreview: string | null;
  setAvatarPreview: (url: string | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  return (
    <UserContext.Provider
      value={{
        avatar,
        setAvatar,
        avatarPreview,
        setAvatarPreview,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
};

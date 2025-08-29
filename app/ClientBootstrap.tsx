// app/ClientBootstrap.tsx
"use client";

import { useEffect } from "react";
import { tokenRefresher } from "@/lib/tokenRefresher";
// Nếu Chatbot là client component thì import và render ở đây luôn
import Chatbot from "./components/Chatbot";

export default function ClientBootstrap() {
  useEffect(() => {
    // an toàn vì chạy phía client
    tokenRefresher.initFromCurrentToken();
  }, []);

  // Có thể render các tiện ích client-global ở đây
  return <Chatbot />; // hoặc <>...</> nếu sau này thêm thứ khác
}

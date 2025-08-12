// app/login/page.tsx
import { Suspense } from "react";
import ProductPage from "./Productpage";
import LoginPage from "../login/Loginpage";

export default function Page() {
  return (
    <Suspense fallback={<p>Đang tải trang đăng nhập...</p>}>
      <LoginPage />
    </Suspense>
  );
}

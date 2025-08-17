// app/login/page.tsx
import { Suspense } from "react";
import ProductPage from "./Productpage";

export default function Page() {
  return (
    <Suspense fallback={<p>Đang tải trang sản phẩm...</p>}>
      <ProductPage />
    </Suspense>
  );
}

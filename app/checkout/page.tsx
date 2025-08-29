import { Suspense } from "react";
import Checkoutpage from "./Checkoutpage";

export default function Page() {
  return (
    <Suspense fallback={<p>Đang tải trang thanh toán...</p>}>
      <Checkoutpage />
    </Suspense>
  );
}

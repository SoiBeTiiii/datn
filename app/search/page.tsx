import { Suspense } from "react";
import SearchPage from "./Searchpage";

export default function Page() {
  return (
    <Suspense fallback={<p>Đang tải kết quả tìm kiếm...</p>}>
      <SearchPage />
    </Suspense>
  );
}

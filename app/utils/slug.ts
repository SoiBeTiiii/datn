export function slugify(str: string): string {
  return str
    .normalize("NFD")                         // tách dấu ra khỏi chữ (é → e + ́)
    .replace(/[\u0300-\u036f]/g, "")         // xóa dấu
    .replace(/đ/g, "d")                      // đ → d
    .replace(/Đ/g, "d")                      // Đ → d
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')                    // khoảng trắng → gạch nối
    .replace(/[^\w\-]+/g, '')                // xóa ký tự đặc biệt
    .replace(/\-\-+/g, '-');                 // gộp nhiều gạch nối
}

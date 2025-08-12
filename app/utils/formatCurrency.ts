export function formatCurrency(value?: number | null) {
  return (value ?? 0).toLocaleString("vi-VN") + "₫";
}

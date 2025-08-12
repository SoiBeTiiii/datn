// utils/validateVoucher.ts
import { Voucher } from "../interface/voucher";

export function validateVoucherInput(
  code: string,
  totalPrice: number,
  voucherList: Voucher[]
) {
  const matched = voucherList.find((v) => v.code.toLowerCase() === code.toLowerCase());

  if (!matched) {
    return { valid: false, message: "Mã không tồn tại" };
  }

  if (totalPrice < matched.conditions) {
    return {
      valid: false,
      message: `Đơn hàng cần tối thiểu ${matched.conditions.toLocaleString()}đ để dùng mã này`,
    };
  }

  return { valid: true, voucher: matched };
}

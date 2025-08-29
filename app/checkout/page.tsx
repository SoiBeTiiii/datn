"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./checkout.module.css";
import {
  getAddresses,
  getDistricts,
  getProvinces,
  getWards,
} from "../../lib/addressApi";
import Address from "../interface/address";
import { useCart } from "../context/CartConText";
import { checkoutOrder } from "@/lib/orderApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { getVouchers } from "@/lib/voucherApi";
import { Voucher } from "../interface/voucher";
import { userInfo } from "@/lib/authApi";
import { shippingApi } from "@/lib/shippingApi";
import { MdArrowBack } from "react-icons/md";

/* ============ Utils ============ */
const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(n || 0);

const validateEmail = (v: string) => {
  const val = v.trim().toLowerCase();
  if (!val) return "Vui lòng nhập email.";
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
  return ok ? "" : "Email không hợp lệ.";
};

const validateVNPhone = (v: string) => {
  const s = v.trim();
  if (!s) return "Vui lòng nhập số điện thoại.";
  const rx = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;
  return rx.test(s.replace(/\s/g, "")) ? "" : "Số điện thoại không hợp lệ (VN).";
};

const nonEmpty = (label: string, v: string) =>
  v.trim() ? "" : `Vui lòng nhập ${label}.`;

/* ============ Component ============ */
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart(); // ✅ chỉ gọi useCart() 1 lần

  const [voucherList, setVoucherList] = useState<Voucher[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");

  const [voucherData, setVoucherData] = useState<{
    id: number;
    discount_type: string;
    discount_value: number;
    max_discount: number;
    conditions: number;
  } | null>(null);

  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>(
    []
  );
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>(
    []
  );
  const [wards, setWards] = useState<{ code: string; name: string }[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    province_code: "",
    district_code: "",
    ward_code: "",
    province_name: "",
    district_name: "",
    ward_name: "",
    address_detail: "",
  });

  // shipping methods
  const [shippingMethods, setShippingMethods] = useState<
    { id: number; name: string; fee: number; estimated_time: string }[]
  >([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<
    number | null
  >(null);

  // validate states
  const [touched, setTouched] = useState({
    first_name: false,
    last_name: false,
    email: false,
    phone: false,
    province_code: false,
    district_code: false,
    ward_code: false,
    address_detail: false,
  });

  /* ============ Auth check ============ */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await userInfo();
        setUser(userData);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  /* ============ Load data ============ */
  useEffect(() => {
    getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    getVouchers()
      .then(setVoucherList)
      .catch(() => setVoucherMessage("Không thể tải voucher."));
  }, []);

  useEffect(() => {
    if (form.province_code) {
      getDistricts(form.province_code).then(setDistricts);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [form.province_code]);

  useEffect(() => {
    if (form.district_code) {
      getWards(form.district_code).then(setWards);
    } else {
      setWards([]);
    }
  }, [form.district_code]);

  // load addresses + note
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const list = await getAddresses();
        setAddresses(list);
        const def = list.find((addr) => addr.is_default);
        if (def) setSelectedAddressId(def.id);
      } catch (err) {
        console.error("Lỗi khi tải địa chỉ:", err);
      }
    };
    setNote(localStorage.getItem("checkout_note") || "");
    fetchAddress();
  }, []);

  // set form theo address chọn
  useEffect(() => {
    const selected = addresses.find((addr) => addr.id === selectedAddressId);
    if (selected) {
      setForm({
        first_name: selected.receiver.first_name,
        last_name: selected.receiver.last_name,
        email: selected.receiver.email,
        phone: selected.receiver.phone,
        province_code: selected.province.code || "",
        district_code: selected.district.code || "",
        ward_code: selected.ward.code || "",
        province_name: selected.province.name,
        district_name: selected.district.name,
        ward_name: selected.ward.name,
        address_detail: selected.address_detail,
      });
    }
  }, [selectedAddressId, addresses]);

  // khi chọn code thủ công -> fill tên tương ứng (để payload shipping_address có tên)
  useEffect(() => {
    const p = provinces.find((x) => x.code === form.province_code);
    const d = districts.find((x) => x.code === form.district_code);
    const w = wards.find((x) => x.code === form.ward_code);
    setForm((prev) => ({
      ...prev,
      province_name: p?.name || prev.province_name,
      district_name: d?.name || prev.district_name,
      ward_name: w?.name || prev.ward_name,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.province_code, form.district_code, form.ward_code, provinces, districts, wards]);

  // load shipping methods theo tỉnh
  useEffect(() => {
    const load = async () => {
      if (!form.province_code) {
        setShippingMethods([]);
        setSelectedShippingMethodId(null);
        return;
      }
      const methods = await shippingApi.getMethods(form.province_code);
      setShippingMethods(methods);
      if (methods.length > 0) setSelectedShippingMethodId(methods[0].id);
    };
    load();
  }, [form.province_code]);

  /* ============ Tính tiền ============ */
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const originalTotal = subtotal;

  const discount = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const price = item.price;
        const quantity = item.quantity;
        if (item.promotion) {
          if (item.promotion.type === "percentage") {
            return sum + (price * quantity * item.promotion.value) / 100;
          } else if (item.promotion.type === "fixed_amount") {
            return sum + item.promotion.value;
          }
        }
        return sum;
      }, 0),
    [cart]
  );

  const selectedShippingFee =
    shippingMethods.find((m) => m.id === selectedShippingMethodId)?.fee || 0;

  let voucherDiscount = 0;
  if (voucherData) {
    if (voucherData.discount_type === "percent") {
      voucherDiscount = Math.min(
        (originalTotal * voucherData.discount_value) / 100,
        voucherData.max_discount
      );
    } else if (voucherData.discount_type === "amount") {
      voucherDiscount = voucherData.discount_value;
    }
  }

  const total = subtotal - discount - voucherDiscount + selectedShippingFee;

  /* ============ Field-level errors ============ */
  const errors = useMemo(() => {
    return {
      first_name: nonEmpty("tên", form.first_name),
      last_name: nonEmpty("họ", form.last_name),
      email: validateEmail(form.email),
      phone: validateVNPhone(form.phone),
      province_code: nonEmpty("tỉnh/thành phố", form.province_code),
      district_code: nonEmpty("quận/huyện", form.district_code),
      ward_code: nonEmpty("phường/xã", form.ward_code),
      address_detail: nonEmpty("địa chỉ cụ thể", form.address_detail),
      // note: không bắt buộc
    };
  }, [form]);

  const formInvalid = useMemo(
    () =>
      !!(
        errors.first_name ||
        errors.last_name ||
        errors.email ||
        errors.phone ||
        errors.province_code ||
        errors.district_code ||
        errors.ward_code ||
        errors.address_detail
      ),
    [errors]
  );

  /* ============ Voucher ============ */
  const handleApplyVoucher = () => {
    const matched = voucherList.find(
      (v) => v.code.toLowerCase() === voucherCode.toLowerCase()
    );

    if (!matched) {
      setVoucherData(null);
      setVoucherMessage("Mã không hợp lệ.");
      return;
    }

    if (originalTotal < matched.conditions) {
      setVoucherData(null);
      setVoucherMessage(
        `Đơn hàng cần tối thiểu ${fmtVND(matched.conditions)}₫ để dùng mã này.`
      );
      return;
    }

    setVoucherData({
      id: matched.id,
      discount_type: matched.discount_type,
      discount_value: matched.discount_value,
      max_discount: matched.max_discount || 0,
      conditions: matched.conditions,
    });
    setVoucherMessage("🎉 Áp dụng mã thành công!");
  };

  /* ============ Place order ============ */
  const handlePlaceOrder = async () => {
    // chạm tất cả fields để hiện lỗi
    setTouched({
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      province_code: true,
      district_code: true,
      ward_code: true,
      address_detail: true,
    });

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống.");
      return;
    }
    if (formInvalid) {
      toast.error("Vui lòng kiểm tra lại thông tin giao hàng.");
      return;
    }
    if (!selectedShippingMethodId) {
      toast.error("Vui lòng chọn phương thức vận chuyển.");
      return;
    }

    try {
      const hasGifts = cart.some((item) => item.isGift);
      const payload = {
        total_price: subtotal,
        total_discount: discount + voucherDiscount,
        note, // không bắt buộc
        shipping_name: `${form.first_name} ${form.last_name}`,
        shipping_phone: form.phone,
        province_code: form.province_code,
        shipping_email: form.email,
        shipping_address: `${form.address_detail}, ${form.ward_name}, ${form.district_name}, ${form.province_name}`,
        payment_method: paymentMethod,
        voucher_id: voucherData?.id || null,
        shipping_method_id: selectedShippingMethodId,
        orders: [
          {
            products: cart
              .filter((item) => !item.isGift)
              .map((item) => ({
                id: item.variantId,
                quantity: item.quantity,
                price: item.originalPrice,
                sale_price: item.sale_price || item.originalPrice,
              })),
            ...(hasGifts && {
              gifts: cart
                .filter((item) => item.isGift)
                .map((gift) => ({
                  id: gift.variantId,
                  quantity: gift.quantity,
                })),
            }),
          },
        ],
      };

      const res = (await checkoutOrder(payload)) as {
        data?: { redirect_url?: string };
      };

      if (paymentMethod === "MOMO" || paymentMethod === "VNPAY") {
        const redirectUrl = res?.data?.redirect_url;
        if (redirectUrl) {
          clearCart();
          toast.success("✅ Đang chuyển hướng đến cổng thanh toán...");
          window.location.href = redirectUrl;
          return;
        } else {
          toast.error("❌ Không nhận được link thanh toán từ server.");
          return;
        }
      }

      // COD
      clearCart();
      toast.success("✅ Đặt hàng thành công!");
      router.replace("/thank-you");
    } catch (error) {
      toast.error("❌ Đặt hàng thất bại!");
      console.error(error);
    }
  };

  if (loading) return null;

  return (
    <div className={styles.checkoutContainer}>
      <button
        className={styles.backBtnPC}
        onClick={() => router.push("/")}
        aria-label="Quay về trang chủ"
      >
        <MdArrowBack size={24} />
      </button>
      <button
        className={styles.backBtn}
        onClick={() => router.push("/")}
        aria-label="Quay về trang chủ"
      >
        <MdArrowBack size={24} />
      </button>

      <h1>Thông tin thanh toán</h1>

      <div className={styles.grid}>
        {/* LEFT */}
        <div className={styles.left}>
          {/* Buyer Info */}
          <section className={styles.section}>
            <h2>Thông tin người mua hàng</h2>
            <div className={styles.row}>
              <div className={styles.field}>
                <input
                  className={`${styles.input} ${
                    touched.first_name && errors.first_name ? styles.invalid : ""
                  }`}
                  placeholder="Tên"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                  onBlur={() =>
                    setTouched((t) => ({ ...t, first_name: true }))
                  }
                  aria-invalid={!!(touched.first_name && errors.first_name)}
                  aria-describedby="err-first-name"
                />
                {touched.first_name && errors.first_name && (
                  <p id="err-first-name" className={styles.error} role="alert">
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <input
                  className={`${styles.input} ${
                    touched.last_name && errors.last_name ? styles.invalid : ""
                  }`}
                  placeholder="Họ"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, last_name: e.target.value }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, last_name: true }))}
                  aria-invalid={!!(touched.last_name && errors.last_name)}
                  aria-describedby="err-last-name"
                />
                {touched.last_name && errors.last_name && (
                  <p id="err-last-name" className={styles.error} role="alert">
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <input
                  className={`${styles.input} ${
                    touched.phone && errors.phone ? styles.invalid : ""
                  }`}
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                  aria-invalid={!!(touched.phone && errors.phone)}
                  aria-describedby="err-phone"
                  inputMode="tel"
                />
                {touched.phone && errors.phone && (
                  <p id="err-phone" className={styles.error} role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <input
                  className={`${styles.input} ${
                    touched.email && errors.email ? styles.invalid : ""
                  }`}
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  aria-invalid={!!(touched.email && errors.email)}
                  aria-describedby="err-email"
                  inputMode="email"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <p id="err-email" className={styles.error} role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Shipping Info */}
          <section className={styles.section}>
            <h2>Thông tin nhận hàng</h2>

            <select
              className={styles.select}
              value={selectedAddressId || ""}
              onChange={(e) => setSelectedAddressId(Number(e.target.value))}
            >
              <option value="" disabled>
                -- Chọn địa chỉ đã lưu --
              </option>
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.address_name} - {addr.address_detail}
                </option>
              ))}
            </select>

            <div className={styles.row}>
              <div className={styles.field}>
                <select
                  className={`${styles.select} ${
                    touched.province_code && errors.province_code
                      ? styles.invalid
                      : ""
                  }`}
                  value={form.province_code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      province_code: e.target.value,
                      district_code: "",
                      ward_code: "",
                    }))
                  }
                  onBlur={() =>
                    setTouched((t) => ({ ...t, province_code: true }))
                  }
                  aria-invalid={!!(touched.province_code && errors.province_code)}
                  aria-describedby="err-province"
                >
                  <option value="">Tỉnh/Thành phố</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {touched.province_code && errors.province_code && (
                  <p id="err-province" className={styles.error} role="alert">
                    {errors.province_code}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <select
                  className={`${styles.select} ${
                    touched.district_code && errors.district_code
                      ? styles.invalid
                      : ""
                  }`}
                  value={form.district_code}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      district_code: e.target.value,
                      ward_code: "",
                    }))
                  }
                  onBlur={() =>
                    setTouched((t) => ({ ...t, district_code: true }))
                  }
                  disabled={!form.province_code}
                  aria-invalid={!!(touched.district_code && errors.district_code)}
                  aria-describedby="err-district"
                >
                  <option value="">Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {touched.district_code && errors.district_code && (
                  <p id="err-district" className={styles.error} role="alert">
                    {errors.district_code}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <select
                  className={`${styles.select} ${
                    touched.ward_code && errors.ward_code ? styles.invalid : ""
                  }`}
                  value={form.ward_code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ward_code: e.target.value }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, ward_code: true }))}
                  disabled={!form.district_code}
                  aria-invalid={!!(touched.ward_code && errors.ward_code)}
                  aria-describedby="err-ward"
                >
                  <option value="">Phường/Xã</option>
                  {wards.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
                {touched.ward_code && errors.ward_code && (
                  <p id="err-ward" className={styles.error} role="alert">
                    {errors.ward_code}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <input
                className={`${styles.input} ${
                  touched.address_detail && errors.address_detail
                    ? styles.invalid
                    : ""
                }`}
                placeholder="Địa chỉ cụ thể"
                value={form.address_detail}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    address_detail: e.target.value,
                  }))
                }
                onBlur={() =>
                  setTouched((t) => ({ ...t, address_detail: true }))
                }
                aria-invalid={!!(touched.address_detail && errors.address_detail)}
                aria-describedby="err-address-detail"
              />
              {touched.address_detail && errors.address_detail && (
                <p id="err-address-detail" className={styles.error} role="alert">
                  {errors.address_detail}
                </p>
              )}
            </div>
          </section>

          {/* Shipping Method */}
          <section className={styles.section}>
            <h2>Phương thức vận chuyển</h2>
            {shippingMethods.length === 0 ? (
              <p>Vui lòng chọn Tỉnh/Thành phố để hiển thị phương thức vận chuyển.</p>
            ) : (
              <div className={styles.radioGroup}>
                {shippingMethods.map((method) => (
                  <label key={method.id} className={styles.radioItem}>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={selectedShippingMethodId === method.id}
                      onChange={() => setSelectedShippingMethodId(method.id)}
                    />
                    <span>
                      {method.name} - {fmtVND(method.fee)}₫ ({method.estimated_time})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className={styles.section}>
            <h2>Phương thức thanh toán</h2>
            <div className={styles.radioGroup}>
              {["COD", "VNPAY"].map((method) => (
                <label key={method}>
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  {method === "COD" ? "Thanh toán khi nhận hàng (COD)" : method}
                </label>
              ))}
            </div>
          </section>

          {/* Note (KHÔNG bắt buộc) */}
          <section className={styles.section}>
            <h2>Ghi chú</h2>
            <textarea
              className={styles.textarea}
              placeholder="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.summaryBox}>
            {cart.length === 0 ? (
              <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            ) : (
              <>
                {cart.map((item, index) => (
                  <p key={`${item.productId}-${item.variantId}-${index}`}>
                    {item.name} - {fmtVND(item.price)}₫
                  </p>
                ))}
                <hr />
                <p>
                  Tổng giá trị đơn hàng: <strong>{fmtVND(originalTotal)}₫</strong>
                </p>
                {voucherDiscount > 0 && (
                  <p>
                    Giảm mã: <strong>{fmtVND(voucherDiscount)}₫</strong>
                  </p>
                )}
                {selectedShippingFee > 0 && (
                  <p>
                    Phí vận chuyển: <strong>{fmtVND(selectedShippingFee)}₫</strong>
                  </p>
                )}
                <p>
                  Tổng cộng: <strong>{fmtVND(total)}₫</strong>
                </p>
                <button
                  className={styles.placeOrderBtn}
                  onClick={handlePlaceOrder}
                  disabled={
                    cart.length === 0 || formInvalid || !selectedShippingMethodId
                  }
                  title={
                    !selectedShippingMethodId
                      ? "Vui lòng chọn phương thức vận chuyển"
                      : formInvalid
                      ? "Vui lòng kiểm tra thông tin giao hàng"
                      : undefined
                  }
                >
                  ĐẶT HÀNG
                </button>
              </>
            )}
          </div>

          <div className={styles.voucher}>
            <p>Voucher khả dụng:</p>
            <div className={styles.voucherList}>
              {voucherList.length === 0 && <p>Không có voucher nào.</p>}
              {voucherList.map((v) => (
                <button
                  key={v.id}
                  className={styles.voucherItem}
                  onClick={() => setVoucherCode(v.code)}
                >
                  <span>{v.description}</span>
                  <p>Hạn: {v.end_date}</p>
                </button>
              ))}
            </div>

            <input
              className={styles.input}
              placeholder="Mã voucher đang chọn"
              value={voucherCode}
              readOnly
            />

            <button
              className={styles.applyVoucherBtn}
              onClick={handleApplyVoucher}
              disabled={!voucherCode.trim()}
            >
              Áp dụng
            </button>

            {voucherMessage && (
              <p
                className={voucherData ? styles.voucherOk : styles.voucherErr}
                role="alert"
              >
                {voucherMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

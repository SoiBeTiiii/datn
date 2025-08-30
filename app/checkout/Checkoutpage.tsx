"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { getVouchers } from "@/lib/voucherApi";
import { Voucher } from "../interface/voucher";
import { userInfo } from "@/lib/authApi";
import { shippingApi } from "@/lib/shippingApi";
import BackToHomeButton from "../components/BackToHomeButton";

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

/** Kiểu item khi Buy Now */
type BuyNowItem = {
  productId: number | string;
  variantId: number | string;
  name: string;
  image: string;
  quantity: number;
  price: number; // đơn giá đã chọn (final)
  options: Record<string, { name: string; value: string }>;
  brand?: string;
  sku?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useSearchParams();
  const isBuyNow = params.get("source") === "buynow";

  const { cart } = useCart();

  // Auth state
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Data state
  const [buyNowItems, setBuyNowItems] = useState<BuyNowItem[]>([]);
  const [voucherList, setVoucherList] = useState<Voucher[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");

  const [voucherData, setVoucherData] = useState<{
    id: number;
    discount_type: string;
    discount_value: number;
    max_discount: number;
    conditions: number;
    is_voucher_valiable: boolean;
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

  /* ============ Auth check (DUY NHẤT) ============ */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await userInfo(); // sẽ throw nếu chưa đăng nhập
        if (!mounted) return;
        setUser(u);
      } catch {
        // 👉 chỉ push qua login theo yêu cầu
        router.push("/login");
        // Nếu muốn quay lại checkout sau khi login, dùng:
        // const next = encodeURIComponent("/checkout" + window.location.search);
        // router.push(`/login?next=${next}`);
      } finally {
        if (mounted) setLoadingAuth(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  /* ============ Buy Now: lấy từ sessionStorage ============ */
  useEffect(() => {
    if (!user) return; // chỉ chạy sau khi có user
    if (!isBuyNow) return;
    try {
      const raw = sessionStorage.getItem("checkout:buynow");
      if (raw) {
        const parsed = JSON.parse(raw) as BuyNowItem[];
        setBuyNowItems(Array.isArray(parsed) ? parsed : []);
      } else {
        setBuyNowItems([]);
      }
    } catch {
      setBuyNowItems([]);
    }
  }, [isBuyNow, user]);

  /* ============ Load data tĩnh (sau khi đã có user) ============ */
  useEffect(() => {
    if (!user) return;
    getProvinces().then(setProvinces);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getVouchers()
      .then(setVoucherList)
      .catch(() => setVoucherMessage("Không thể tải voucher."));
  }, [user]);

  // load addresses + note
  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  /* ============ Load địa phương ============ */
  useEffect(() => {
    if (!user) return;
    if (form.province_code) {
      getDistricts(form.province_code).then(setDistricts);
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [form.province_code, user]);

  useEffect(() => {
    if (!user) return;
    if (form.district_code) {
      getWards(form.district_code).then(setWards);
    } else {
      setWards([]);
    }
  }, [form.district_code, user]);

  // set form theo address chọn
  useEffect(() => {
    if (!user) return;
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
  }, [selectedAddressId, addresses, user]);

  // load shipping methods theo tỉnh
  useEffect(() => {
    if (!user) return;
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
  }, [form.province_code, user]);

  /* ============ Items nguồn: BuyNow hay Cart ============ */
  const items = isBuyNow
    ? buyNowItems.map((it) => ({
        variantId: it.variantId,
        name: it.name,
        price: it.price,
        quantity: it.quantity,
        isGift: false,
        promotion: null,
        sale_price: it.price,
        originalPrice: it.price,
      }))
    : cart;

  /* ============ Tính tiền ============ */
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const originalTotal = subtotal;

  const discount = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = item.price;
        const quantity = item.quantity;
        if ((item as any).promotion) {
          const promo = (item as any).promotion;
          if (promo.type === "percentage") {
            return sum + (price * quantity * promo.value) / 100;
          } else if (promo.type === "fixed_amount") {
            return sum + promo.value;
          }
        }
        return sum;
      }, 0),
    [items]
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
      is_voucher_valiable: matched.is_voucher_valiable,
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

    if (items.length === 0) {
      toast.error(isBuyNow ? "Không có sản phẩm Buy Now để thanh toán." : "Giỏ hàng trống.");
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
      const hasGifts = items.some((item) => (item as any).isGift);

      // products cho payload
      const productsPayload = items
        .filter((item) => !(item as any).isGift)
        .map((item) => ({
          id: (item as any).variantId,
          quantity: item.quantity,
          price: (item as any).originalPrice ?? item.price, // giá gốc
          sale_price: (item as any).sale_price ?? item.price, // giá bán (đã giảm)
        }));

      const giftsPayload = hasGifts
        ? items
            .filter((item) => (item as any).isGift)
            .map((gift) => ({
              id: (gift as any).variantId,
              quantity: gift.quantity,
            }))
        : undefined;

      const payload = {
        total_price: subtotal,
        total_discount: discount + voucherDiscount,
        note,
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
            products: productsPayload,
            ...(giftsPayload && { gifts: giftsPayload }),
          },
        ],
      };

      const res = (await checkoutOrder(payload)) as {
        data?: { redirect_url?: string };
      };

      if (paymentMethod === "MOMO" || paymentMethod === "VNPAY") {
        const redirectUrl = res?.data?.redirect_url;
        if (redirectUrl) {
          toast.success("✅ Đang chuyển hướng đến cổng thanh toán...");
          window.location.href = redirectUrl;
          return;
        } else {
          toast.error("❌ Không nhận được link thanh toán từ server.");
          return;
        }
      }

      // COD
      toast.success("✅ Đặt hàng thành công!");
      router.replace("/thank-you");
    } catch (error) {
      toast.error("❌ Đặt hàng thất bại!");
      console.error(error);
    }
  };

  /* ============ Guard UI sau khi KHAI BÁO TOÀN BỘ HOOKS ============ */
  if (loadingAuth || !user) {
    return <div className="p-6">Đang kiểm tra đăng nhập…</div>;
  }

  const hasItems = items.length > 0;

  return (
    <div className={styles.checkoutContainer}>
      <BackToHomeButton />

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
                  className={`${styles.input} ${touched.first_name && errors.first_name ? styles.invalid : ""}`}
                  placeholder="Tên"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, first_name: e.target.value }))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, first_name: true }))}
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
                  className={`${styles.input} ${touched.last_name && errors.last_name ? styles.invalid : ""}`}
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
                  className={`${styles.input} ${touched.phone && errors.phone ? styles.invalid : ""}`}
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
                  className={`${styles.input} ${touched.email && errors.email ? styles.invalid : ""}`}
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
                  className={`${styles.select} ${touched.province_code && errors.province_code ? styles.invalid : ""}`}
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
                  aria-invalid={
                    !!(touched.province_code && errors.province_code)
                  }
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
                  className={`${styles.select} ${touched.district_code && errors.district_code ? styles.invalid : ""}`}
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
                  aria-invalid={
                    !!(touched.district_code && errors.district_code)
                  }
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
                  className={`${styles.select} ${touched.ward_code && errors.ward_code ? styles.invalid : ""}`}
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
                className={`${styles.input} ${touched.address_detail && errors.address_detail ? styles.invalid : ""}`}
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
                aria-invalid={
                  !!(touched.address_detail && errors.address_detail)
                }
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
              <p>
                Vui lòng chọn Tỉnh/Thành phố để hiển thị phương thức vận chuyển.
              </p>
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
                      {method.name} - {fmtVND(method.fee)}₫ (
                      {method.estimated_time})
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

          {/* Note */}
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
            {!hasItems ? (
              <p>
                {isBuyNow
                  ? "Không có sản phẩm Buy Now"
                  : "Bạn chưa có sản phẩm nào trong giỏ hàng"}
              </p>
            ) : (
              <>
                {items.map((item, index) => (
                  <p key={`${(item as any).variantId}-${index}`}>
                    {item.name} - {fmtVND(item.price)}₫ x {item.quantity}
                  </p>
                ))}
                <hr />
                <p>
                  Tổng giá trị đơn hàng:{" "}
                  <strong>{fmtVND(originalTotal)}₫</strong>
                </p>
                {voucherDiscount > 0 && (
                  <p>
                    Giảm mã: <strong>{fmtVND(voucherDiscount)}₫</strong>
                  </p>
                )}
                {selectedShippingFee > 0 && (
                  <p>
                    Phí vận chuyển:{" "}
                    <strong>{fmtVND(selectedShippingFee)}₫</strong>
                  </p>
                )}
                <p>
                  Tổng cộng: <strong>{fmtVND(total)}₫</strong>
                </p>
                <button
                  className={styles.placeOrderBtn}
                  onClick={handlePlaceOrder}
                  disabled={
                    !hasItems || formInvalid || !selectedShippingMethodId
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
              {voucherList.filter((v) => v.is_voucher_valiable).length === 0 && (
                <p>Không có voucher nào.</p>
              )}

              {voucherList
                .filter((v) => v.is_voucher_valiable)
                .map((v) => (
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

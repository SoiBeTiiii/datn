"use client";

import { useEffect, useState } from "react";
import styles from "./Address.module.css";
import Address from "../../interface/address";
import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  createAddress,
  getProvinces,
  getDistricts,
  getWards,
} from "@/lib/addressApi";

export default function AddressPage() {
  const [provinces, setProvinces] = useState<{ code: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([]);
  const [wards, setWards] = useState<{ code: string; name: string }[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_name: "",
    address_detail: "",
    province_code: "",
    district_code: "",
    ward_code: "",
  });

  const fetchAddresses = async () => {
    const data = await getAddresses();
    setAddresses(data);
  };

  const startEdit = async (item: Address) => {
    const provinceCode = item.province.code;
    const districtCode = item.district.code;

    const [districtData, wardData] = await Promise.all([
      getDistricts(provinceCode),
      getWards(districtCode),
    ]);

    setDistricts(districtData);
    setWards(wardData);

    setForm({
      first_name: item.receiver.first_name,
      last_name: item.receiver.last_name,
      email: item.receiver.email,
      phone: item.receiver.phone,
      address_name: item.address_name,
      address_detail: item.address_detail,
      province_code: provinceCode,
      district_code: districtCode,
      ward_code: item.ward.code,
    });

    setEditingId(item.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleSetDefault = async (id: number) => {
    await setDefaultAddress(id);
    fetchAddresses();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá địa chỉ này?")) return;
    await deleteAddress(id);
    fetchAddresses();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateAddress(editingId, form);
    } else {
      await createAddress(form);
    }
    setShowForm(false);
    setEditingId(null);
    setIsEditMode(false);
    fetchAddresses();
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (showForm) {
      getProvinces().then(setProvinces);
    }
  }, [showForm]);

  useEffect(() => {
    if (!isEditMode && form.province_code) {
      getDistricts(form.province_code).then(setDistricts);
      setForm((prev) => ({ ...prev, district_code: "", ward_code: "" }));
      setWards([]);
    }
  }, [form.province_code]);

  useEffect(() => {
    if (!isEditMode && form.district_code) {
      getWards(form.district_code).then(setWards);
      setForm((prev) => ({ ...prev, ward_code: "" }));
    }
  }, [form.district_code]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Địa chỉ giao nhận</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setIsEditMode(false);
            setForm({
              first_name: "",
              last_name: "",
              email: "",
              phone: "",
              address_name: "",
              address_detail: "",
              province_code: "",
              district_code: "",
              ward_code: "",
            });
            setDistricts([]);
            setWards([]);
          }}
          className={styles.addButton}
        >
          + Thêm địa chỉ
        </button>
      </div>

      <div className={styles.list}>
        {addresses.length === 0 ? (
          <p>Chưa có địa chỉ nào.</p>
        ) : (
          addresses.map((item) => (
            <div key={item.id} className={styles.card}>
              <div>
                <strong>
                  {item.receiver.first_name} {item.receiver.last_name}
                </strong>{" "}
                - {item.receiver.phone}
              </div>
              <div>
                {item.address_detail}, {item.ward.name}, {item.district.name}, {item.province.name}
              </div>
              {item.is_default && <span className={styles.defaultTag}>Mặc định</span>}
              <div className={styles.actions}>
                {!item.is_default && (
                  <button onClick={() => handleSetDefault(item.id)}>Đặt làm mặc định</button>
                )}
                <button onClick={() => startEdit(item)}>Sửa</button>
                <button onClick={() => handleDelete(item.id)}>Xoá</button>
              </div>
            </div>
          ))
        )}
      </div>

  {showForm && (
  <>
    <div className={styles.overlay} onClick={() => setShowForm(false)} />
    <div className={styles.modal}>
      <h3>{editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="first_name"
          placeholder="Họ"
          required
          value={form.first_name}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          name="last_name"
          placeholder="Tên"
          required
          value={form.last_name}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          name="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          name="phone"
          placeholder="Số điện thoại"
          required
          value={form.phone}
          onChange={handleChange}
          className={styles.input}
        />
        <input
          name="address_name"
          placeholder="Tên địa chỉ (ví dụ: Nhà riêng)"
          value={form.address_name}
          onChange={handleChange}
          className={styles.input}
        />

        <select
          name="province_code"
          value={form.province_code}
          required
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">Chọn tỉnh/thành phố</option>
          {provinces.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          name="district_code"
          value={form.district_code}
          required
          onChange={handleChange}
          disabled={!districts.length}
          className={styles.select}
        >
          <option value="">Chọn quận/huyện</option>
          {districts.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          name="ward_code"
          value={form.ward_code}
          required
          onChange={handleChange}
          disabled={!wards.length}
          className={styles.select}
        >
          <option value="">Chọn phường/xã</option>
          {wards.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name}
            </option>
          ))}
        </select>

        <input
          name="address_detail"
          placeholder="Địa chỉ chi tiết"
          required
          value={form.address_detail}
          onChange={handleChange}
          className={styles.input}
        />

        

        <div className={styles.actions}>
          <button type="submit">Lưu</button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
              setIsEditMode(false);
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  </>
)}

    </div>
  );
}

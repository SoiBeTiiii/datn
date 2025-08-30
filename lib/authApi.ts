// src/lib/authApi.ts
import authAxios from './authAxios';
// ✅ ADD: dùng bộ hẹn giờ refresh
import { tokenRefresher } from './tokenRefresher';

export interface ApiResponse<T = unknown> {
  user(user: any): unknown;
  success: boolean;
  message: string;
  data: T;
  code: number;
}
export interface LoginResponse {
  token: string;
  token_type?: string;
  expires_in?: number; // nếu backend trả, ta sẽ dùng để schedule
}

export const login = async (email: string, password: string) => {
  try {
    // Cập nhật kiểu trả về là LoginResponse để sử dụng token
    const res = await authAxios.post<ApiResponse<LoginResponse>>('login', {
      account: email,
      password,
    }, {
      withCredentials: true,
    });

    if (res.data.success) {
      // Lưu token vào localStorage sau khi đăng nhập thành công
      localStorage.setItem('authToken', res.data.data.token);

      // ✅ ADD: hẹn giờ auto-refresh dựa trên expires_in (nếu có) hoặc decode exp trong JWT
      const exp = (res.data.data as any)?.expires_in;
      if (exp) tokenRefresher.scheduleFromExpiresIn(exp);
      else tokenRefresher.scheduleFromToken(res.data.data.token);
    }

    return res.data;
  } catch (error) {
    console.error('Login error: ', error);
    throw error;
  }
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  confirmPassword: string;
}) => {
  const res = await authAxios.post('register', {
    name: data.name,
    email: data.email,
    password: data.password,
    password_confirmation: data.confirmPassword, 
    phone: data.phone,
  }, {
    withCredentials: true,
  });

  return res.data;
};

export const refreshToken = async (): Promise<ApiResponse> => {
  try {
    const res = await authAxios.post<ApiResponse>('refresh', {}, {
      withCredentials: true,
    });

    // Backend của bạn (ví dụ bạn gửi) trả data dạng:
    // {
    //   success, message,
    //   data: { token, token_type, expires_in },
    //   code
    // }
    // Nên ta ưu tiên đọc ở res.data.data
    const payload = (res as any)?.data;
    const newToken =
      payload?.data?.token ?? payload?.token; // fallback nếu môi trường khác
    const expiresIn =
      payload?.data?.expires_in ?? payload?.expires_in;

    if (newToken) {
      localStorage.setItem('authToken', newToken);

      // ✅ ADD: reschedule tiếp
      if (expiresIn) tokenRefresher.scheduleFromExpiresIn(expiresIn);
      else tokenRefresher.scheduleFromToken(newToken);
    }

    return res.data;
  } catch (error) {
    console.error('❌ Lỗi khi refresh token:', error);
    throw error;
  }
};

export const getSocialRedirectUrl = async (provider: 'google' | 'facebook') => {
  // const FE_CALLBACK = window.location.origin + "/social-callback";
  const res = await authAxios.get<{ data: { url: string } }>(
    `/redirect/${provider}`
  );
  return res.data.data.url;
};

export const userInfo = async () => {
  try {
    const res = await authAxios.get<{ data: any }>("user", {
      withCredentials: true,
    });

    const user = res.data.data;

    if (!user) {
      // 🚨 Tự ném lỗi nếu backend không ném
      throw new Error("No user data");
    }

    return user;
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    throw error;
  }
};
// Gửi OTP
export const requestResetOTP = async (email: string) => {
  const res = await authAxios.post("forgot-password", { email });
  return res.data;
};

// Xác minh OTP
export const verifyResetOTP = async (email: string, otp: string) => {
  const res = await authAxios.post("verify-reset-otp", { email, otp });
  return res.data;
};

// Đặt lại mật khẩu
export const resetPassword = async (email: string, otp: string, password: string) => {
  const res = await authAxios.post("set-new-password", {
    email,
    otp,
    new_password: password,
    new_password_confirmation: password,
  });
  return res.data;
};

export const updateUserInfo = async (formData: FormData) => {
  const res = await authAxios.post("user", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
  return res.data;
};

export const changePassword = async (
  payload: {
    old_password: string;
    new_password: string;
    new_password_confirmation: string;
  }
): Promise<{ data: ApiResponse }> => {
  return authAxios.post("change-password", payload);
};

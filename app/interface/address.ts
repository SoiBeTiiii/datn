export default interface Address {
 id: number;
  address_name: string;
  address_detail: string;
  full_address: string;
  province: {
    code: string;
    name: string;
  };
  district: {
    code: string;
    name: string;
  };
  ward: {
    code: string;
    name: string;
  };
  receiver: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  note?: string;
  is_default: boolean;

}
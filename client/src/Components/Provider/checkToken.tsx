import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token: string): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.log(error);
    return true;
  }
};

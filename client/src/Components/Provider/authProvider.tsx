import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isTokenExpired } from "./checkToken";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  userEmail: string | null;
  setUserEmail: (userEmail: string | null) => void;
}

// Initialize the context with a default value
const AuthContext = createContext<AuthContextType>({
  token: "",
  setToken: () => {},
  userEmail: "",
  setUserEmail: () => {},
});

// Provider for authentication context
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken_] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [userEmail, setUserEmail_] = useState<string | null>(
    localStorage.getItem("userEmail")
  );
  const navigate = useNavigate();
  // Function to set the authentication token
  const setToken = (newToken: string | null) => {
    setToken_(newToken);
  };
  const setUserEmail = (userEmail: string | null) => {
    setUserEmail_(userEmail);
  };

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      setToken(null);
      setUserEmail(null);
      navigate("/");
    } else if (token && userEmail != null) {
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
    }
  }, [token, userEmail]);

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      userEmail,
      setUserEmail,
    }),
    [token, userEmail]
  );

  // Pass the complete contextValue object to the Provider
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext) as AuthContextType;
};

export default AuthProvider;

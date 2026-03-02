import { createContext, useContext, useState } from "react";

const AuthContext = createContext({
  token: null as string | null,
  onLogin: (_token: string) => { },
  onLogout: () => { }
});


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [token, setToken] = useState<string | null>(null);

  const handleLogin = (jwtToken: string) => {
    setToken(jwtToken);
  };

  const handleLogout = () => {
    setToken(null);
  };

  const value = {
    token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// give callers access to the context
export const useAuth = () => useContext(AuthContext);
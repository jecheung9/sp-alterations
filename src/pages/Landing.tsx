import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export const Landing: React.FC = () => {
  const { token, onLogin, onLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await onLogin();
    navigate("/dashboard");
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div>
      <h2>Landing (Public page)</h2>
      {token ? (
        <>
          <p>Authenticated! Token: {token}</p>
          <button onClick={handleLogout}>Sign Out</button>
        </>
      ) : (
        <button onClick={handleLogin}>Sign In</button>
      )}
    </div>
  );
};
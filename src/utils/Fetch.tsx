import type { NavigateFunction } from "react-router-dom";

export async function FetchHelper(url: string, options: RequestInit = {}, token: string | null, logout: () => void, navigate: NavigateFunction) {
  options.headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, options);

  if (res.status === 401 || res.status === 403) {
    logout();
    navigate("/");
    return null;
  }

  return res;
}
export const login = (user: string, pass: string): boolean => {
  if (user === "admin" && pass === "123456") {
    localStorage.setItem("admin-auth", "true");
    return true;
  }
  return false;
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem("admin-auth") === "true";
};

export const logout = () => {
  localStorage.removeItem("admin-auth");
};

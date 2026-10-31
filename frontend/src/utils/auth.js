export const getStoredUser = () => {
  const storedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    return null;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

export const getHomePath = (role) => {
  if (role === "EMPLOYEE") return "/employee/dashboard";
  if (["OWNER", "ADMIN", "MANAGER"].includes(role)) return "/owner/dashboard";
  return "/login";
};

import { useEffect, useState } from "react";
import { getUser } from "../../utils/auth";

const FALLBACK_USER = {
  id: null,
  name: "Student",
  role: "STUDENT",
};

function mapStoredUser(storedUser) {
  if (!storedUser) {
    return FALLBACK_USER;
  }

  const role = Array.isArray(storedUser.roles) && storedUser.roles.length > 0
    ? storedUser.roles[0]
    : (storedUser.role || "STUDENT");

  return {
    id: storedUser.id ?? null,
    name: storedUser.username || storedUser.name || "Student",
    role,
  };
}

export function useCurrentUser() {
  const [user, setUser] = useState(() => mapStoredUser(getUser()));

  useEffect(() => {
    const syncUser = () => setUser(mapStoredUser(getUser()));
    window.addEventListener("authChange", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("authChange", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  return user;
}

const DEFAULT_USER = {
  id: Number(import.meta.env.VITE_TEAMUP_USER_ID || "1"),
  name: "Student",
  role: "STUDENT",
};

export function useCurrentUser() {
  return DEFAULT_USER;
}

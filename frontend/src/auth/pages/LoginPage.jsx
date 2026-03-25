import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from || "/teams";

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed.");
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-lg rounded-3xl border border-[#e8cab5] bg-[#fffdfb] p-8 text-[#6a3a1a] shadow-[0_8px_20px_rgba(123,63,23,0.06)]">
      <h1 className="text-4xl font-extrabold text-[#7b3f17]">Login</h1>
      <p className="mt-2 text-base text-[#8d5e3f]">Sign in to manage your TeamUp activities.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#704021]">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 outline-none focus:border-[#eb8f3a]"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-[#704021]">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 outline-none focus:border-[#eb8f3a]"
          />
        </div>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#ef8f31] px-4 py-3 font-semibold text-white hover:bg-[#df7f21] disabled:opacity-70"
        >
          {submitting ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-4 text-sm text-[#8d5e3f]">
        New here?{" "}
        <Link to="/register" className="font-semibold text-[#ef8f31] hover:underline">
          Create an account
        </Link>
      </p>
    </section>
  );
}

export default LoginPage;

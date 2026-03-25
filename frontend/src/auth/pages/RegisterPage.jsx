import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await register(form);
      navigate("/teams", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto mt-10 w-full max-w-lg rounded-3xl border border-[#e8cab5] bg-[#fffdfb] p-8 text-[#6a3a1a] shadow-[0_8px_20px_rgba(123,63,23,0.06)]">
      <h1 className="text-4xl font-extrabold text-[#7b3f17]">Create Account</h1>
      <p className="mt-2 text-base text-[#8d5e3f]">Register to start creating and joining teams.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-[#704021]">Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 outline-none focus:border-[#eb8f3a]"
          />
        </div>

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
            minLength={6}
            value={form.password}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 outline-none focus:border-[#eb8f3a]"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-[#704021]">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-[#e5c5ad] px-4 py-3 outline-none focus:border-[#eb8f3a]"
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
        </div>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#ef8f31] px-4 py-3 font-semibold text-white hover:bg-[#df7f21] disabled:opacity-70"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-[#8d5e3f]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#ef8f31] hover:underline">
          Login
        </Link>
      </p>
    </section>
  );
}

export default RegisterPage;

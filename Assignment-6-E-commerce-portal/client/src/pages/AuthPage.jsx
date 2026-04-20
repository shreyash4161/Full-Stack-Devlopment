import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    city: "",
    phone: "",
    bio: ""
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "login") {
      await login({
        email: form.email,
        password: form.password
      });
    } else {
      await signup(form);
    }

    navigate("/dashboard");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[36px] border border-white/60 bg-gradient-to-br from-teal-500 to-sky-500 p-8 text-white shadow-[0_24px_80px_rgba(14,165,233,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">Welcome to Resellr</p>
        <h1 className="mt-5 text-4xl font-semibold">A cleaner way to buy and sell second-hand products.</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-white/80">
          Sign in to save favorites, publish polished listings, manage chats, and keep your marketplace profile consistent across every device.
        </p>
      </section>

      <section className="rounded-[36px] border border-white/60 bg-white/72 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
        <div className="inline-flex rounded-full border border-white/60 bg-white/80 p-1 dark:border-white/10 dark:bg-slate-900/70">
          {["login", "signup"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                mode === option
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                  : "text-slate-500"
              }`}
            >
              {option === "login" ? "Login" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "signup" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name">
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="field-base" required />
              </Field>
              <Field label="Role">
                <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="field-base">
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </Field>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Email">
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="field-base" required />
            </Field>
            <Field label="Password">
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="field-base" required />
            </Field>
          </div>

          {mode === "signup" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="City">
                  <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} className="field-base" />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="field-base" />
                </Field>
              </div>
              <Field label="Bio">
                <textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} className="field-base" rows="4" />
              </Field>
            </>
          ) : null}

          <button className="rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(14,165,233,0.28)]">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
}

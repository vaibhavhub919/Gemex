import { useState } from "react";
import { authApi } from "../services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: ""
};

const Login = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response =
        tab === "login" ? await authApi.login(form) : await authApi.register(form);

      onAuthSuccess(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-96px)] max-w-6xl items-center px-4 py-6 sm:py-10 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] bg-ink p-6 text-white shadow-card sm:p-8 lg:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-orange-300">
            Tournament Platform
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl">
            Enter scrims, track winnings, and run the full wallet flow.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            GemeX is set up for player registration, wallet requests, tournament joining,
            and admin operations in one clean MERN workflow.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/90 p-5 shadow-card sm:p-8 lg:p-10">
          <div className="mb-6 flex rounded-full bg-slate-100 p-1">
            {["login", "signup"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition ${
                  tab === item ? "bg-white text-ink shadow-sm" : "text-slate-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {tab === "signup" && (
              <input
                className="input-field"
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Full name"
                required
              />
            )}
            <input
              className="input-field"
              name="email"
              value={form.email}
              onChange={updateField}
              type="email"
              placeholder="Email address"
              required
            />
            {tab === "signup" && (
              <input
                className="input-field"
                name="phone"
                value={form.phone}
                onChange={updateField}
                placeholder="Phone number"
              />
            )}
            <input
              className="input-field"
              name="password"
              value={form.password}
              onChange={updateField}
              type="password"
              placeholder="Password"
              required
            />

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white disabled:bg-orange-300"
            >
              {loading ? "Please wait..." : tab === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;

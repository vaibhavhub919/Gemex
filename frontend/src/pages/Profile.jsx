import { useState } from "react";
import { authApi } from "../services/api";

const Profile = ({ user, onProfileUpdate }) => {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    upiId: user?.upiId || "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await authApi.updateProfile(form);
      onProfileUpdate(response.data.user);
      setMessage("Profile updated successfully.");
      setForm((current) => ({ ...current, password: "" }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Profile update failed.");
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:py-8 lg:px-8">
      <div className="rounded-[32px] bg-white p-5 shadow-card sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Profile</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-4xl">Manage your account</h1>

        <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input className="input-field" name="name" value={form.name} onChange={handleChange} placeholder="Name" />
          <input
            className="input-field"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder="Email"
          />
          <input className="input-field" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
          <input className="input-field" name="upiId" value={form.upiId} onChange={handleChange} placeholder="UPI ID" />
          <div className="md:col-span-2">
            <input
              className="input-field"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="New password (optional)"
            />
          </div>

          {message && <p className="md:col-span-2 text-sm font-medium text-green-600">{message}</p>}
          {error && <p className="md:col-span-2 text-sm font-medium text-red-500">{error}</p>}

          <div className="md:col-span-2">
            <button type="submit" className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white sm:w-auto">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Profile;

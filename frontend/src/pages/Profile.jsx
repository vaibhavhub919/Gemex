import { useState } from "react";
import { authApi } from "../services/api";
import { getErrorMessage, notifyError, notifySuccess } from "../services/notify";

const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
    <path d="M3.75 6.75h16.5v10.5H3.75z" rx="2" />
    <path d="m4.5 7.5 7.5 6 7.5-6" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
    <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.5" />
    <circle cx="12" cy="12" r="3.75" />
    <circle cx="17.25" cy="6.75" r="0.75" className="fill-current stroke-none" />
  </svg>
);

const contactItems = [
  {
    label: "Email",
    value: "gemexofficial18@gmail.com",
    href: "mailto:gemexofficial18@gmail.com",
    icon: MailIcon
  },
  {
    label: "Instagram",
    value: "gemex.official",
    href: "https://www.instagram.com/gemex.official",
    icon: InstagramIcon
  }
];

const Profile = ({ user, onProfileUpdate }) => {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    upiId: user?.upiId || "",
    password: ""
  });

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await authApi.updateProfile(form);
      onProfileUpdate(response.data.user);
      notifySuccess("Profile updated successfully.");
      setForm((current) => ({ ...current, password: "" }));
    } catch (requestError) {
      notifyError(getErrorMessage(requestError, "Profile update failed."));
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
          <div className="md:col-span-2">
            <button type="submit" className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white sm:w-auto">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(16,24,40,0.96),rgba(30,41,59,0.92))] shadow-card">
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-white">Contact Us</p>
            <p className="mt-1 text-sm text-slate-300">Reach GemeX through email or Instagram.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {contactItems.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={label === "Instagram" ? "_blank" : undefined}
                rel={label === "Instagram" ? "noreferrer" : undefined}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/15"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-orange-300">
                  <Icon />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.18em] text-slate-300">{label}</span>
                  <span className="font-semibold">{value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;

import { NavLink } from "react-router-dom";

const BottomNav = ({ isAdmin }) => {
  const items = [
    { label: "Home", to: "/" },
    { label: "Matches", to: "/my-tournaments" },
    { label: "Wallet", to: "/wallet" },
    { label: "Profile", to: "/profile" }
  ];

  if (isAdmin) {
    items.push({ label: "Admin", to: "/admin" });
  }

  return (
    <nav className="fixed bottom-3 left-1/2 z-40 flex w-[min(96%,520px)] -translate-x-1/2 items-center justify-between gap-2 rounded-[28px] border border-white/60 bg-white/92 px-3 py-3 shadow-card backdrop-blur md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `min-w-0 flex-1 truncate rounded-full px-2 py-1 text-center text-xs font-semibold sm:text-sm ${
              isActive ? "bg-orange-50 text-primary" : "text-slate-500"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;

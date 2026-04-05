import { Link, NavLink } from "react-router-dom";

const navItemClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-ink text-white" : "text-slate-600 hover:bg-white/70"
  }`;

const Navbar = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-sand/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <Link to="/" className="font-heading text-xl font-bold text-ink sm:text-2xl">
          GemeX
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={navItemClass}>
            Home
          </NavLink>
          <NavLink to="/my-tournaments" className={navItemClass}>
            My Tournaments
          </NavLink>
          <NavLink to="/wallet" className={navItemClass}>
            Wallet
          </NavLink>
          <NavLink to="/profile" className={navItemClass}>
            Profile
          </NavLink>
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navItemClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-ink">{user?.name || "Guest"}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || "visitor"}</p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white sm:px-4"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-white sm:px-4"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

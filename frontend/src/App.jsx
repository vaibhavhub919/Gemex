import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyTournaments from "./pages/MyTournaments";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import { authApi } from "./services/api";
import { notifyInfo } from "./services/notify";

const ProtectedRoute = ({ user, children, adminOnly = false }) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [booting, setBooting] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setBooting(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch (_error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setBooting(false);
      }
    };

    bootstrap();
  }, []);

  const handleAuthSuccess = ({ token, user: nextUser }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const handleProfileUpdate = (nextUser) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    notifyInfo("Logged out successfully.");
  };

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand">
        <p className="text-lg font-semibold text-ink">Loading platform...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-gradient pb-28 font-body md:pb-10">
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <Login onAuthSuccess={handleAuthSuccess} />}
        />
        <Route
          path="/my-tournaments"
          element={
            <ProtectedRoute user={user}>
              <MyTournaments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute user={user}>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile user={user} onProfileUpdate={handleProfileUpdate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
      {user && <BottomNav isAdmin={user.role === "admin"} />}
      <ToastContainer newestOnTop theme="colored" />
    </div>
  );
};

export default App;

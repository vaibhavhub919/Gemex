import axios from "axios";

const api = axios.create({
  baseURL: "https://gemex.onrender.com" || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (payload) => api.put("/auth/profile", payload)
};

export const tournamentApi = {
  getAll: () => api.get("/tournaments"),
  getMine: () => api.get("/tournaments/mine"),
  join: (id) => api.post(`/tournaments/${id}/join`),
  create: (payload) => api.post("/tournaments", payload),
  updateStatus: (id, payload) => api.put(`/tournaments/${id}/status`, payload),
  updateRoomDetails: (id, payload) => api.put(`/tournaments/${id}/room-details`, payload),
  declareWinner: (id, payload) => api.put(`/tournaments/${id}/winner`, payload),
  delete: (id) => api.delete(`/tournaments/${id}`)
};

export const walletApi = {
  getOverview: () => api.get("/wallet"),
  deposit: (payload) => api.post("/wallet/deposit", payload),
  withdraw: (payload) => api.post("/wallet/withdraw", payload)
};

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getUsers: () => api.get("/admin/users"),
  getTournaments: () => api.get("/admin/tournaments"),
  getPaymentSettings: () => api.get("/admin/payment-settings"),
  getWalletRequests: () => api.get("/admin/wallet-requests"),
  updatePaymentSettings: (payload) => api.put("/admin/payment-settings", payload),
  reviewDeposit: (id, payload) => api.put(`/admin/deposits/${id}`, payload),
  reviewWithdrawal: (id, payload) => api.put(`/admin/withdrawals/${id}`, payload)
};

export default api;

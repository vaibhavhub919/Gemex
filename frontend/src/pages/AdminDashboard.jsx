import { useEffect, useState } from "react";
import { adminApi, tournamentApi } from "../services/api";

const emptyTournament = {
  title: "",
  game: "",
  description: "",
  entryFee: "",
  prizePool: "",
  maxParticipants: "",
  startTime: ""
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({ depositQrImageUrl: "" });
  const [requests, setRequests] = useState({ deposits: [], withdrawals: [] });
  const [tournamentForm, setTournamentForm] = useState(emptyTournament);
  const [roomForms, setRoomForms] = useState({});
  const [savingRoomId, setSavingRoomId] = useState("");
  const [deletingTournamentId, setDeletingTournamentId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  const loadDashboard = async () => {
    try {
      const [statsRes, usersRes, tournamentsRes, settingsRes, requestsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getTournaments(),
        adminApi.getPaymentSettings(),
        adminApi.getWalletRequests()
      ]);

      setStats(statsRes.data.stats || {});
      setUsers(usersRes.data.users || []);
      setTournaments(tournamentsRes.data.tournaments || []);
      setRoomForms(
        (tournamentsRes.data.tournaments || []).reduce((accumulator, item) => {
          accumulator[item._id] = {
            roomId: item.roomId || "",
            roomPassword: item.roomPassword || ""
          };
          return accumulator;
        }, {})
      );
      setPaymentSettings(settingsRes.data.settings || { depositQrImageUrl: "" });
      setRequests(requestsRes.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load admin dashboard.");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const reviewRequest = async (type, id, status) => {
    try {
      if (type === "deposit") {
        await adminApi.reviewDeposit(id, { status });
      } else {
        await adminApi.reviewWithdrawal(id, { status });
      }

      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Review action failed.");
    }
  };

  const handleTournamentCreate = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await tournamentApi.create({
        ...tournamentForm,
        entryFee: Number(tournamentForm.entryFee),
        prizePool: Number(tournamentForm.prizePool),
        maxParticipants: Number(tournamentForm.maxParticipants)
      });
      setTournamentForm(emptyTournament);
      setMessage("Tournament created successfully.");
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Tournament creation failed.");
    }
  };

  const handleTournamentDelete = async (id) => {
    const tournament = tournaments.find((item) => item._id === id);

    if (!tournament) {
      setError("Tournament not found.");
      setMessage("");
      return;
    }

    if (!window.confirm(`Delete tournament "${tournament.title}"?`)) {
      return;
    }

    setDeletingTournamentId(id);
    setError("");
    setMessage("");

    try {
      await tournamentApi.delete(id);
      setMessage("Tournament deleted successfully.");
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Tournament deletion failed.");
    } finally {
      setDeletingTournamentId("");
    }
  };

  const handlePaymentSettingsSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await adminApi.updatePaymentSettings(paymentSettings);
      setPaymentSettings(response.data.settings || { depositQrImageUrl: "" });
      setMessage("Deposit QR updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update deposit QR.");
    }
  };

  const getRoomAccessState = (tournament) => {
    const startTime = new Date(tournament.startTime).getTime();
    const unlockTime = startTime - 10 * 60 * 1000;
    const now = currentTime;
    const formatCountdown = (milliseconds) => {
      const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalSeconds % 60).padStart(2, "0");

      return `${hours}:${minutes}:${seconds}`;
    };

    if (tournament.status === "completed" || tournament.status === "cancelled") {
      return {
        allowed: false,
        message: "Completed ya cancelled tournament me room details update nahi ho sakti."
      };
    }

    if (now < unlockTime) {
      return {
        allowed: false,
        message: `Start time: ${new Date(tournament.startTime).toLocaleString()} • Timer: ${formatCountdown(
          unlockTime - now
        )}`
      };
    }

    return {
      allowed: true,
      message: tournament.roomId
        ? "Room details update kar sakte ho."
        : "Ab room ID aur password add kar sakte ho."
    };
  };

  const handleRoomFormChange = (id, field, value) => {
    setRoomForms((current) => ({
      ...current,
      [id]: {
        roomId: current[id]?.roomId || "",
        roomPassword: current[id]?.roomPassword || "",
        [field]: value
      }
    }));
  };

  const handleRoomDetailsSave = async (tournament) => {
    const accessState = getRoomAccessState(tournament);
    if (!accessState.allowed) {
      setError(accessState.message);
      setMessage("");
      return;
    }

    const form = roomForms[tournament._id] || { roomId: "", roomPassword: "" };
    setSavingRoomId(tournament._id);
    setError("");
    setMessage("");

    try {
      await tournamentApi.updateRoomDetails(tournament._id, form);
      setMessage("Room details updated successfully.");
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update room details.");
    } finally {
      setSavingRoomId("");
    }
  };

  const handleQrFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file for the deposit QR.");
      setMessage("");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPaymentSettings((current) => ({
        ...current,
        depositQrImageUrl: typeof reader.result === "string" ? reader.result : ""
      }));
      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read the selected QR image.");
      setMessage("");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <section className="admin-panel-shell mx-auto max-w-7xl rounded-[40px] px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Admin panel</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-4xl">Dashboard Overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
          Tournament management, wallet approvals aur live room control ek hi jagah se handle karo.
        </p>
      </div>

      {(message || error) && (
        <p
          className={`mb-6 rounded-2xl px-4 py-3 text-sm ${
            error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
          }`}
        >
          {error || message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Users", stats.users],
          ["Tournaments", stats.tournaments],
          ["Pending Deposits", stats.pendingDeposits],
          ["Pending Withdrawals", stats.pendingWithdrawals],
          ["Transactions", stats.totalTransactions]
        ].map(([label, value]) => (
          <div key={label} className="admin-card rounded-[28px]">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
            <p className="mt-3 font-heading text-3xl font-bold text-ink sm:text-4xl">{value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="admin-card">
          <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Create Tournament</h2>
          <form className="mt-5 grid gap-4" onSubmit={handleTournamentCreate}>
            <input className="input-field" placeholder="Title" value={tournamentForm.title} onChange={(event) => setTournamentForm((current) => ({ ...current, title: event.target.value }))} required />
            <input className="input-field" placeholder="Game" value={tournamentForm.game} onChange={(event) => setTournamentForm((current) => ({ ...current, game: event.target.value }))} required />
            <textarea className="input-field min-h-28" placeholder="Description" value={tournamentForm.description} onChange={(event) => setTournamentForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="input-field" placeholder="Entry Fee" type="number" value={tournamentForm.entryFee} onChange={(event) => setTournamentForm((current) => ({ ...current, entryFee: event.target.value }))} required />
              <input className="input-field" placeholder="Prize Pool" type="number" value={tournamentForm.prizePool} onChange={(event) => setTournamentForm((current) => ({ ...current, prizePool: event.target.value }))} required />
              <input className="input-field" placeholder="Max Participants" type="number" value={tournamentForm.maxParticipants} onChange={(event) => setTournamentForm((current) => ({ ...current, maxParticipants: event.target.value }))} required />
              <input className="input-field" type="datetime-local" value={tournamentForm.startTime} onChange={(event) => setTournamentForm((current) => ({ ...current, startTime: event.target.value }))} required />
            </div>
            <button type="submit" className="admin-action-btn bg-ink hover:bg-slate-800">
              Create Tournament
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="admin-card">
            <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Deposit QR</h2>
            <form className="mt-4 space-y-4" onSubmit={handlePaymentSettingsSave}>
              <label className="block rounded-3xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-orange-50/60 p-4 text-sm text-slate-500 transition duration-300 hover:border-primary hover:shadow-md">
                <span className="mb-3 block font-semibold text-ink">Upload QR Image</span>
                <input type="file" accept="image/*" onChange={handleQrFileChange} />
              </label>
              {paymentSettings.depositQrImageUrl && (
                <div className="rounded-3xl border border-slate-200 bg-mist p-4 shadow-inner">
                  <img
                    src={paymentSettings.depositQrImageUrl}
                    alt="Deposit QR preview"
                    className="mx-auto h-40 w-40 rounded-2xl object-cover sm:h-48 sm:w-48"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="admin-action-btn bg-ink hover:bg-slate-800">
                  Save QR
                </button>
                {paymentSettings.depositQrImageUrl && (
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() =>
                      setPaymentSettings((current) => ({
                        ...current,
                        depositQrImageUrl: ""
                      }))
                    }
                  >
                    Remove QR
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-card">
            <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Pending Deposits</h2>
            <div className="mt-4 space-y-3">
              {requests.deposits?.map((item) => (
                <div key={item._id} className="admin-soft-card">
                  <p className="font-semibold text-ink">{item.user?.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Amount: Rs. {item.amount}</p>
                  <p className="text-sm text-slate-500">UPI Transaction ID: {item.upiTransactionId}</p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <button type="button" className="admin-action-btn bg-green-600 px-4 py-2 hover:bg-green-700" onClick={() => reviewRequest("deposit", item._id, "approved")}>
                      Approve
                    </button>
                    <button type="button" className="admin-action-btn bg-red-500 px-4 py-2 hover:bg-red-600" onClick={() => reviewRequest("deposit", item._id, "rejected")}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {!requests.deposits?.length && <p className="text-sm text-slate-500">No pending deposits.</p>}
            </div>
          </div>

          <div className="admin-card">
            <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Pending Withdrawals</h2>
            <div className="mt-4 space-y-3">
              {requests.withdrawals?.map((item) => (
                <div key={item._id} className="admin-soft-card">
                  <p className="font-semibold text-ink">{item.user?.name}</p>
                  <p className="text-sm text-slate-500">
                    Rs. {item.amount} • {item.upiId}
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <button type="button" className="admin-action-btn bg-green-600 px-4 py-2 hover:bg-green-700" onClick={() => reviewRequest("withdrawal", item._id, "approved")}>
                      Approve
                    </button>
                    <button type="button" className="admin-action-btn bg-red-500 px-4 py-2 hover:bg-red-600" onClick={() => reviewRequest("withdrawal", item._id, "rejected")}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {!requests.withdrawals?.length && <p className="text-sm text-slate-500">No pending withdrawals.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card mt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Tournaments</h2>
        </div>
        <div className="mt-4 space-y-3">
          {tournaments.map((item) => {
            const roomAccessState = getRoomAccessState(item);
            const roomForm = roomForms[item._id] || { roomId: item.roomId || "", roomPassword: item.roomPassword || "" };

            return (
              <div key={item._id} className="admin-soft-card">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink">{item.title}</p>
                        <span className="admin-status-pill">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.game} • {new Date(item.startTime).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Players: {item.participants?.length || 0}/{item.maxParticipants}
                        {item.winner?.name ? ` • Winner: ${item.winner.name}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="admin-action-btn bg-red-500 px-4 py-2 hover:bg-red-600"
                      onClick={() => handleTournamentDelete(item._id)}
                      disabled={deletingTournamentId === item._id}
                    >
                      {deletingTournamentId === item._id ? "Deleting..." : "Delete Tournament"}
                    </button>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-600">{roomAccessState.message}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        className="input-field"
                        placeholder="Room ID"
                        value={roomForm.roomId}
                        onChange={(event) => handleRoomFormChange(item._id, "roomId", event.target.value)}
                        disabled={!roomAccessState.allowed || savingRoomId === item._id}
                      />
                      <input
                        className="input-field"
                        placeholder="Room Password"
                        value={roomForm.roomPassword}
                        onChange={(event) => handleRoomFormChange(item._id, "roomPassword", event.target.value)}
                        disabled={!roomAccessState.allowed || savingRoomId === item._id}
                      />
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        className={`admin-action-btn px-4 py-2 ${
                          roomAccessState.allowed ? "bg-ink" : "bg-slate-300"
                        }`}
                        onClick={() => handleRoomDetailsSave(item)}
                        disabled={!roomAccessState.allowed || savingRoomId === item._id}
                      >
                        {savingRoomId === item._id ? "Saving..." : "Save Room Details"}
                      </button>
                      {(item.roomId || item.roomPassword) && (
                        <p className="text-sm text-slate-500">
                          Current: {item.roomId || "--"} / {item.roomPassword || "--"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!tournaments.length && <p className="text-sm text-slate-500">No tournaments available.</p>}
        </div>
      </div>

      <div className="admin-card mt-8">
        <h2 className="font-heading text-xl font-semibold text-ink sm:text-2xl">Users</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Wallet</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id} className="admin-table-row">
                  <td className="py-4 font-semibold text-ink">{item.name}</td>
                  <td className="py-4 text-slate-600">{item.email}</td>
                  <td className="py-4 capitalize text-slate-600">{item.role}</td>
                  <td className="py-4 text-slate-600">Rs. {item.walletBalance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;

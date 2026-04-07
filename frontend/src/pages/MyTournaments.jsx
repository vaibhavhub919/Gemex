import { useEffect, useMemo, useState } from "react";
import { tournamentApi } from "../services/api";
import { getErrorMessage, notifyError } from "../services/notify";

const MyTournaments = () => {
  const [tab, setTab] = useState("active");
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const loadMine = async () => {
      try {
        const response = await tournamentApi.getMine();
        setTournaments(response.data.tournaments || []);
      } catch (requestError) {
        notifyError(getErrorMessage(requestError, "Failed to load tournaments."));
      }
    };

    loadMine();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "active") {
      return tournaments.filter((item) => item.status === "upcoming" || item.status === "live");
    }

    return tournaments.filter((item) => item.status === "completed");
  }, [tab, tournaments]);

  return (
    <section className="tournament-shell mx-auto max-w-6xl rounded-[40px] px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Joined matches</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-ink sm:text-4xl">My Tournaments</h1>
        </div>
        <div className="flex w-full flex-col rounded-[24px] border border-orange-100 bg-white/90 p-1 shadow-card sm:w-auto sm:flex-row sm:rounded-full">
          <button
            type="button"
            className={`tournament-tab ${
              tab === "active"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                : "text-slate-500 hover:bg-orange-50"
            }`}
            onClick={() => setTab("active")}
          >
            Upcoming / Live
          </button>
          <button
            type="button"
            className={`tournament-tab ${
              tab === "completed"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md"
                : "text-slate-500 hover:bg-orange-50"
            }`}
            onClick={() => setTab("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid gap-5">
        {filtered.map((tournament) => (
          <div key={tournament._id} className="tournament-card">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                  {tournament.game}
                </p>
                <h2 className="mt-2 font-heading text-xl font-semibold text-ink sm:text-2xl">
                  {tournament.title}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {new Date(tournament.startTime).toLocaleString()}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="tournament-stat">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                  <p className="mt-2 font-semibold capitalize text-ink">{tournament.status}</p>
                </div>
                <div className="tournament-stat">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Room ID</p>
                  <p className="mt-2 font-semibold text-ink">
                    {tournament.status === "live" ? tournament.roomId || "Awaited" : "--"}
                  </p>
                </div>
                <div className="tournament-stat">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Password</p>
                  <p className="mt-2 font-semibold text-ink">
                    {tournament.status === "live" ? tournament.roomPassword || "Awaited" : "--"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!filtered.length && (
        <div className="tournament-card text-center">
          <p className="text-lg font-semibold text-ink">No tournaments found in this tab.</p>
        </div>
      )}
    </section>
  );
};

export default MyTournaments;

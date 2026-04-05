const TournamentCard = ({ tournament, onJoin, joiningId, isJoined }) => {
  const spotsLeft = tournament.maxParticipants - (tournament.participants?.length || 0);

  return (
    <article className="group rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-card transition hover:-translate-y-1 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            {tournament.game}
          </p>
          <h3 className="font-heading text-xl font-semibold text-ink sm:text-2xl">{tournament.title}</h3>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
          {tournament.status}
        </span>
      </div>

      <p className="mb-5 text-sm leading-6 text-slate-600">
        {tournament.description || "Fast-paced custom room tournament with prize distribution."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Entry Fee</p>
          <p className="mt-2 break-words text-lg font-bold text-ink sm:text-xl">Rs. {tournament.entryFee}</p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Prize Pool</p>
          <p className="mt-2 break-words text-lg font-bold text-ink sm:text-xl">Rs. {tournament.prizePool}</p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Start Time</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {new Date(tournament.startTime).toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-mist p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Spots Left</p>
          <p className="mt-2 text-lg font-bold text-ink sm:text-xl">{spotsLeft}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onJoin(tournament._id)}
        disabled={isJoined || joiningId === tournament._id || tournament.status === "completed"}
        className="mt-6 w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isJoined ? "Joined" : joiningId === tournament._id ? "Joining..." : "Join Tournament"}
      </button>
    </article>
  );
};

export default TournamentCard;

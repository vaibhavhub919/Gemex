const TournamentCard = ({ tournament, onJoin, joiningId, isJoined }) => {
  const spotsLeft = tournament.maxParticipants - (tournament.participants?.length || 0);

  return (
    <article className="tournament-card group">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            {tournament.game}
          </p>
          <h3 className="font-heading text-xl font-semibold text-ink sm:text-2xl">{tournament.title}</h3>
        </div>
        <span className="tournament-status-pill">
          {tournament.status}
        </span>
      </div>

      <p className="mb-5 text-sm leading-6 text-slate-600">
        {tournament.description || "Fast-paced custom room tournament with prize distribution."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="tournament-stat">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Entry Fee</p>
          <p className="mt-2 break-words text-lg font-bold text-ink sm:text-xl">Rs. {tournament.entryFee}</p>
        </div>
        <div className="tournament-stat">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Prize Pool</p>
          <p className="mt-2 break-words text-lg font-bold text-ink sm:text-xl">Rs. {tournament.prizePool}</p>
        </div>
        <div className="tournament-stat">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Start Time</p>
          <p className="mt-2 text-sm font-semibold text-ink">
            {new Date(tournament.startTime).toLocaleString()}
          </p>
        </div>
        <div className="tournament-stat">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Spots Left</p>
          <p className="mt-2 text-lg font-bold text-ink sm:text-xl">{spotsLeft}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onJoin(tournament._id)}
        disabled={isJoined || joiningId === tournament._id || tournament.status === "completed"}
        className="tournament-cta"
      >
        {isJoined ? "Joined" : joiningId === tournament._id ? "Joining..." : "Join Tournament"}
      </button>
    </article>
  );
};

export default TournamentCard;

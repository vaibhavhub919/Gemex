import { useEffect, useMemo, useState } from "react";
import TournamentCard from "../components/TournamentCard";
import { tournamentApi } from "../services/api";
import { getErrorMessage, notifyError, notifySuccess } from "../services/notify";

const heroImages = Object.values(
  import.meta.glob("../assets/home-slider/*.{png,jpg,jpeg,webp,avif}", {
    eager: true,
    import: "default"
  })
);

const Home = ({ user }) => {
  const [tournaments, setTournaments] = useState([]);
  const [joiningId, setJoiningId] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const loadTournaments = async () => {
    try {
      const response = await tournamentApi.getAll();
      setTournaments(response.data.tournaments || []);
    } catch (requestError) {
      notifyError(getErrorMessage(requestError, "Failed to load tournaments."));
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  const activeHeroImage = useMemo(() => {
    if (!heroImages.length) {
      return "";
    }

    return heroImages[activeSlide % heroImages.length];
  }, [activeSlide]);

  const handleJoin = async (id) => {
    if (!user) {
      notifyError("Please login first to join a tournament.");
      return;
    }

    try {
      setJoiningId(id);
      await tournamentApi.join(id);
      notifySuccess("Tournament joined successfully.");
      await loadTournaments();
    } catch (requestError) {
      notifyError(getErrorMessage(requestError, "Unable to join tournament."));
    } finally {
      setJoiningId("");
    }
  };

  return (
    <section className="tournament-shell mx-auto max-w-7xl rounded-[40px] px-4 py-6 sm:px-5 sm:py-8 lg:px-8">
      <div className="grid gap-6 overflow-hidden rounded-[32px] bg-gradient-to-r from-amber-100 via-orange-50 to-red-100 p-5 shadow-card lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary">Live lobby</p>
          <h1 className="mt-3 max-w-xl font-heading text-3xl font-bold text-ink sm:text-4xl lg:text-5xl">
            Join the next match before the room fills up.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            Browse available tournaments, lock your slot instantly, and manage everything from your
            wallet and profile.
          </p>
          {heroImages.length > 1 && (
            <div className="mt-6 flex gap-2">
              {heroImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeSlide ? "w-10 bg-ink" : "w-2.5 bg-white/80"
                  }`}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative min-h-[240px] overflow-hidden rounded-[28px] bg-white/60 ring-1 ring-white/70 sm:min-h-[320px]">
          {activeHeroImage ? (
            <>
              {heroImages.map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt={`Hero slide ${index + 1}`}
                  className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${
                    index === activeSlide ? "scale-100 opacity-100" : "scale-105 opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-white/10" />
            </>
          ) : (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.45),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(254,242,242,0.8))] p-6 text-center sm:min-h-[320px]">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary">Add Slider Images</p>
              <p className="mt-4 max-w-sm text-base leading-7 text-slate-600">
                Save your hero images inside <span className="font-semibold text-ink">`frontend/src/assets/home-slider/`</span>.
              </p>
              <p className="mt-2 text-sm text-slate-500">PNG, JPG, JPEG, WEBP, aur AVIF files automatically show hongi.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament._id}
            tournament={tournament}
            onJoin={handleJoin}
            joiningId={joiningId}
            isJoined={Boolean(
              tournament.participants?.some((participant) => participant.user === user?._id)
            )}
          />
        ))}
      </div>

      {!tournaments.length && (
        <div className="tournament-card mt-8 text-center">
          <p className="text-lg font-semibold text-ink">No tournaments available right now.</p>
          <p className="mt-2 text-sm text-slate-500">Create one from admin dashboard later.</p>
        </div>
      )}
    </section>
  );
};

export default Home;

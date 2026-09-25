import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaBolt, FaMapMarkerAlt, FaShieldAlt, FaUber, FaWallet } from "react-icons/fa";

const readStoredDriverStatus = () => {
  try {
    const saved = localStorage.getItem("nova_uber_driver_status");
    return saved ? JSON.parse(saved) : { available: true, location: null };
  } catch (error) {
    return { available: true, location: null };
  }
};

const readStoredDriverLocation = () => {
  try {
    const saved = localStorage.getItem("nova_uber_live_location");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
};

const UberDriverDashboardPage = () => {
  const [driverStatus, setDriverStatus] = useState(readStoredDriverStatus());
  const [liveLocation, setLiveLocation] = useState(readStoredDriverLocation());
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    localStorage.setItem("nova_uber_driver_status", JSON.stringify(driverStatus));
  }, [driverStatus]);

  useEffect(() => {
    if (liveLocation) {
      localStorage.setItem("nova_uber_live_location", JSON.stringify(liveLocation));
    }
  }, [liveLocation]);

  const pinCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location services are not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setLiveLocation(nextLocation);
        setDriverStatus((current) => ({ ...current, location: nextLocation }));
      },
      () => setLocationError("Allow location access so customers can find your route and pickup point."),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const stats = useMemo(
    () => [
      { label: "Today's rides", value: "18", icon: <FaBolt className="text-amber-300" /> },
      { label: "Earnings", value: "$540", icon: <FaWallet className="text-emerald-300" /> },
      { label: "Verified", value: "KYC OK", icon: <FaShieldAlt className="text-cyan-300" /> },
    ],
    []
  );

  const googleMapsUrl = liveLocation
    ? `https://www.google.com/maps/search/?api=1&query=${liveLocation.latitude},${liveLocation.longitude}`
    : "https://www.google.com/maps";

  return (
    <main className="min-h-screen bg-[#040d19] text-slate-100">
      <header className="border-b border-sky-500/20 bg-[#081827]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sky-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-300 text-xl text-[#081827]">
              <FaUber />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-200/80">Nova driver</p>
              <p className="text-lg font-black uppercase leading-[0.9] tracking-[-0.05em]">Driver dashboard</p>
            </div>
          </div>
          <Link to="/customer" className="rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
            Storefront
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-sky-500/20 bg-gradient-to-r from-[#081827] via-[#122948] to-[#153b72] p-6 shadow-[0_20px_60px_rgba(14,165,233,0.18)] sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-200/80">Welcome aboard</p>
              <h1 className="mt-2 text-3xl font-black uppercase text-white sm:text-4xl">Your driver control center</h1>
            </div>
            <button
              type="button"
              onClick={() => setDriverStatus((current) => ({ ...current, available: !current.available }))}
              className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.2em] ${driverStatus.available ? "bg-emerald-500 text-white" : "bg-slate-600 text-slate-100"}`}
            >
              {driverStatus.available ? "Available" : "Offline"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-sky-100/70">{stat.label}</span>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <p className="mt-3 text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-sky-500/20 bg-[#0a1831] p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-200/80">Live route</p>
                <h2 className="mt-2 text-2xl font-black text-white">Pin your current pickup point</h2>
              </div>
              <FaMapMarkerAlt className="text-2xl text-sky-300" />
            </div>

            <button
              type="button"
              onClick={pinCurrentLocation}
              className="mt-5 w-full rounded-xl bg-sky-300 px-4 py-3 text-sm font-black uppercase text-[#081827] hover:bg-sky-200"
            >
              Share my live location
            </button>

            {liveLocation ? (
              <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4 text-sm text-sky-100">
                <p>Latitude: {liveLocation.latitude.toFixed(5)}</p>
                <p>Longitude: {liveLocation.longitude.toFixed(5)}</p>
                <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block font-semibold text-sky-300 underline underline-offset-4">
                  Open in Google Maps
                </a>
              </div>
            ) : (
              <p className="mt-5 text-sm text-sky-100/70">Your live pickup location is not shared yet. Use the button above to enable it.</p>
            )}

            {locationError && <p className="mt-4 text-sm text-red-300">{locationError}</p>}
          </div>

          <div className="rounded-3xl border border-sky-500/20 bg-[#0a1831] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-200/80">Driver profile</p>
            <h2 className="mt-2 text-2xl font-black text-white">Account status</h2>

            <div className="mt-5 space-y-3 text-sm text-sky-100/80">
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4">
                <p className="font-semibold text-sky-100">Verification</p>
                <p className="mt-2">KYC verified automatically</p>
              </div>
              <div className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4">
                <p className="font-semibold text-sky-100">Driver license</p>
                <p className="mt-2">Awaiting team review</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-sky-500/20 bg-[#0a1831] p-6">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-200/80">Ride queue</p>
          <h2 className="mt-2 text-2xl font-black text-white">Current trip opportunities</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ["Airport pickup", "2 min away", "$23"],
              ["Downtown delivery", "7 min away", "$18"],
              ["School run", "12 min away", "$27"],
            ].map(([title, timing, rate]) => (
              <article key={title} className="rounded-2xl border border-sky-500/20 bg-[#091a2c] p-4">
                <p className="text-lg font-black text-sky-50">{title}</p>
                <p className="mt-2 text-sm text-sky-100/70">{timing}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-300">{rate}</span>
                  <button type="button" className="rounded-full bg-sky-300 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#081827]">
                    Accept
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default UberDriverDashboardPage;

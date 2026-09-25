import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaUber } from "react-icons/fa";

const demoDrivers = [
  { id: 1, name: "Akinyi M.", available: true, car: "Toyota Prius", rating: 4.9, latitude: -1.286367, longitude: 36.8172 },
  { id: 2, name: "Brian K.", available: true, car: "Honda Fit", rating: 4.8, latitude: -1.2921, longitude: 36.8219 },
  { id: 3, name: "Faith W.", available: false, car: "Hyundai Elantra", rating: 4.6, latitude: -1.2793, longitude: 36.8112 },
  { id: 4, name: "Oduor N.", available: true, car: "Mazda Demio", rating: 4.7, latitude: -1.3012, longitude: 36.8321 },
  { id: 5, name: "Jane C.", available: true, car: "Kia Rio", rating: 5.0, latitude: -1.2705, longitude: 36.8067 },
];

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (pointA, pointB) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(pointB.latitude - pointA.latitude);
  const dLng = toRadians(pointB.longitude - pointA.longitude);
  const latA = toRadians(pointA.latitude);
  const latB = toRadians(pointB.latitude);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(latA) * Math.cos(latB);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const readStoredLocation = () => {
  try {
    const saved = localStorage.getItem("nova_uber_live_location");
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
};

const readStoredDriverStatus = () => {
  try {
    const saved = localStorage.getItem("nova_uber_driver_status");
    return saved ? JSON.parse(saved) : { available: true, location: null };
  } catch (error) {
    return { available: true, location: null };
  }
};

const UberDriversPage = () => {
  const [customerLocation, setCustomerLocation] = useState(readStoredLocation());
  const [locationError, setLocationError] = useState("");
  const [driverStatus, setDriverStatus] = useState(readStoredDriverStatus());

  useEffect(() => {
    if (customerLocation) {
      localStorage.setItem("nova_uber_live_location", JSON.stringify(customerLocation));
    }
  }, [customerLocation]);

  useEffect(() => {
    localStorage.setItem("nova_uber_driver_status", JSON.stringify(driverStatus));
  }, [driverStatus]);

  const pinCustomerLocation = () => {
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
        setCustomerLocation(nextLocation);
      },
      () => setLocationError("Allow location access so we can show Uber drivers near you."),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const driverMatches = useMemo(() => {
    if (!customerLocation) return [];

    return demoDrivers
      .filter((driver) => driver.available)
      .map((driver) => ({
        ...driver,
        distanceKm: Number(getDistanceKm(customerLocation, { latitude: driver.latitude, longitude: driver.longitude }).toFixed(1)),
      }))
      .filter((driver) => driver.distanceKm <= 8)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [customerLocation]);

  const toggleDriverStatus = () => {
    setDriverStatus((current) => ({ ...current, available: !current.available }));
  };

  const googleMapsUrl = customerLocation
    ? `https://www.google.com/maps/search/?api=1&query=${customerLocation.latitude},${customerLocation.longitude}`
    : "https://www.google.com/maps";

  return (
    <main className="min-h-screen bg-[#040d19] text-slate-100">
      <header className="border-b border-sky-500/20 bg-[#081827]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/customer" className="flex items-center gap-3 text-sky-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-300 text-xl text-[#081827]">
              <FaUber />
            </span>
            <span className="text-xl font-black uppercase leading-[0.8] tracking-[-0.06em]">Nova Uber</span>
          </Link>
          <Link to="/customer" className="rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-200">
            Back to store
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-sky-500/20 bg-gradient-to-r from-[#081827] via-[#122948] to-[#153b72] p-6 shadow-[0_20px_60px_rgba(14,165,233,0.18)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-200/80">Ride nearby</p>
              <h1 className="mt-2 text-3xl font-black uppercase text-white sm:text-5xl">Find an Uber near you</h1>
            </div>
            <div className="rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-100">
              {driverStatus.available ? "Driver status: Available" : "Driver status: Not available"}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-sky-500/20 bg-[#0a1831] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-200/80">Live location</p>
                  <h2 className="mt-2 text-xl font-bold text-sky-50">Your pinned pickup point</h2>
                </div>
                <FaMapMarkerAlt className="text-2xl text-sky-300" />
              </div>

              <button
                type="button"
                onClick={pinCustomerLocation}
                className="mt-5 w-full rounded-xl bg-sky-300 px-4 py-3 text-sm font-black uppercase text-[#081827] hover:bg-sky-200"
              >
                Pin my live location on Google Maps
              </button>

              {customerLocation ? (
                <div className="mt-5 rounded-xl border border-sky-400/20 bg-sky-500/5 p-4">
                  <p className="text-sm text-sky-100">Latitude: {customerLocation.latitude.toFixed(5)}</p>
                  <p className="text-sm text-sky-100">Longitude: {customerLocation.longitude.toFixed(5)}</p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold text-sky-300 underline underline-offset-4"
                  >
                    Open in Google Maps
                  </a>
                </div>
              ) : (
                <p className="mt-5 text-sm text-sky-100/70">No live location pinned yet. Use the button above to find nearby drivers.</p>
              )}

              {locationError && <p className="mt-4 text-sm text-red-300">{locationError}</p>}
            </div>

            <div className="rounded-2xl border border-sky-500/20 bg-[#0a1831] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-200/80">Driver profile</p>
              <h2 className="mt-2 text-xl font-bold text-sky-50">Availability status</h2>
              <div className="mt-5 rounded-2xl border border-sky-400/20 bg-sky-500/5 p-4">
                <p className="text-sm text-sky-100">Current status</p>
                <button
                  type="button"
                  onClick={toggleDriverStatus}
                  className={`mt-3 w-full rounded-full px-4 py-3 text-sm font-black uppercase ${driverStatus.available ? "bg-emerald-500 text-white" : "bg-slate-600 text-slate-100"}`}
                >
                  {driverStatus.available ? "Available - click to mark unavailable" : "Unavailable - click to mark available"}
                </button>
                <p className="mt-3 text-xs text-sky-100/70">When available, nearby customers can check your live GPS location and route to your pickup point.</p>
              </div>

              {driverStatus.location && (
                <div className="mt-4 rounded-xl border border-sky-400/20 bg-sky-500/5 p-4 text-sm text-sky-100">
                  <p>Last shared live GPS:</p>
                  <p className="mt-1">{driverStatus.location.latitude.toFixed(5)}, {driverStatus.location.longitude.toFixed(5)}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${driverStatus.location.latitude},${driverStatus.location.longitude}`} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-sky-300 underline">
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-sky-500/20 bg-[#0a1831] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-200/80">Available rides</p>
              <h2 className="mt-2 text-2xl font-black text-white">Drivers near your location</h2>
            </div>
            <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase text-sky-200">
              {driverMatches.length} drivers
            </span>
          </div>

          {!customerLocation ? (
            <div className="mt-6 rounded-2xl border border-dashed border-sky-500/30 bg-sky-500/5 p-6 text-center text-sm text-sky-100/80">
              Please pin your live location first to discover nearby available Ubers.
            </div>
          ) : driverMatches.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-sky-500/30 bg-sky-500/5 p-6 text-center text-sm text-sky-100/80">
              No available Uber drivers are within 8 km of your current location right now.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {driverMatches.map((driver) => (
                <article key={driver.id} className="rounded-2xl border border-sky-500/20 bg-[#091a2c] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-sky-50">{driver.name}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-sky-200/80">{driver.car}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                      Available
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-sky-100/80">
                    <p>Rating: {driver.rating}/5</p>
                    <p>Distance: {driver.distanceKm} km away</p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${driver.latitude},${driver.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-sky-300 px-4 py-2 text-xs font-black uppercase text-[#081827] hover:bg-sky-200"
                  >
                    Open route in Google Maps
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default UberDriversPage;

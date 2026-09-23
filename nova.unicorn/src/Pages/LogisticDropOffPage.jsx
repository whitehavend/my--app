import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiMapPin, FiNavigation } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getLogisticRequests } from "../Store/thunk";

const LogisticDropOffPage = () => {
  const dispatch = useAppDispatch();
  const { requests, status, error } = useAppSelector((state) => state.logistics);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    dispatch(getLogisticRequests());
  }, [dispatch]);

  const uniqueDropOffs = useMemo(() => {
    const seen = new Set();
    return requests.filter((request) => Number.isFinite(Number(request.dropOffLatitude)) && Number.isFinite(Number(request.dropOffLongitude))).filter((request) => {
      const key = `${Number(request.dropOffLatitude).toFixed(5)},${Number(request.dropOffLongitude).toFixed(5)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [requests]);

  const routeDistance = useMemo(() => {
    if (!currentLocation || !uniqueDropOffs.length) return null;
    const toRadians = (value) => value * Math.PI / 180;
    const distanceBetween = (first, second) => {
      const earthRadiusKm = 6371;
      const latitudeDelta = toRadians(second.latitude - first.latitude);
      const longitudeDelta = toRadians(second.longitude - first.longitude);
      const latitudeOne = toRadians(first.latitude);
      const latitudeTwo = toRadians(second.latitude);
      const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
      return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    };
    let nextPoint = currentLocation;
    let remaining = uniqueDropOffs.map((request) => ({ latitude: Number(request.dropOffLatitude), longitude: Number(request.dropOffLongitude) }));
    let total = 0;
    while (remaining.length) {
      let nextIndex = 0;
      let closestDistance = distanceBetween(nextPoint, remaining[0]);
      for (let index = 1; index < remaining.length; index += 1) {
        const candidateDistance = distanceBetween(nextPoint, remaining[index]);
        if (candidateDistance < closestDistance) {
          nextIndex = index;
          closestDistance = candidateDistance;
        }
      }
      const next = remaining.splice(nextIndex, 1)[0];
      total += distanceBetween(nextPoint, next);
      nextPoint = next;
    }
    return total;
  }, [currentLocation, uniqueDropOffs]);

  const pinCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Location services are not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }), () => setLocationError("Allow location access to calculate the route from your current position."));
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/logistic" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><FiArrowLeft /> Back to dashboard</Link>
        <header className="mt-5 rounded-3xl bg-emerald-950 p-6 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">Delivery route desk</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Where to drop off the items</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">Open the customer’s pinned destination in Google Maps to see the drop-off point and get turn-by-turn directions.</p>
        </header>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <section className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Route summary</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Unique drop-off distance</h2><p className="mt-2 text-sm text-slate-600">{uniqueDropOffs.length} unique destination{uniqueDropOffs.length === 1 ? "" : "s"}; duplicate pins are counted once.</p></div><button type="button" onClick={pinCurrentLocation} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white"><FiNavigation />{currentLocation ? "Refresh starting point" : "Use current location"}</button></div><p className="mt-4 text-3xl font-black text-emerald-800">{routeDistance === null ? "--" : `${routeDistance.toFixed(1)} km`}</p><p className="mt-1 text-xs text-slate-500">Straight-line planning estimate from your current location through each unique destination. Open each Google Maps route for turn-by-turn road distance.</p>{locationError && <p className="mt-3 text-sm text-red-600">{locationError}</p>}</section>
        {status === "loading" && <p className="mt-5 rounded-xl bg-white p-8 text-center text-sm text-slate-500">Loading drop-off locations...</p>}
        <section className="mt-5 space-y-4">
          {status !== "loading" && !requests.length && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No assigned drop-off locations yet.</p>}
          {requests.map((request) => {
            const destination = request.dropOffGoogleMapsUrl || (request.dropOffLatitude && request.dropOffLongitude ? `https://www.google.com/maps/search/?api=1&query=${request.dropOffLatitude},${request.dropOffLongitude}` : "");
            const routeUrl = destination ? `https://www.google.com/maps/dir/?api=1&destination=${request.dropOffLatitude},${request.dropOffLongitude}&travelmode=driving` : "";
            return <article key={request._id} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Order {request.orderId || "Pending"}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{request.dropOffAddress || "Pinned customer location"}</h2><p className="mt-2 text-sm text-slate-600">Pickup request status: <span className="font-semibold capitalize">{String(request.status || "pending").replace("_", " ")}</span></p>{request.orderStatus && <p className="mt-1 text-sm text-slate-600">Order status: <span className="font-semibold capitalize">{request.orderStatus.replace("_", " ")}</span></p>}</div><FiMapPin className="text-3xl text-rose-600" /></div><div className="mt-5 flex flex-wrap gap-3">{destination && <a href={destination} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white"><FiMapPin /> Open drop-off pin</a>}{routeUrl && <a href={routeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-bold text-emerald-800"><FiNavigation /> Get driving route</a>}{!destination && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">This order does not have a location pin yet.</p>}</div></article>;
          })}
        </section>
      </div>
    </main>
  );
};

export default LogisticDropOffPage;

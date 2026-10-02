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

  const activeRequests = useMemo(() => requests.filter((request) => (
    !['rejected', 'delivered'].includes(request.status) && request.orderStatus !== 'delivered'
  )), [requests]);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const selectedRequest = activeRequests.find((request) => String(request._id) === String(selectedRequestId));
  const hasSelectedCoordinates = selectedRequest
    && selectedRequest.dropOffLatitude !== undefined && selectedRequest.dropOffLatitude !== null
    && selectedRequest.dropOffLongitude !== undefined && selectedRequest.dropOffLongitude !== null
    && Number.isFinite(Number(selectedRequest.dropOffLatitude))
    && Number.isFinite(Number(selectedRequest.dropOffLongitude));

  const selectedDistance = useMemo(() => {
    if (!currentLocation || !hasSelectedCoordinates) return null;
    const toRadians = (value) => value * Math.PI / 180;
    const latitudeOne = toRadians(currentLocation.latitude);
    const latitudeTwo = toRadians(Number(selectedRequest.dropOffLatitude));
    const latitudeDelta = latitudeTwo - latitudeOne;
    const longitudeDelta = toRadians(Number(selectedRequest.dropOffLongitude) - currentLocation.longitude);
    const haversine = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }, [currentLocation, hasSelectedCoordinates, selectedRequest]);

  const pinCurrentLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Location services are not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => setCurrentLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }), () => setLocationError("Allow location access to calculate the route from your current position."));
  };

  const selectDelivery = (request) => {
    setSelectedRequestId(String(request._id));
    setLocationError("");
    if (!currentLocation) pinCurrentLocation();
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/logistic" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><FiArrowLeft /> Back to dashboard</Link>
        <header className="mt-5 rounded-3xl bg-emerald-950 p-6 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">Delivery route desk</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Where to drop off the items</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/80">Select an assigned delivery to calculate the distance from your location and open its driving route in Google Maps.</p>
        </header>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <section className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Route summary</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Selected delivery distance</h2>
              <p className="mt-2 text-sm text-slate-600">{activeRequests.length} active assigned {activeRequests.length === 1 ? "delivery" : "deliveries"}{selectedRequest ? ` · Order ${selectedRequest.orderId || "Pending"}` : " · Select a delivery below"}</p>
            </div>
            <button type="button" onClick={pinCurrentLocation} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white"><FiNavigation />{currentLocation ? "Refresh starting point" : "Use current location"}</button>
          </div>
          <p className="mt-4 text-3xl font-black text-emerald-800">{selectedDistance === null ? "--" : `${selectedDistance.toFixed(1)} km`}</p>
          <p className="mt-1 text-xs text-slate-700">Straight-line estimate to the selected delivery. Google Maps provides the road route.</p>
          {locationError && <p className="mt-3 text-sm text-red-600">{locationError}</p>}
        </section>
        {status === "loading" && <p className="mt-5 rounded-xl bg-white p-8 text-center text-sm text-slate-500">Loading drop-off locations...</p>}
        <section className="mt-5 space-y-4">
          {status !== "loading" && !activeRequests.length && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-700">No active assigned drop-offs.</p>}
          {activeRequests.map((request) => {
            const hasCoordinates = request.dropOffLatitude !== undefined && request.dropOffLatitude !== null && request.dropOffLongitude !== undefined && request.dropOffLongitude !== null;
            const destination = request.dropOffGoogleMapsUrl || (hasCoordinates ? `https://www.google.com/maps/search/?api=1&query=${request.dropOffLatitude},${request.dropOffLongitude}` : "");
            const isSelected = String(selectedRequestId) === String(request._id);
            const routeUrl = hasCoordinates
              ? `https://www.google.com/maps/dir/?api=1${currentLocation ? `&origin=${currentLocation.latitude},${currentLocation.longitude}` : ""}&destination=${request.dropOffLatitude},${request.dropOffLongitude}&travelmode=driving`
              : "";
            return (
              <article key={request._id} className={`rounded-2xl bg-white p-5 shadow-sm sm:p-6 ${isSelected ? "ring-2 ring-emerald-600" : ""}`}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Order {request.orderId || "Pending"}</p>
                    <h2 className="mt-1 text-xl font-bold text-slate-900">{request.dropOffAddress || "Pinned customer location"}</h2>
                    <p className="mt-2 text-sm text-slate-700">Pickup request status: <span className="font-semibold capitalize">{String(request.status || "pending").replace("_", " ")}</span></p>
                    {request.orderStatus && <p className="mt-1 text-sm text-slate-700">Order status: <span className="font-semibold capitalize">{request.orderStatus.replace("_", " ")}</span></p>}
                    {isSelected && selectedDistance !== null && <p className="mt-2 text-sm font-bold text-emerald-800">Distance from your location: {selectedDistance.toFixed(1)} km</p>}
                  </div>
                  <FiMapPin className="text-3xl text-rose-600" />
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => selectDelivery(request)} disabled={!hasCoordinates} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? "bg-slate-700" : "bg-emerald-700 hover:bg-emerald-800"}`}><FiNavigation />{isSelected ? "Selected delivery" : "Calculate distance"}</button>
                  {destination && <a href={destination} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-bold text-emerald-800"><FiMapPin />Open drop-off pin</a>}
                  {isSelected && routeUrl && <a href={routeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-3 text-sm font-bold text-slate-900"><FiNavigation />Open route in Google Maps</a>}
                  {!destination && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">This order does not have a location pin yet.</p>}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default LogisticDropOffPage;

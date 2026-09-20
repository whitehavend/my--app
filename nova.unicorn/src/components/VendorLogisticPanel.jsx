import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../Store/hooks";
import { getAvailableLogistics, requestLogistic } from "../Store/thunk";

const VendorLogisticPanel = () => {
  const dispatch = useAppDispatch();
  const { logistics, status, error } = useAppSelector((state) => state.logistics);

  useEffect(() => {
    const refreshAvailableLogistics = () => dispatch(getAvailableLogistics());
    refreshAvailableLogistics();
    const refreshTimer = setInterval(refreshAvailableLogistics, 5000);

    return () => clearInterval(refreshTimer);
  }, [dispatch]);

  const handleRequest = async (logisticId) => {
    const result = await dispatch(requestLogistic(logisticId));
    if (requestLogistic.fulfilled.match(result)) {
      dispatch(getAvailableLogistics());
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Pickup coordination</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">Available logistics</h2>
        <p className="mt-2 text-sm text-slate-600">Request an available logistic partner to collect your prepared items.</p>
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {status !== "loading" && !logistics.length && !error && <p className="mt-4 text-sm text-slate-600">No logistics are currently available.</p>}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {logistics.map((logistic) => (
            <article key={logistic.id || logistic.uid} className="rounded-xl border border-emerald-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">{logistic.fullName || "Logistic partner"}</h3>
              <p className="mt-1 text-sm text-slate-600">Phone: {logistic.countryCode} {logistic.phoneNumber}</p>
              <button type="button" onClick={() => handleRequest(logistic.id || logistic.uid)} className="mt-3 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                Request pickup
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VendorLogisticPanel;

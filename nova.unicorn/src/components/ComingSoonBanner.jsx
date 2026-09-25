const ComingSoonBanner = ({ label }) => (
  <div className="flex min-h-40 w-full items-center justify-center bg-gradient-to-r from-[#081827] via-[#11233d] to-[#1d4ed8] px-6 py-10 text-center text-white shadow-[0_10px_25px_rgba(37,99,235,0.18)] md:min-h-52">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/80">{label}</p>
      <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-sky-50">Coming soon</h2>
      <p className="mt-2 text-sm text-sky-100/80">New vendor listings will appear here.</p>
    </div>
  </div>
);

export default ComingSoonBanner;

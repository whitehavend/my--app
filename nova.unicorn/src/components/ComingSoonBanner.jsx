const ComingSoonBanner = ({ label }) => (
  <div className="flex min-h-40 w-full items-center justify-center bg-gradient-to-r from-[#111315] via-[#191b1e] to-[#24272a] px-6 py-10 text-center text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)] md:min-h-52">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c4c8cc]">{label}</p>
      <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.12em] text-[#f3f5f7]">Coming soon</h2>
      <p className="mt-2 text-sm text-[#c4c8cc]">New vendor listings will appear here.</p>
    </div>
  </div>
);

export default ComingSoonBanner;

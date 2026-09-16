const ComingSoonBanner = ({ label }) => (
  <div className="flex min-h-40 w-full items-center justify-center bg-gradient-to-r from-primary to-sky-700 px-6 py-10 text-center text-white md:min-h-52">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">{label}</p>
      <h2 className="mt-2 text-3xl font-black uppercase tracking-[0.12em]">Coming soon</h2>
      <p className="mt-2 text-sm text-white/80">New vendor listings will appear here.</p>
    </div>
  </div>
);

export default ComingSoonBanner;

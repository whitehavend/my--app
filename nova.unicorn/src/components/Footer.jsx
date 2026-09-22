const Footer = () => {
  return (
    <footer className="relative isolate flex min-h-56 items-center justify-center overflow-hidden bg-[#102f2c] px-6 py-14 text-center text-white">
      <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border-[28px] border-emerald-300/15" aria-hidden="true" />
      <div className="absolute -right-12 -top-20 h-56 w-56 rotate-12 border border-lime-200/20" aria-hidden="true" />
      <div className="relative max-w-3xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.38em] text-lime-200/80">Nova Unicorn marketplace</p>
        <p className="font-serif text-3xl leading-tight tracking-tight sm:text-5xl">A marketplace filled with <em className="text-lime-200">unlimited opportunities.</em></p>
        <div className="mx-auto mt-6 h-px w-20 bg-lime-200/60" />
      </div>
    </footer>
  );
};

export default Footer;

const Footer = () => {
  return (
    <footer className="relative isolate flex min-h-56 items-center justify-center overflow-hidden border-t border-white/10 bg-[#02070d] px-6 py-14 text-center text-white">
      <div className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border-[28px] border-[#c4c8cc]/10" aria-hidden="true" />
      <div className="absolute -right-12 -top-20 h-56 w-56 rotate-12 border border-[#c4c8cc]/15" aria-hidden="true" />
      <div className="relative max-w-3xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.38em] text-[#c4c8cc]">Nova Unicorn marketplace</p>
        <p className="font-serif text-3xl leading-tight tracking-tight text-[#f3f5f7] sm:text-5xl">A marketplace filled with <em className="text-[#c4c8cc]">unlimited opportunities.</em></p>
        <div className="mx-auto mt-6 h-px w-20 bg-[#c4c8cc]/60" />
      </div>
    </footer>
  );
};

export default Footer;

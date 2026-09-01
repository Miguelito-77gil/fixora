function Footer() {
  return (
    <footer className="border-t border-[#e7e2dc] bg-[#f7f7f5]">
      <div className="fixora-container flex flex-col items-center justify-center gap-2 py-5 text-center sm:flex-row sm:justify-between sm:text-left">

        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-[#17202a]">
            Fixora
          </span>

          <span className="text-xs text-[#a0a5a9]">
            · Repair Services
          </span>
        </div>

        <p className="text-xs text-[#90979d]">
          © 2026 Fixora. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;

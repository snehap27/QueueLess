import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-lg font-bold text-slate-950">QueueLess</p>
          <p className="mt-1 text-sm text-slate-500">
            © 2026 QueueLess. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
          <Link to="/login" className="transition hover:text-emerald-600">
            Quick Links
          </Link>
          <Link to="/" className="transition hover:text-emerald-600">
            Privacy
          </Link>
          <Link to="/" className="transition hover:text-emerald-600">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

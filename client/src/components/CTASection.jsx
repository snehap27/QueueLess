import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function CTASection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-emerald-500 px-6 py-14 text-center shadow-2xl shadow-emerald-500/25 sm:px-10 lg:px-16">
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to say goodbye to waiting rooms?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-50">
            Set up your first queue in under a minute.
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Create your Queue
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;

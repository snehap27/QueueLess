import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  Clock3,
  Headphones,
  Ticket,
} from "lucide-react";

import CTASection from "../components/CTASection";
import FeatureCard from "../components/FeatureCard";
import Footer from "../components/Footer";
import HowItWorks from "../components/HowItWorks";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: Clock3,
    title: "Real-time Queue Updates",
    description:
      "Keep customers informed with live queue movement and clear wait visibility.",
  },
  {
    icon: Ticket,
    title: "Digital Tokens",
    description:
      "Replace paper slips with simple online tokens that customers can access instantly.",
  },
  {
    icon: BarChart3,
    title: "Business Dashboard",
    description:
      "Manage queues, counters, and customer flow from a clean business workspace.",
  },
  {
    icon: Headphones,
    title: "Fast Customer Service",
    description:
      "Serve the next customer faster and reduce crowding around your front desk.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-5 pt-32 sm:px-6 lg:px-8">
          <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute right-0 top-40 -z-10 h-52 w-52 rounded-full bg-green-200/40 blur-3xl" />

          <div className="mx-auto max-w-7xl pb-20 pt-10 text-center sm:pb-24 lg:pb-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-950/5">
              <Check size={16} strokeWidth={3} />
              Trusted Virtual Queue Platform
            </div>

            <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Skip the Waiting.
              <span className="mt-2 block bg-gradient-to-r from-emerald-500 to-green-700 bg-clip-text text-transparent">
                Join the Queue Online.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              QueueLess helps service businesses manage walk-ins, issue digital
              tokens, and keep customers updated before they reach the counter.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 sm:w-auto"
              >
                Get Started
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:w-auto"
              >
                Login
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Everything you need to run a modern queue
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Purpose-built for clinics, salons, banks, government offices
                and service businesses.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

export default Home;

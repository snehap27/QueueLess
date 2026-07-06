import { Building2, Smartphone, UserCheck } from "lucide-react";

const steps = [
  {
    icon: Building2,
    title: "Business creates queue",
    description: "Set up a queue for any counter, branch, or service desk.",
  },
  {
    icon: Smartphone,
    title: "Customer joins online",
    description: "Visitors receive a digital place in line from anywhere.",
  },
  {
    icon: UserCheck,
    title: "Business serves next customer",
    description: "Staff can call the next person and keep service moving.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-emerald-50/45 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            A simple flow for teams and customers, from setup to service.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative">
                <div className="h-full rounded-3xl border border-emerald-100 bg-white p-6 text-center shadow-lg shadow-emerald-950/5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white shadow-lg shadow-emerald-500/25">
                    {index + 1}
                  </div>
                  <div className="mx-auto mt-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block">
                    <span className="absolute left-[calc(100%-12px)] top-1/2 z-10 -translate-y-1/2 text-3xl font-light text-emerald-400">
                      →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

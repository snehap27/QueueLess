function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/10">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Icon size={24} strokeWidth={2.2} />
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </article>
  );
}

export default FeatureCard;

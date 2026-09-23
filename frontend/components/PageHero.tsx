interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-uninus-dark py-16 text-white sm:py-20">
      <div
        className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(90deg,transparent_0,transparent_38px,#ffffff_38px,#ffffff_40px)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

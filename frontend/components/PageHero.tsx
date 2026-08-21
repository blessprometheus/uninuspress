interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export default function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="bg-uninus-dark py-16 text-white sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
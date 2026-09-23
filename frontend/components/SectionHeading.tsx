interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="text-center">
      <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-gray-600">{subtitle}</p>
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-4xl font-bold text-white">{title}</h2>
      <p className="mt-3 text-neutral-300">{subtitle}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-700 px-6 py-16 text-center">
      <h2 className="text-lg font-medium text-gray-300">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  )
}

interface SmallStatCardProps {
  title: string
  value: string | number
}

export default function SmallStatCard({ title, value }: SmallStatCardProps) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow flex flex-col justify-center items-center h-32">
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

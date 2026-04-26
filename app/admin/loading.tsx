export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="w-16 h-16 border-8 border-t-8 border-gray-200 border-t-[#d5245f] rounded-full animate-spin"></div>
      <p className="mt-4 text-lg" style={{ color: '#591f20' }}>
        Fetching data...Sorry for the wait!
      </p>
    </div>
  )
}

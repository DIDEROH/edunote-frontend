export default function LoadingSkeletoon() {
  return (
    <div className='flex flex-col items-center justify-center flex-wrap gap-6 max-w-xl mx-auto p-4'>
        <div className="skeleton h-32 w-full"></div>
        <div className="flex w-full flex-col gap-4">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
        </div>
    </div>
  )
}

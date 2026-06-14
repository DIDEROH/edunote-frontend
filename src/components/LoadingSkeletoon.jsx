export default function LoadingSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 animate-pulse">
      
      {/* Hero Card */}
      <div className="bg-base-100 rounded-3xl shadow-xl border border-base-300/50 p-4 sm:p-6">
        <div className="skeleton h-48 sm:h-64 w-full rounded-2xl"></div>

        <div className="mt-6 flex items-center gap-4">
          <div className="skeleton h-14 w-14 rounded-full shrink-0"></div>

          <div className="flex-1 space-y-3">
            <div className="skeleton h-5 w-40 rounded-full"></div>
            <div className="skeleton h-4 w-28 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6 bg-base-100 rounded-3xl shadow-xl border border-base-300/50 p-4 sm:p-6">
        <div className="space-y-4">
          <div className="skeleton h-5 w-2/3 rounded-full"></div>

          <div className="skeleton h-4 w-full rounded-full"></div>
          <div className="skeleton h-4 w-full rounded-full"></div>
          <div className="skeleton h-4 w-5/6 rounded-full"></div>

          <div className="skeleton h-4 w-full rounded-full"></div>
          <div className="skeleton h-4 w-4/5 rounded-full"></div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="bg-base-100 rounded-3xl shadow-xl border border-base-300/50 p-5"
          >
            <div className="skeleton h-40 w-full rounded-2xl"></div>

            <div className="mt-4 space-y-3">
              <div className="skeleton h-5 w-1/2 rounded-full"></div>
              <div className="skeleton h-4 w-full rounded-full"></div>
              <div className="skeleton h-4 w-4/5 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
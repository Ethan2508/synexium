export default function ProductLoading() {
  return (
    <div className="bg-surface min-h-screen animate-pulse">
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="h-4 w-64 bg-white/20 rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 lg:flex gap-10">
        {/* Image */}
        <div className="lg:w-1/2 mb-8 lg:mb-0">
          <div className="bg-white rounded-2xl border border-border aspect-square" />
        </div>

        {/* Info */}
        <div className="lg:w-1/2 space-y-4">
          <div className="flex gap-2">
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </div>
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />

          <div className="bg-white rounded-xl border border-border overflow-hidden mt-8">
            <div className="px-5 py-4 border-b border-border bg-surface">
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-border flex justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
                <div className="h-8 w-24 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

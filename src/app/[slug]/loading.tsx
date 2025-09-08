export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
        </div>

        {/* Contact info skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded flex-1 animate-pulse"></div>
          </div>
        </div>

        {/* Categories skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4">
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/3 animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded mb-2 w-2/3 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16 ml-4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp button skeleton */}
        <div className="fixed bottom-6 right-6">
          <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
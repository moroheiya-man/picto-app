export default function LoadingSpinner() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
      <p className="text-gray-700 font-semibold text-sm">AIが解析しています...</p>
      <p className="text-gray-400 text-xs mt-1">少々お待ちください</p>

      {/* Animated dots */}
      <div className="flex justify-center gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

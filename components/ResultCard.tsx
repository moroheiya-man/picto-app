import type { AnalysisCategory, AnalysisResult } from "@/types";

interface CategoryConfig {
  label: string;
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  detailBg: string;
  detailBorder: string;
  labelText: string;
}

const CATEGORY_CONFIG: Record<AnalysisCategory, CategoryConfig> = {
  food: {
    label: "🍽️ 料理・食べ物",
    headerBg: "bg-orange-500",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    detailBg: "bg-orange-50",
    detailBorder: "border-orange-200",
    labelText: "text-orange-700",
  },
  landmark: {
    label: "🏛️ 建造物・観光地",
    headerBg: "bg-blue-600",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    detailBg: "bg-blue-50",
    detailBorder: "border-blue-200",
    labelText: "text-blue-700",
  },
  sign: {
    label: "🪧 看板・標識",
    headerBg: "bg-emerald-600",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    detailBg: "bg-emerald-50",
    detailBorder: "border-emerald-200",
    labelText: "text-emerald-700",
  },
  landscape: {
    label: "🌏 街並み・風景",
    headerBg: "bg-teal-600",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-700",
    detailBg: "bg-teal-50",
    detailBorder: "border-teal-200",
    labelText: "text-teal-700",
  },
  art: {
    label: "🎨 アート・展示",
    headerBg: "bg-purple-600",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
    detailBg: "bg-purple-50",
    detailBorder: "border-purple-200",
    labelText: "text-purple-700",
  },
  other: {
    label: "📌 その他",
    headerBg: "bg-gray-600",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
    detailBg: "bg-gray-50",
    detailBorder: "border-gray-200",
    labelText: "text-gray-700",
  },
};

interface ResultCardProps {
  result: AnalysisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const config = CATEGORY_CONFIG[result.category] ?? CATEGORY_CONFIG.other;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-in">
      {/* Category header bar */}
      <div
        className={`${config.headerBg} px-4 py-3 flex items-center justify-between`}
      >
        <span className="text-white text-sm font-semibold">{config.label}</span>
        <span className="text-2xl">{result.emoji}</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Title & subtitle */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {result.title}
          </h2>
          {result.subtitle && (
            <p className="text-gray-500 text-sm mt-1">{result.subtitle}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed">
          {result.description}
        </p>

        {/* Details grid */}
        {result.details && result.details.length > 0 && (
          <div
            className={`${config.detailBg} border ${config.detailBorder} rounded-xl overflow-hidden`}
          >
            {result.details.map((detail, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-3 text-sm ${
                  i < result.details.length - 1
                    ? `border-b ${config.detailBorder}`
                    : ""
                }`}
              >
                <span
                  className={`${config.labelText} font-semibold flex-shrink-0 min-w-[5rem]`}
                >
                  {detail.label}
                </span>
                <span className="text-gray-700">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {result.tips && result.tips.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              💡 豆知識・ポイント
            </h3>
            <ul className="space-y-2">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-amber-500 font-bold flex-shrink-0 mt-0.5">
                    •
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ImageUploader from "@/components/ImageUploader";
import ResultCard from "@/components/ResultCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { AnalysisResult } from "@/types";

// Resize and compress image to stay within Vercel's 4.5MB body limit
function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1600;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
        else { width = Math.round((width * MAX) / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
        "image/jpeg",
        0.82
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("image", compressed);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "解析に失敗しました");
      }

      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    analyzeFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    await analyzeFile(selectedImage);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-lg mx-auto px-4 py-5 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <span className="text-3xl select-none">🗺️</span>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Picto
            </h1>
          </div>
          <p className="text-blue-300 text-sm font-medium">
            撮って・知る・旅する
          </p>
          <p className="text-blue-400/70 text-xs mt-1">
            AI旅行ガイド powered by Claude
          </p>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-10">
        {/* Image upload / preview */}
        <ImageUploader
          onImageSelect={handleImageSelect}
          imagePreview={imagePreview}
          onReset={handleReset}
        />

        {/* Analyze button — shown only when image selected, not loading, and no result yet */}
        {selectedImage && !isLoading && !result && (
          <button
            onClick={handleAnalyze}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-lg rounded-2xl shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
          >
            🔍 解析する
          </button>
        )}

        {/* Loading state */}
        {isLoading && <LoadingSpinner />}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700 text-sm font-medium">⚠️ エラー</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Analysis result */}
        {result && (
          <>
            <ResultCard result={result} />

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAnalyze}
                className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl transition-colors shadow-sm"
              >
                🔄 再解析
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
              >
                📸 別の写真
              </button>
            </div>
          </>
        )}

        {/* Empty state hint */}
        {!selectedImage && !isLoading && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
            <p className="text-blue-800 text-sm font-medium mb-2">
              こんな写真を解析できます
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {[
                { emoji: "🍜", label: "料理" },
                { emoji: "🏯", label: "建造物" },
                { emoji: "🪧", label: "看板" },
                { emoji: "🌆", label: "風景" },
                { emoji: "🎨", label: "アート" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-blue-600 text-xs font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useRef, useState } from "react";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  imagePreview: string | null;
  onReset: () => void;
}

const MAX_FILE_SIZE_MB = 10;

export default function ImageUploader({
  onImageSelect,
  imagePreview,
  onReset,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setSizeError(null);
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setSizeError(`ファイルサイズが大きすぎます（最大${MAX_FILE_SIZE_MB}MB）`);
      return;
    }
    onImageSelect(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  if (imagePreview) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-md bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagePreview}
          alt="選択した写真"
          className="w-full max-h-72 object-contain"
        />
        <button
          onClick={onReset}
          className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-colors"
          aria-label="画像を削除"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-amber-400 bg-amber-50"
            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-3 select-none">📷</div>
        <p className="text-gray-700 font-medium text-sm mb-1">
          写真を選択してください
        </p>
        <p className="text-gray-400 text-xs">
          タップして選択 または ドラッグ＆ドロップ
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cameraInputRef.current?.click();
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <span>📸</span> カメラで撮影
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors shadow-sm"
          >
            <span>🖼️</span> ファイルを選択
          </button>
        </div>
      </div>

      {sizeError && (
        <p className="text-red-500 text-xs text-center">⚠️ {sizeError}</p>
      )}

      {/* Camera input (mobile: opens rear camera) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      {/* File picker input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

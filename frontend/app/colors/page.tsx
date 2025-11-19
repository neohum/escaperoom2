'use client';

import Link from 'next/link';

export default function ColorsPage() {
  const colorSets = [
    {
      name: '현재 사용 중 (Indigo & Purple)',
      description: '신뢰감 & 창의성 - 전문적이고 안정적인 느낌',
      primary: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
      },
      secondary: {
        500: '#8b5cf6',
        600: '#7c3aed',
      },
      gradient: 'from-indigo-500 to-purple-600',
    },
    {
      name: 'Teal & Orange (추천!)',
      description: '활기차고 친근한 느낌 - 차별화된 교육 플랫폼',
      primary: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
      },
      secondary: {
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
      },
      gradient: 'from-teal-500 to-orange-600',
    },
    {
      name: 'Blue & Green',
      description: '교육적이고 신선한 느낌 - 성장과 학습',
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      secondary: {
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
      },
      gradient: 'from-blue-500 to-green-600',
    },
    {
      name: 'Rose & Pink',
      description: '따뜻하고 부드러운 느낌 - 친근하고 감성적',
      primary: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e',
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337',
      },
      secondary: {
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
      },
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      name: 'Violet & Fuchsia',
      description: '창의적이고 혁신적인 느낌 - 미래지향적',
      primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6',
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
      },
      secondary: {
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
      },
      gradient: 'from-violet-500 to-fuchsia-600',
    },
    {
      name: 'Emerald & Lime',
      description: '자연스럽고 활력적인 느낌 - 에너지와 성장',
      primary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      secondary: {
        400: '#a3e635',
        500: '#84cc16',
        600: '#65a30d',
      },
      gradient: 'from-emerald-500 to-lime-600',
    },
    {
      name: 'Amber & Yellow',
      description: '밝고 긍정적인 느낌 - 즐거운 학습 경험',
      primary: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      secondary: {
        400: '#facc15',
        500: '#eab308',
        600: '#ca8a04',
      },
      gradient: 'from-amber-500 to-yellow-600',
    },
    {
      name: 'Cyan & Sky',
      description: '시원하고 깨끗한 느낌 - 명확하고 투명한',
      primary: {
        50: '#ecfeff',
        100: '#cffafe',
        200: '#a5f3fc',
        300: '#67e8f9',
        400: '#22d3ee',
        500: '#06b6d4',
        600: '#0891b2',
        700: '#0e7490',
        800: '#155e75',
        900: '#164e63',
      },
      secondary: {
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
      },
      gradient: 'from-cyan-500 to-sky-600',
    },
  ];

  const accentColors = [
    { name: 'Success (정답)', color: '#10b981', bg: 'bg-green-500' },
    { name: 'Error (오답)', color: '#ef4444', bg: 'bg-red-500' },
    { name: 'Warning (경고)', color: '#f59e0b', bg: 'bg-yellow-500' },
    { name: 'Info (정보)', color: '#3b82f6', bg: 'bg-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🎨 컬러셋 미리보기</h1>
            <Link href="/" className="text-indigo-600 hover:text-indigo-800">
              ← 홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Color Sets */}
        {colorSets.map((set, index) => (
          <div key={index} className="mb-16">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{set.name}</h2>
              <p className="text-gray-600">{set.description}</p>
            </div>

            {/* Primary Colors */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Primary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                {Object.entries(set.primary).map(([shade, color]) => (
                  <div key={shade} className="text-center">
                    <div
                      className="h-20 rounded-lg shadow-md mb-2"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="text-sm font-medium text-gray-900">{shade}</div>
                    <div className="text-xs text-gray-500">{color}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Colors */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secondary Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(set.secondary).map(([shade, color]) => (
                  <div key={shade} className="text-center">
                    <div
                      className="h-20 rounded-lg shadow-md mb-2"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="text-sm font-medium text-gray-900">{shade}</div>
                    <div className="text-xs text-gray-500">{color}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Example */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gradient Example</h3>
              <div className={`h-32 rounded-lg shadow-lg bg-gradient-to-r ${set.gradient} flex items-center justify-center`}>
                <span className="text-white text-2xl font-bold">Sample Gradient</span>
              </div>
            </div>

            {/* UI Examples */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">UI Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Button */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="font-bold mb-4">Buttons</h4>
                  <div className="space-y-3">
                    <button
                      className="w-full py-2 px-4 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: set.primary[600] }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="w-full py-2 px-4 rounded-lg font-semibold text-white"
                      style={{ backgroundColor: set.secondary[500] }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="font-bold mb-4">Card</h4>
                  <div className="border-2 rounded-lg p-4" style={{ borderColor: set.primary[200] }}>
                    <div className="font-bold mb-2" style={{ color: set.primary[700] }}>
                      Card Title
                    </div>
                    <p className="text-gray-600 text-sm">
                      This is a sample card with the selected color scheme.
                    </p>
                  </div>
                </div>

                {/* Badge */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h4 className="font-bold mb-4">Badges</h4>
                  <div className="space-y-3">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: set.primary[100], color: set.primary[700] }}
                    >
                      Primary Badge
                    </div>
                    <br />
                    <div
                      className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: set.secondary[500] }}
                    >
                      Secondary Badge
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {index < colorSets.length - 1 && <hr className="my-12 border-gray-300" />}
          </div>
        ))}

        {/* Accent Colors */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Accent Colors (공통)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {accentColors.map((accent, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
                <div
                  className="h-20 rounded-lg shadow-md mb-3"
                  style={{ backgroundColor: accent.color }}
                ></div>
                <div className="font-bold text-gray-900">{accent.name}</div>
                <div className="text-sm text-gray-500">{accent.color}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


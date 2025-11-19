'use client';

import Link from 'next/link';

export default function ColorsPage() {
  const colorSets = [
    {
      name: '현재 사용 중 (Indigo & Purple)',
      description: '신뢰감 & 창의성',
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
      description: '활기차고 친근한 느낌',
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
      description: '교육적이고 신선한 느낌',
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


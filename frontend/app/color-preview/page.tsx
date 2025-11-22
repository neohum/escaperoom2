'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ColorScheme {
  id: string;
  name: string;
  description: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  gradient: string;
  bgLight: string;
  bgDark: string;
}

const colorSchemes: ColorScheme[] = [
  {
    id: 'indigo-purple',
    name: '현재 사용 중 (Indigo & Purple)',
    description: '신뢰감 & 창의성 - 전문적이고 안정적인 느낌',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    secondary: '#7c3aed',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'from-blue-50 to-indigo-100',
    bgDark: 'from-indigo-600',
  },
  {
    id: 'teal-orange',
    name: 'Teal & Orange (추천!)',
    description: '활기차고 친근한 느낌 - 차별화된 교육 플랫폼',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    secondary: '#ea580c',
    gradient: 'from-teal-500 to-orange-600',
    bgLight: 'from-teal-50 to-orange-50',
    bgDark: 'from-teal-600',
  },
  {
    id: 'blue-green',
    name: 'Blue & Green',
    description: '교육적이고 신선한 느낌 - 성장과 학습',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#16a34a',
    gradient: 'from-blue-500 to-green-600',
    bgLight: 'from-blue-50 to-green-50',
    bgDark: 'from-blue-600',
  },
  {
    id: 'rose-pink',
    name: 'Rose & Pink',
    description: '따뜻하고 부드러운 느낌 - 친근하고 감성적',
    primary: '#e11d48',
    primaryHover: '#be123c',
    secondary: '#ec4899',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'from-rose-50 to-pink-50',
    bgDark: 'from-rose-600',
  },
  {
    id: 'violet-fuchsia',
    name: 'Violet & Fuchsia',
    description: '창의적이고 혁신적인 느낌 - 미래지향적',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    secondary: '#c026d3',
    gradient: 'from-violet-500 to-fuchsia-600',
    bgLight: 'from-violet-50 to-fuchsia-50',
    bgDark: 'from-violet-600',
  },
  {
    id: 'emerald-lime',
    name: 'Emerald & Lime',
    description: '자연스럽고 활력적인 느낌 - 에너지와 성장',
    primary: '#059669',
    primaryHover: '#047857',
    secondary: '#65a30d',
    gradient: 'from-emerald-500 to-lime-600',
    bgLight: 'from-emerald-50 to-lime-50',
    bgDark: 'from-emerald-600',
  },
  {
    id: 'amber-yellow',
    name: 'Amber & Yellow',
    description: '밝고 긍정적인 느낌 - 즐거운 학습 경험',
    primary: '#d97706',
    primaryHover: '#b45309',
    secondary: '#ca8a04',
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: 'from-amber-50 to-yellow-50',
    bgDark: 'from-amber-600',
  },
  {
    id: 'cyan-sky',
    name: 'Cyan & Sky',
    description: '시원하고 깨끗한 느낌 - 명확하고 투명한',
    primary: '#0891b2',
    primaryHover: '#0e7490',
    secondary: '#0284c7',
    gradient: 'from-cyan-500 to-sky-600',
    bgLight: 'from-cyan-50 to-sky-50',
    bgDark: 'from-cyan-600',
  },
];

export default function ColorPreviewPage() {
  const [selectedScheme, setSelectedScheme] = useState<ColorScheme>(colorSchemes[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">🎨 컬러셋 미리보기</h1>
            <Link href="/" className="text-indigo-600 hover:text-indigo-800">
              ← 홈으로
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Color Scheme Selector */}
        <aside className="w-80 bg-white shadow-lg h-screen sticky top-16 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">컬러셋 선택</h2>
            <div className="space-y-3">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedScheme.id === scheme.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: scheme.primary }}
                    ></div>
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: scheme.secondary }}
                    ></div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{scheme.name}</h3>
                  <p className="text-xs text-gray-600">{scheme.description}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content - Preview */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedScheme.name}</h2>
              <p className="text-gray-600">{selectedScheme.description}</p>
            </div>

            {/* Preview Container */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <PreviewHomePage scheme={selectedScheme} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Preview Component
function PreviewHomePage({ scheme }: { scheme: ColorScheme }) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${scheme.bgLight}`}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold" style={{ color: scheme.primary }}>
              🎯 방탈출 교육 플랫폼
            </div>
            <nav className="flex gap-6 items-center">
              <span className="text-gray-700 font-medium">게임 목록</span>
              <span className="text-gray-700 font-medium">로그인</span>
              <button
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: scheme.primary }}
              >
                회원가입
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          교육용 방탈출 게임을
          <br />
          <span style={{ color: scheme.primary }}>쉽고 빠르게 만들어보세요</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          코딩 없이 드래그 앤 드롭으로 교육용 방탈출 게임을 만들 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="px-6 py-3 rounded-lg font-bold text-white shadow-lg"
            style={{ backgroundColor: scheme.primary }}
          >
            게임 둘러보기
          </button>
          <button
            className="px-6 py-3 rounded-lg font-bold border-2 shadow-lg bg-white"
            style={{ borderColor: scheme.primary, color: scheme.primary }}
          >
            게임 만들기
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🎨', title: '쉬운 제작', desc: '코딩 없이 직관적인 인터페이스' },
            { icon: '🤝', title: '실시간 협업', desc: '여러 명이 동시 편집' },
            { icon: '🎯', title: '자동 채점', desc: 'AI 기반 유사도 분석' },
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className={`bg-gradient-to-r ${scheme.gradient} text-white py-12 mt-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">무제한</div>
              <div className="text-white/80">게임 제작 개수</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100% 무료</div>
              <div className="text-white/80">학생 플레이</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


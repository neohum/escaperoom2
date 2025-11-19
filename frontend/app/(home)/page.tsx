import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">🎯 방탈출 교육 플랫폼</h1>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            교육용 방탈출 게임을<br />쉽게 만들고 공유하세요
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            코딩 없이 누구나 교육용 방탈출 게임을 제작할 수 있습니다
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg font-semibold shadow-lg"
            >
              게임 만들기
            </Link>
            <Link
              href="/rooms"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 text-lg font-semibold shadow-lg border-2 border-indigo-600"
            >
              게임 둘러보기
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">쉬운 제작</h3>
            <p className="text-gray-600">
              드래그 앤 드롭으로 간편하게 문제를 만들고 배치할 수 있습니다
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">실시간 협업</h3>
            <p className="text-gray-600">
              여러 명이 동시에 게임을 제작하고 편집할 수 있습니다
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold mb-2">다양한 플레이 모드</h3>
            <p className="text-gray-600">
              온라인, 현장(QR/GPS), 출력물 등 다양한 방식으로 플레이 가능합니다
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">9가지 문제 유형</h3>
            <p className="text-gray-600">
              객관식, 주관식, 이미지 퍼즐, 드래그 앤 드롭 등 다양한 문제 유형 지원
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">AI 유사도 채점</h3>
            <p className="text-gray-600">
              주관식 답안을 AI가 자동으로 채점하여 정답 여부를 판단합니다
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">후원 시스템</h3>
            <p className="text-gray-600">
              마음에 드는 게임 제작자를 후원할 수 있습니다
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 bg-white rounded-xl shadow-md p-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">1,300원</div>
              <div className="text-gray-600">월 운영 비용</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">무제한</div>
              <div className="text-gray-600">게임 제작 개수</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">무료</div>
              <div className="text-gray-600">플레이 비용</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2025 방탈출 교육 플랫폼. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ for Education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


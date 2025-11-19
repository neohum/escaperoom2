'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Check if in development mode
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                🎯 방탈출 교육 플랫폼
              </Link>
              {isDev && (
                <div className="flex gap-2">
                  <Link
                    href="/colors"
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full hover:bg-yellow-200"
                  >
                    🎨 팔레트
                  </Link>
                  <Link
                    href="/color-preview"
                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full hover:bg-green-200"
                  >
                    👁️ 미리보기
                  </Link>
                </div>
              )}
            </div>
            <nav className="flex gap-6 items-center">
              <Link href="/rooms" className="text-gray-700 hover:text-indigo-600 font-medium">
                게임 목록
              </Link>
              {user ? (
                <>
                  <Link href="/create" className="text-gray-700 hover:text-indigo-600 font-medium">
                    게임 만들기
                  </Link>
                  <span className="text-gray-600">안녕하세요, {user.username}님</span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-indigo-600 font-medium"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          교육용 방탈출 게임을
          <br />
          <span className="text-indigo-600">쉽고 빠르게 만들어보세요</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          코딩 없이 드래그 앤 드롭으로 교육용 방탈출 게임을 만들 수 있습니다.
          <br />
          학생들에게 재미있는 학습 경험을 선물하세요!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/rooms"
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 font-bold text-lg shadow-lg"
          >
            게임 둘러보기
          </Link>
          <Link
            href="/create"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-50 font-bold text-lg shadow-lg border-2 border-indigo-600"
          >
            게임 만들기
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">쉬운 제작</h3>
            <p className="text-gray-600">
              코딩 없이 직관적인 인터페이스로 누구나 쉽게 방탈출 게임을 만들 수 있습니다.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">실시간 협업</h3>
            <p className="text-gray-600">
              여러 명이 동시에 게임을 제작하고 편집할 수 있습니다. 팀 프로젝트에 최적화되어 있습니다.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">자동 채점</h3>
            <p className="text-gray-600">
              AI 기반 유사도 분석으로 주관식 답안을 자동으로 채점합니다. 60% 이상 유사하면 정답!
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">이미지 변환</h3>
            <p className="text-gray-600">
              PNG/JPG 이미지를 자동으로 SVG로 변환하여 깔끔한 그래픽을 제공합니다.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">다양한 플레이 모드</h3>
            <p className="text-gray-600">
              온라인, 현장(QR/GPS), 인쇄물(PDF) 등 다양한 방식으로 게임을 즐길 수 있습니다.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">저렴한 비용</h3>
            <p className="text-gray-600">
              월 1,300원으로 무제한 게임 제작! 학생들은 무료로 플레이할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">월 1,300원</div>
              <div className="text-indigo-200">저렴한 운영 비용</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">무제한</div>
              <div className="text-indigo-200">게임 제작 개수</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100% 무료</div>
              <div className="text-indigo-200">학생 플레이</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">사용 방법</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">회원가입</h3>
            <p className="text-gray-600">간단한 정보만 입력하면 바로 시작할 수 있습니다.</p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">게임 제작</h3>
            <p className="text-gray-600">문제를 추가하고 힌트와 이미지를 설정합니다.</p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">공유</h3>
            <p className="text-gray-600">링크를 공유하거나 QR 코드를 생성합니다.</p>
          </div>

          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">플레이</h3>
            <p className="text-gray-600">학생들이 게임을 즐기고 학습합니다!</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            첫 게임을 만드는 데 5분이면 충분합니다.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-bold text-lg shadow-lg"
          >
            무료로 시작하기 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">방탈출 교육 플랫폼</h3>
              <p className="text-sm">
                교육용 방탈출 게임을 쉽고 빠르게 만들 수 있는 플랫폼입니다.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">링크</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/rooms" className="hover:text-white">
                    게임 목록
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-white">
                    게임 만들기
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    로그인
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-bold mb-4">문의</h3>
              <p className="text-sm">
                문의사항이 있으시면 언제든지 연락주세요.
                <br />
                Email: contact@escaperoom.edu
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 방탈출 교육 플랫폼. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

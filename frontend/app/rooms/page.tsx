'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Room {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  estimated_time: number;
  thumbnail_url: string;
  intro_image: string;
  creator_name: string;
  question_count: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDev, setIsDev] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchRooms();
    setIsDev(process.env.NODE_ENV === 'development');

    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const fetchRooms = async () => {
    try {
      // /rooms 페이지는 모든 사용자에게 공개된 컨텐츠만 표시
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rooms`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rooms');
      }

      setRooms(data.rooms);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return '쉬움';
    if (difficulty <= 4) return '보통';
    return '어려움';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-100';
    if (difficulty <= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                🎯 방탕출 교육 플랫폼
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
            {user && (
              <div className="flex items-center gap-3">
                <Link
                  href="/create"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  ➕ 새 컨텐츠 만들기
                </Link>
                <Link
                  href="/my-games"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  📋 내 컨텐츠
                </Link>
                <Link
                  href="/rooms"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  🎮 공개된 컨텐츠 목록
                </Link>
                <button
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  👤 {user.username}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  로그아웃
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
           공개된 컨텐츠 목록
        </h1>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">아직 공개된 컨텐츠 없습니다.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                {room.intro_image ? (
                  <img
                    src={room.intro_image.startsWith('http') ? room.intro_image : 
                         room.intro_image.startsWith('/uploads/') ? `http://localhost:4000${room.intro_image}` : 
                         `http://localhost:4000/uploads/${room.intro_image}`}
                    alt={room.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🎮</span>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{room.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {room.description || '설명이 없습니다.'}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {room.category && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {room.category}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${getDifficultyColor(
                      room.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(room.difficulty)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ {room.estimated_time}분</span>
                  <span>📝 {room.question_count}문제</span>
                </div>

                <Link
                  href={`/rooms/${room.id}`}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-center block"
                >
                  세부정보
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}


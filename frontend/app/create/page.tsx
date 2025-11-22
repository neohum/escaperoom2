'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    target_grade: '',
    difficulty: 3,
    play_time_min: 30,
    play_time_max: 60,
    play_modes: ['online'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDev, setIsDev] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');

    // Check if user is creator
    const userData = localStorage.getItem('user');
    if (!userData) {
      setError('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    
    if (userObj.role !== 'creator') {
      setError('게임 제작자만 접근할 수 있습니다');
      router.push('/');
      return;
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'difficulty' || name === 'play_time_min' || name === 'play_time_max' ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Redirect to edit page
      router.push(`/edit/${data.room.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                  href="/my-games"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  📋 내 게임
                </Link>
                <Link
                  href="/rooms"
                  className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
                >
                  🎮 게임 목록
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">새 게임 만들기</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              게임 제목 *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="예: 조선시대 역사 탐험"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="게임에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">선택하세요</option>
              <option value="역사">역사</option>
              <option value="과학">과학</option>
              <option value="수학">수학</option>
              <option value="국어">국어</option>
              <option value="영어">영어</option>
              <option value="사회">사회</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              난이도: {formData.difficulty}
            </label>
            <input
              id="difficulty"
              name="difficulty"
              type="range"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>쉬움</span>
              <span>어려움</span>
            </div>
          </div>

          <div>
            <label htmlFor="target_grade" className="block text-sm font-medium text-gray-700 mb-2">
              대상 학년
            </label>
            <select
              id="target_grade"
              name="target_grade"
              value={formData.target_grade}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">선택하세요</option>
              <option value="초등 1-2학년">초등 1-2학년</option>
              <option value="초등 3-4학년">초등 3-4학년</option>
              <option value="초등 5-6학년">초등 5-6학년</option>
              <option value="중학생">중학생</option>
              <option value="고등학생">고등학생</option>
              <option value="일반">일반</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="play_time_min" className="block text-sm font-medium text-gray-700 mb-2">
                최소 플레이 시간 (분)
              </label>
              <input
                id="play_time_min"
                name="play_time_min"
                type="number"
                min="5"
                max="180"
                value={formData.play_time_min}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="play_time_max" className="block text-sm font-medium text-gray-700 mb-2">
                최대 플레이 시간 (분)
              </label>
              <input
                id="play_time_max"
                name="play_time_max"
                type="number"
                min="10"
                max="300"
                value={formData.play_time_max}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
            >
              {loading ? '생성 중...' : '게임 생성'}
            </button>
            <Link
              href="/my-games"
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 text-center"
            >
              취소
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}


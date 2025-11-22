'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Room {
  id: string;
  title: string;
  description: string;
  category: string;
  target_grade: string;
  difficulty: number;
  play_time_min: number;
  play_time_max: number;
  is_published: boolean;
}

interface Question {
  id: string;
  title: string;
  type: string;
  order_index: number;
  points: number;
}

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
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

    fetchRoomData();
    fetchQuestions();
  }, [roomId, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const fetchRoomData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch room');
      }

      const data = await response.json();
      setRoom(data.room);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/room/${roomId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
    }
  };

  const handlePublishToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const endpoint = room?.is_published ? 'unpublish' : 'publish';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}/${endpoint}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update publish status');
      }

      setRoom(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('이 문제를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${questionId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error || '게임을 찾을 수 없습니다'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🎯 방탕출 교육 플랫폼
            </Link>
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
                onClick={handlePublishToggle}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  room.is_published
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {room.is_published ? '🔒 비공개로 전환' : '🌐 공개하기'}
              </button>
              <Link
                href={`/rooms/${roomId}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
              >
                👁️ 미리보기
              </Link>
              {user && (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 게임 정보 섹션 */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{room.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              room.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {room.is_published ? '공개됨' : '비공개'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">카테고리:</span>
              <span className="ml-2 font-semibold">{room.category || '미설정'}</span>
            </div>
            <div>
              <span className="text-gray-500">대상:</span>
              <span className="ml-2 font-semibold">{room.target_grade || '미설정'}</span>
            </div>
            <div>
              <span className="text-gray-500">난이도:</span>
              <span className="ml-2 font-semibold">{'⭐'.repeat(room.difficulty)}</span>
            </div>
            <div>
              <span className="text-gray-500">플레이 시간:</span>
              <span className="ml-2 font-semibold">{room.play_time_min}-{room.play_time_max}분</span>
            </div>
          </div>

          {room.description && (
            <p className="mt-4 text-gray-600">{room.description}</p>
          )}
        </div>

        {/* 화면 관리 버튼 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎬 게임 화면 관리</h3>
              <p className="text-gray-600">여러 화면을 만들어 게임 스토리를 구성하고, 이미지와 텍스트를 추가하세요</p>
            </div>
            <button
              onClick={() => router.push(`/edit/${roomId}/scenes`)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold whitespace-nowrap"
            >
              화면 관리 →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}



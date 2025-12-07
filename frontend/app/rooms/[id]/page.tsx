'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SlatePreview from '../../edit/[id]/SlatePreview';

interface Room {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  estimated_time: number;
  creator_name: string;
  creator_id?: string;
  creator_email?: string;
  play_modes?: string[];
  play_time_min?: number;
  play_time_max?: number;
  target_grade?: string;
  credits?: any;
  donation_info?: any;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  intro_content?: string;
  intro_image?: string;
  author?: string;
  sponsor?: string;
  thumbnail?: string;
  question_count?: number;
}

interface Question {
  id: string;
  type: string;
  title: string;
  content: string;
  options: string[];
  hint: string;
  points: number;
  image_url: string;
  video_url: string;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isDev, setIsDev] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Game states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsDev(process.env.NODE_ENV === 'development');
    fetchRoomData();
  }, [roomId]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch room');
      }

      setRoom(data.room);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, player_name: 'Player' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start game');
      }

      setSessionId(data.session.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('답을 입력해주세요');
      return;
    }

    try {
      const currentQuestion = questions[currentQuestionIndex];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${currentQuestion.id}/check-answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer: userAnswer }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check answer');
      }

      setFeedback(data);

      // Move to next question after 2 seconds
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setUserAnswer('');
          setFeedback(null);
          setShowHint(false);
        } else {
          alert('컨텐츠 완료!');
          router.push('/rooms');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류</h2>
          <p className="text-gray-700 mb-4">{error || '컨텐츠을 찾을 수 없습니다'}</p>
          <Link href="/rooms" className="text-indigo-600 hover:text-indigo-800">
            ← 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Room Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{room.title}</h1>
            {room.intro_image && (
              <div className="mb-6">
                <img
                  src={room.intro_image.startsWith('http') ? room.intro_image :
                       room.intro_image.startsWith('/uploads/') ? `http://localhost:4000${room.intro_image}` :
                       `http://localhost:4000/uploads/${room.intro_image}`}
                  alt="컨텐츠 이미지"
                  className="w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Room Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">기본 정보</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">제목</label>
                <p className="mt-1 text-sm text-gray-900">{room.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">설명</label>
                <p className="mt-1 text-sm text-gray-900">{room.description || '없음'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">카테고리</label>
                <p className="mt-1 text-sm text-gray-900">{room.category || '없음'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">난이도</label>
                <p className="mt-1 text-sm text-gray-900">{room.difficulty}/5</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">대상 학년</label>
                <p className="mt-1 text-sm text-gray-900">{room.target_grade || '없음'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">문제 수</label>
                <p className="mt-1 text-sm text-gray-900">{room.question_count || 0}개</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">생성일</label>
                <p className="mt-1 text-sm text-gray-900">
                  {room.created_at ? new Date(room.created_at).toLocaleDateString('ko-KR') : '없음'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">수정일</label>
                <p className="mt-1 text-sm text-gray-900">
                  {room.updated_at ? new Date(room.updated_at).toLocaleDateString('ko-KR') : '없음'}
                </p>
              </div>
            </div>

            {/* Creator & Additional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">추가 정보</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">플레이 시간 범위</label>
                <p className="mt-1 text-sm text-gray-900">
                  {room.play_time_min && room.play_time_max ? `${room.play_time_min}분 - ${room.play_time_max}분` : '없음'}
                </p>
              </div>
            </div>
          </div>

          {/* Intro Content */}
          {room.intro_content && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">소개 내용</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <SlatePreview content={(() => {
                  try {
                    const parsed = JSON.parse(room.intro_content);
                    return Array.isArray(parsed) ? parsed : [{ type: 'paragraph', children: [{ text: room.intro_content }] }];
                  } catch {
                    return [{ type: 'paragraph', children: [{ text: room.intro_content }] }];
                  }
                })()} />
              </div>
            </div>
          )}

          {/* Author & Sponsor Information */}
          {(room.author || room.sponsor) && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {room.author && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">제작자 정보</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <SlatePreview content={(() => {
                      try {
                        const parsed = JSON.parse(room.author);
                        return Array.isArray(parsed) ? parsed : [{ type: 'paragraph', children: [{ text: room.author }] }];
                      } catch {
                        return [{ type: 'paragraph', children: [{ text: room.author }] }];
                      }
                    })()} />
                  </div>
                </div>
              )}

              {room.sponsor && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">후원자 정보</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <SlatePreview content={(() => {
                      try {
                        const parsed = JSON.parse(room.sponsor);
                        return Array.isArray(parsed) ? parsed : [{ type: 'paragraph', children: [{ text: room.sponsor }] }];
                      } catch {
                        return [{ type: 'paragraph', children: [{ text: room.sponsor }] }];
                      }
                    })()} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Link
              href="/rooms"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              목록으로 돌아가기
            </Link>
            {user?.role === 'creator' && user?.id === room.creator_id && (
              <Link
                href={`/edit/${room.id}`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                수정하기
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


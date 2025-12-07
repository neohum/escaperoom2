'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

interface Room {
  id: string;
  title: string;
  description: string;
  category: string;
  target_grade: string;
  difficulty: number;
  play_modes: string[];
  play_time_min: number;
  play_time_max: number;
  thumbnail: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  question_count: number;
}

export default function MyGamesPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if user is creator
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'creator') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    setIsDev(process.env.NODE_ENV === 'development');
    fetchMyRooms();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const fetchMyRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);

      if (!token) {
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Making API call to:', `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/my/rooms`);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/my/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.text();
        console.log('API error response:', errorData);
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      console.log('API success response:', data);
      setRooms(data.rooms || []);
    } catch (err: any) {
      console.error('fetchMyRooms error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (roomId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = currentStatus ? 'unpublish' : 'publish';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update publish status');
      }

      // Refresh the list
      fetchMyRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteClick = async (roomId: string, roomTitle: string) => {
    const result = await Swal.fire({
      title: '컨텐츠 삭제',
      text: `"${roomTitle}" 컨텐츠을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다. 삭제를 원하시면 "삭제"를 입력하세요.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      input: 'text',
      inputPlaceholder: '삭제를 확인하려면 "삭제"를 입력하세요',
      inputValidator: (value) => {
        if (!value || value !== '삭제') {
          return '삭제를 확인하려면 "삭제"를 정확히 입력해주세요.';
        }
      }
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete room');
        }

        await Swal.fire({
          title: '삭제 완료',
          text: '컨텐츠이 성공적으로 삭제되었습니다.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        fetchMyRooms();
      } catch (err: any) {
        await Swal.fire({
          title: '삭제 실패',
          text: `삭제 중 오류가 발생했습니다: ${err.message}`,
          icon: 'error'
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">전체 컨텐츠</div>
            <div className="text-3xl font-bold text-indigo-600">{rooms.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">공개된 컨텐츠</div>
            <div className="text-3xl font-bold text-green-600">
              {rooms.filter((r) => r.is_published).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">비공개 컨텐츠</div>
            <div className="text-3xl font-bold text-gray-600">
              {rooms.filter((r) => !r.is_published).length}
            </div>
          </div>
        </div>

        {/* Games List */}
        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 컨텐츠이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 방탕출 컨텐츠을 만들어보세요!</p>
            <Link
              href="/create"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              컨텐츠 만들기
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    컨텐츠 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    문제 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수정일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{room.title}</div>
                          <div className="text-sm text-gray-500">
                            {room.description?.substring(0, 50)}
                            {room.description && room.description.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{room.question_count}개</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePublishToggle(room.id, room.is_published)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          room.is_published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {room.is_published ? '공개' : '비공개'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(room.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(room.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/edit/${room.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        편집
                      </Link>
                      <Link
                        href={`/edit/${room.id}?preview=1`}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        미리보기
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(room.id, room.title)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

    </div>
  );
}


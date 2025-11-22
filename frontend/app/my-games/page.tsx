'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; roomId: string; roomTitle: string }>({
    show: false,
    roomId: '',
    roomTitle: ''
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
    fetchMyRooms();
  }, [router]);

  const fetchMyRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/my/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err: any) {
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

  const handleDeleteClick = (roomId: string, roomTitle: string) => {
    setDeleteModal({ show: true, roomId, roomTitle });
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== '삭제') {
      alert('삭제를 확인하려면 "삭제"를 정확히 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${deleteModal.roomId}`,
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

      alert('게임이 삭제되었습니다.');
      setDeleteModal({ show: false, roomId: '', roomTitle: '' });
      setDeleteConfirmText('');
      fetchMyRooms();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, roomId: '', roomTitle: '' });
    setDeleteConfirmText('');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              🎯 방탕출 교육 플랫폼
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/create"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                새 게임 만들기
              </Link>
              <span className="text-gray-600">안녕하세요, {user?.username}님</span>
            </div>
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
            <div className="text-sm text-gray-600 mb-1">전체 게임</div>
            <div className="text-3xl font-bold text-indigo-600">{rooms.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">공개된 게임</div>
            <div className="text-3xl font-bold text-green-600">
              {rooms.filter((r) => r.is_published).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">비공개 게임</div>
            <div className="text-3xl font-bold text-gray-600">
              {rooms.filter((r) => !r.is_published).length}
            </div>
          </div>
        </div>

        {/* Games List */}
        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">아직 게임이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 방탕출 게임을 만들어보세요!</p>
            <Link
              href="/create"
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              게임 만들기
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    게임 정보
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
                        href={`/play/${room.id}`}
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

      {/* 삭제 확인 모달 */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="mb-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">게임 삭제</h2>
              <p className="text-gray-600 text-center text-sm mb-4">
                이 작업은 되돌릴 수 없습니다
              </p>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                <strong>"{deleteModal.roomTitle}"</strong> 게임과 관련된 모든 데이터가 영구적으로 삭제됩니다:
              </p>
              <ul className="text-xs text-red-700 list-disc list-inside space-y-1">
                <li>모든 게임 화면</li>
                <li>등록된 모든 문제</li>
                <li>게임 설정 및 메타데이터</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                삭제를 확인하려면 <strong className="text-red-600">"삭제"</strong>를 입력하세요
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="삭제"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmText !== '삭제'}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


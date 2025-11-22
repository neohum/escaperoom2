'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface SceneElement {
  id: string;
  element_type: string;
  content: string;
  order_index: number;
  style: any;
}

interface Scene {
  id: string;
  title: string;
  description: string;
  background_image: string;
  background_color: string;
  layout_type: string;
  elements: SceneElement[];
}

export default function SceneEditorPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const sceneId = params.sceneId as string;

  const [scene, setScene] = useState<Scene | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showAddElement, setShowAddElement] = useState(false);
  const [newElement, setNewElement] = useState({
    element_type: 'text',
    content: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    
    if (userObj.role !== 'creator') {
      router.push('/');
      return;
    }

    fetchScene();
  }, [sceneId, router]);

  const fetchScene = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${sceneId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scene');
      }

      const data = await response.json();
      setScene(data.scene);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScene = async (updates: Partial<Scene>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${sceneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update scene');
      }

      fetchScene();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddElement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${sceneId}/elements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newElement),
      });

      if (!response.ok) {
        throw new Error('Failed to add element');
      }

      setShowAddElement(false);
      setNewElement({ element_type: 'text', content: '' });
      fetchScene();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteElement = async (elementId: string) => {
    if (!confirm('이 요소를 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/scenes/elements/${elementId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete element');
      }

      fetchScene();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!scene) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">화면을 찾을 수 없습니다</div>
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
                href={`/edit/${roomId}/scenes`}
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium"
              >
                ← 화면 목록으로
              </Link>
              {user && (
                <>
                  <button className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 편집 패널 */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">화면 편집</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={scene.title}
                  onChange={(e) => handleUpdateScene({ title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={scene.description}
                  onChange={(e) => handleUpdateScene({ description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배경 색상
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={scene.background_color}
                    onChange={(e) => handleUpdateScene({ background_color: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={scene.background_color}
                    onChange={(e) => handleUpdateScene({ background_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배경 이미지
                </label>
                {scene.background_image && (
                  <div className="mb-2">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${scene.background_image}`} 
                      alt="배경 이미지" 
                      className="h-20 object-cover rounded border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append('background', file);

                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/background`, {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                      });

                      if (!response.ok) {
                        throw new Error('이미지 업로드 실패');
                      }

                      const data = await response.json();
                      handleUpdateScene({ background_image: data.url });
                    } catch (err: any) {
                      setError(err.message);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, SVG, WEBP (최대 10MB)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  레이아웃
                </label>
                <select
                  value={scene.layout_type}
                  onChange={(e) => handleUpdateScene({ layout_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="full_image">전체 이미지</option>
                  <option value="text_only">텍스트만</option>
                  <option value="image_text">이미지 + 텍스트</option>
                  <option value="split">분할 화면</option>
                  <option value="custom">사용자 정의</option>
                </select>
              </div>

              {/* 이미지 관련 레이아웃일 때 선택지 이미지 업로드 */}
              {(scene.layout_type === 'full_image' || scene.layout_type === 'image_text' || scene.layout_type === 'split') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선택지 이미지
                  </label>
                  {scene.background_image && (
                    <div className="mb-2">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL}${scene.background_image}`} 
                        alt="선택지 이미지" 
                        className="h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('image', file);

                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                          body: formData,
                        });

                        if (!response.ok) {
                          throw new Error('이미지 업로드 실패');
                        }

                        const data = await response.json();
                        handleUpdateScene({ background_image: data.url });
                      } catch (err: any) {
                        setError(err.message);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, SVG, WEBP (최대 10MB)
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    화면 요소 ({scene.elements?.length || 0}개)
                  </label>
                  <button
                    onClick={() => setShowAddElement(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
                  >
                    ➕ 요소 추가
                  </button>
                </div>

                <div className="space-y-2">
                  {scene.elements?.map((element, index) => (
                    <div
                      key={element.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-semibold">#{index + 1}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {element.element_type}
                        </span>
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                          {element.content}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteElement(element.id)}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 미리보기 */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">미리보기</h2>
            
            <div
              className="border-2 border-gray-300 rounded-lg overflow-hidden"
              style={{ aspectRatio: '16/9' }}
            >
              <div
                className="w-full h-full p-8 flex flex-col justify-center items-center"
                style={{
                  backgroundColor: scene.background_color,
                  backgroundImage: scene.background_image ? `url(${scene.background_image})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <h3 className="text-3xl font-bold mb-4 text-center">{scene.title}</h3>
                {scene.description && (
                  <p className="text-lg text-center mb-6">{scene.description}</p>
                )}
                
                <div className="space-y-4 w-full">
                  {scene.elements?.map((element) => (
                    <div key={element.id} className="bg-white bg-opacity-90 p-4 rounded-lg">
                      {element.element_type === 'text' && (
                        <p className="text-gray-800">{element.content}</p>
                      )}
                      {element.element_type === 'image' && (
                        <img src={element.content} alt="Element" className="w-full rounded" />
                      )}
                      {element.element_type === 'button' && (
                        <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold">
                          {element.content}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 요소 추가 모달 */}
      {showAddElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">요소 추가</h2>
              <button
                onClick={() => setShowAddElement(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddElement} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요소 유형
                </label>
                <select
                  value={newElement.element_type}
                  onChange={(e) => setNewElement({ ...newElement, element_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="text">텍스트</option>
                  <option value="image">이미지</option>
                  <option value="video">비디오</option>
                  <option value="button">버튼</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newElement.element_type === 'image' ? '이미지 업로드' : '내용'}
                </label>
                {newElement.element_type === 'image' ? (
                  <div>
                    {newElement.content && (
                      <div className="mb-2">
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL}${newElement.content}`} 
                          alt="업로드된 이미지" 
                          className="h-32 object-contain rounded border"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append('image', file);

                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                          });

                          if (!response.ok) {
                            throw new Error('이미지 업로드 실패');
                          }

                          const data = await response.json();
                          setNewElement({ ...newElement, content: data.url });
                        } catch (err: any) {
                          setError(err.message);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF, SVG, WEBP (최대 10MB)
                    </p>
                  </div>
                ) : (
                  <textarea
                    value={newElement.content}
                    onChange={(e) => setNewElement({ ...newElement, content: e.target.value })}
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={
                      newElement.element_type === 'text' ? '텍스트를 입력하세요' :
                      newElement.element_type === 'button' ? '버튼 텍스트를 입력하세요' :
                      '내용을 입력하세요'
                    }
                  />
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  추가하기
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddElement(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

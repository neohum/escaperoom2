'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Scene {
  id: string;
  title: string;
  description: string;
  order_index: number;
  background_image: string;
  background_color: string;
  layout_type: string;
}

interface Question {
  id: string;
  title: string;
  type: string;
  scene_id: string;
}

export default function ScenesPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScene, setNewScene] = useState({
    title: '',
    description: '',
    background_color: '#ffffff',
    layout_type: '',
    background_image: '',
    content: ''
  });
  const [newQuestions, setNewQuestions] = useState<Array<{
    title: string;
    type: string;
    description: string;
    answer: string;
    hint: string;
    points: number;
  }>>([]);
  const [editorSelection, setEditorSelection] = useState<{start: number, end: number} | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('');
  const [bulkQuestions, setBulkQuestions] = useState<Array<{
    title: string;
    type: string;
    description: string;
    answer: string;
    hint: string;
    points: number;
  }>>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

    fetchScenes();
    fetchQuestions();
  }, [roomId, router]);

  // 모달 열릴 때 임시 저장된 데이터 복구
  useEffect(() => {
    if (showCreateModal) {
      const savedData = localStorage.getItem(`draft_scene_${roomId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.scene) setNewScene(parsed.scene);
          if (parsed.questions) setNewQuestions(parsed.questions);
        } catch (err) {
          console.error('Failed to parse saved scene:', err);
        }
      }
    }
  }, [showCreateModal, roomId]);

  // 자동 저장 기능
  useEffect(() => {
    if (!showCreateModal) return;

    const autoSaveInterval = setInterval(() => {
      if (newScene.title || newScene.description || newScene.content || newQuestions.length > 0) {
        setAutoSaving(true);
        localStorage.setItem(`draft_scene_${roomId}`, JSON.stringify({
          scene: newScene,
          questions: newQuestions
        }));
        setLastSaved(new Date());
        setTimeout(() => setAutoSaving(false), 1000);
      }
    }, 5000); // 5초마다 자동 저장

    return () => clearInterval(autoSaveInterval);
  }, [showCreateModal, newScene, newQuestions, roomId]);

  const fetchScenes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/room/${roomId}`);
      
      if (!response.ok) {
        throw new Error('생성된 화면이 없습니다.');
      }

      const data = await response.json();
      setScenes(data.scenes || []);
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

  const getQuestionsForScene = (sceneId: string) => {
    return questions.filter(q => q.scene_id === sceneId);
  };

  const handleCreateScene = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // 1. 화면 생성
      const sceneResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: roomId,
          ...newScene
        }),
      });

      if (!sceneResponse.ok) {
        throw new Error('Failed to create scene');
      }

      const sceneData = await sceneResponse.json();
      const createdSceneId = sceneData.scene.id;

      // 2. 문제가 있으면 생성
      if (newQuestions.length > 0) {
        for (let i = 0; i < newQuestions.length; i++) {
          const question = newQuestions[i];
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              room_id: roomId,
              scene_id: createdSceneId,
              order_index: i,
              title: question.title,
              type: question.type,
              description: question.description,
              answer: { text: question.answer },
              hint: question.hint,
              points: question.points
            }),
          });
        }
      }

      setShowCreateModal(false);
      setNewScene({
        title: '',
        description: '',
        background_color: '#ffffff',
        layout_type: '',
        background_image: '',
        content: ''
      });
      setNewQuestions([]);
      // 임시 저장 데이터 삭제
      localStorage.removeItem(`draft_scene_${roomId}`);
      setLastSaved(null);
      fetchScenes();
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm('이 화면을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${sceneId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete scene');
      }

      fetchScenes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenQuestionModal = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    // 기본 10개 문제 템플릿 생성
    setBulkQuestions(Array(10).fill(null).map(() => ({
      title: '',
      type: 'multiple_choice',
      description: '',
      answer: '',
      hint: '',
      points: 10
    })));
    setShowQuestionModal(true);
  };

  const handleAddMoreQuestions = () => {
    setBulkQuestions([...bulkQuestions, {
      title: '',
      type: 'multiple_choice',
      description: '',
      answer: '',
      hint: '',
      points: 10
    }]);
  };

  const handleSaveBulkQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 내용이 입력된 문제만 저장
      const validQuestions = bulkQuestions.filter(q => q.title.trim() !== '' && q.answer.trim() !== '');
      
      if (validQuestions.length === 0) {
        alert('최소 1개 이상의 문제를 입력해주세요 (제목과 정답은 필수)');
        return;
      }

      for (let i = 0; i < validQuestions.length; i++) {
        const question = validQuestions[i];
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            room_id: roomId,
            scene_id: selectedSceneId,
            order_index: i,
            title: question.title,
            type: question.type,
            description: question.description,
            answer: { text: question.answer },
            hint: question.hint,
            points: question.points
          }),
        });
      }

      alert(`${validQuestions.length}개의 문제가 저장되었습니다.`);
      setShowQuestionModal(false);
      setBulkQuestions([]);
      setSelectedSceneId('');
      fetchQuestions();
    } catch (err: any) {
      setError(err.message);
      alert('문제 저장 중 오류가 발생했습니다.');
    }
  };

  const handleEditScene = (scene: Scene) => {
    setEditingScene(scene);
    setNewScene({
      title: scene.title,
      description: scene.description,
      background_color: scene.background_color,
      layout_type: scene.layout_type,
      background_image: scene.background_image,
      content: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScene) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${editingScene.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newScene),
      });

      if (!response.ok) {
        throw new Error('Failed to update scene');
      }

      setShowEditModal(false);
      setEditingScene(null);
      fetchScenes();
      alert('화면이 수정되었습니다.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                🎯 방탕출 교육 플랫폼
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/my-games"
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors"
                >
                  📋 내 게임
                </Link>
                <Link
                  href="/rooms"
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors"
                >
                  🎮 게임 목록
                </Link>
                <Link
                  href={`/edit/${roomId}`}
                  className="px-3 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg font-medium"
                >
                  ← 게임 편집
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <span className="hidden sm:inline-block px-4 py-2 text-sm text-gray-700 font-medium">
                    👤 {user.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
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
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                게임 화면 관리 ({scenes.length}개)
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                플레이 순서대로 화면을 구성하세요
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreviewMode(!previewMode);
                  setCurrentPreviewIndex(0);
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  previewMode
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {previewMode ? '편집 모드' : '👁️ 미리보기'}
              </button>
              {!previewMode && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  ➕ 새 화면 추가
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {scenes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">아직 화면이 없습니다</p>
              <p className="text-sm">화면을 추가하여 게임 스토리를 구성하세요!</p>
            </div>
          ) : previewMode ? (
            /* 미리보기 모드 */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                <button
                  onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}
                  disabled={currentPreviewIndex === 0}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ← 이전
                </button>
                <div className="text-center">
                  <p className="text-sm text-gray-600">화면 진행 상황</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {currentPreviewIndex + 1} / {scenes.length}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentPreviewIndex(Math.min(scenes.length - 1, currentPreviewIndex + 1))}
                  disabled={currentPreviewIndex === scenes.length - 1}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  다음 →
                </button>
              </div>

              {/* 현재 화면 미리보기 */}
              <div className="bg-white border-2 border-indigo-200 rounded-xl overflow-hidden">
                <div
                  className="h-96 flex items-center justify-center text-9xl relative"
                  style={{
                    backgroundColor: scenes[currentPreviewIndex].background_color,
                    backgroundImage: scenes[currentPreviewIndex].background_image 
                      ? `url(${scenes[currentPreviewIndex].background_image})` 
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!scenes[currentPreviewIndex].background_image && '🖼️'}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    화면 #{currentPreviewIndex + 1}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {scenes[currentPreviewIndex].title}
                    </h2>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {scenes[currentPreviewIndex].layout_type}
                    </span>
                  </div>
                  {scenes[currentPreviewIndex].description && (
                    <p className="text-lg text-gray-600 mb-6">
                      {scenes[currentPreviewIndex].description}
                    </p>
                  )}

                  {/* 문제 목록 */}
                  {getQuestionsForScene(scenes[currentPreviewIndex].id).length > 0 && (
                    <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-indigo-600">📝</span>
                        등록된 문제 ({getQuestionsForScene(scenes[currentPreviewIndex].id).length}개)
                      </h3>
                      <div className="space-y-3">
                        {getQuestionsForScene(scenes[currentPreviewIndex].id).map((question, idx) => (
                          <div key={question.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{question.title}</p>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mt-1 inline-block">
                                {question.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 편집 버튼 */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleEditScene(scenes[currentPreviewIndex])}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                      ✏️ 이 화면 편집
                    </button>
                    <button
                      onClick={() => handleOpenQuestionModal(scenes[currentPreviewIndex].id)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      ➕ 문제 추가
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 그리드 편집 모드 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenes.map((scene, index) => (
                <div
                  key={scene.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div
                    className="h-40 flex items-center justify-center text-6xl"
                    style={{
                      backgroundColor: scene.background_color,
                      backgroundImage: scene.background_image ? `url(${scene.background_image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!scene.background_image && '🖼️'}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {scene.layout_type}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{scene.title}</h3>
                    {scene.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{scene.description}</p>
                    )}
                    
                    {/* 해당 화면의 문제 목록 */}
                    {getQuestionsForScene(scene.id).length > 0 && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 mb-2">등록된 문제:</p>
                        <div className="space-y-1">
                          {getQuestionsForScene(scene.id).map((question) => (
                            <div key={question.id} className="text-xs text-gray-600 flex items-center gap-2">
                              <span className="text-indigo-600">•</span>
                              <span className="truncate">{question.title}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex-shrink-0">
                                {question.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => router.push(`/edit/${roomId}/scenes/${scene.id}`)}
                        className="flex-1 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                      >
                        ✏️ 편집
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* 문제 추가 버튼 */}
                    <button
                      onClick={() => handleOpenQuestionModal(scene.id)}
                      className="w-full px-4 py-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium border border-green-200"
                    >
                      ➕ 이 화면에 문제 추가
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 문제 대량 추가 모달 */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">문제 추가</h2>
                <p className="text-sm text-gray-600 mt-1">여러 문제를 한 번에 추가할 수 있습니다</p>
              </div>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {bulkQuestions.map((question, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">문제 #{index + 1}</h3>
                    <button
                      onClick={() => {
                        setBulkQuestions(bulkQuestions.filter((_, i) => i !== index));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      삭제
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        문제 제목 *
                      </label>
                      <input
                        type="text"
                        value={question.title}
                        onChange={(e) => {
                          const updated = [...bulkQuestions];
                          updated[index].title = e.target.value;
                          setBulkQuestions(updated);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        placeholder="문제 제목을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        문제 유형 *
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => {
                          const updated = [...bulkQuestions];
                          updated[index].type = e.target.value;
                          setBulkQuestions(updated);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="multiple_choice">객관식</option>
                        <option value="short_answer">주관식 단답형</option>
                        <option value="true_false">O/X</option>
                        <option value="essay">서술형</option>
                        <option value="code">코딩</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        배점
                      </label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => {
                          const updated = [...bulkQuestions];
                          updated[index].points = parseInt(e.target.value) || 10;
                          setBulkQuestions(updated);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        문제 설명
                      </label>
                      <textarea
                        value={question.description}
                        onChange={(e) => {
                          const updated = [...bulkQuestions];
                          updated[index].description = e.target.value;
                          setBulkQuestions(updated);
                        }}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        placeholder="문제에 대한 설명을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        정답 *
                      </label>
                      <input
                        type="text"
                        value={question.answer}
                        onChange={(e) => {
                          const updated = [...bulkQuestions];
                          updated[index].answer = e.target.value;
                          setBulkQuestions(updated);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        placeholder="정답을 입력하세요"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        힌트
                      </label>
                      <input
                        type="text"
                        value={question.hint}
                        onChange={(e) => {
                          const updated = [...bulkQuestions];
                          updated[index].hint = e.target.value;
                          setBulkQuestions(updated);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                        placeholder="힌트를 입력하세요"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t">
              <button
                onClick={handleAddMoreQuestions}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                ➕ 문제 추가
              </button>
              <button
                onClick={handleSaveBulkQuestions}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
              >
                저장하기 ({bulkQuestions.filter(q => q.title && q.answer).length}개)
              </button>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 화면 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">새 화면 만들기</h2>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  {autoSaving && (
                    <span className="text-indigo-600 flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      저장 중...
                    </span>
                  )}
                  {!autoSaving && lastSaved && (
                    <span className="text-gray-500">
                      마지막 저장: {lastSaved.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {!lastSaved && !autoSaving && (
                    <span className="text-gray-400">자동 저장 활성화됨 (5초마다)</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('작성 중인 내용이 임시 저장되었습니다. 나가시겠습니까?')) {
                    setShowCreateModal(false);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateScene} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  화면 제목 *
                </label>
                <input
                  type="text"
                  value={newScene.title}
                  onChange={(e) => setNewScene({ ...newScene, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="예: 게임 소개"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newScene.description}
                  onChange={(e) => setNewScene({ ...newScene, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="화면에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  배경 색상
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newScene.background_color}
                    onChange={(e) => setNewScene({ ...newScene, background_color: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newScene.background_color}
                    onChange={(e) => setNewScene({ ...newScene, background_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  레이아웃 유형
                </label>
                <select
                  value={newScene.layout_type}
                  onChange={(e) => setNewScene({ ...newScene, layout_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">선택하세요</option>
                  <option value="full_image">전체 이미지</option>
                  <option value="text_only">텍스트만</option>
                  <option value="image_text">이미지 + 텍스트</option>
                  <option value="split">분할 화면</option>
                  <option value="custom">사용자 정의</option>
                </select>
              </div>

              {/* 이미지 관련 레이아웃 선택 시 이미지 업로드 */}
              {(newScene.layout_type === 'full_image' || newScene.layout_type === 'image_text' || newScene.layout_type === 'split') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 업로드
                  </label>
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
                        setNewScene({ ...newScene, background_image: data.url });
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

              {/* 이미지+텍스트 레이아웃 선택 시 텍스트 에디터 */}
              {newScene.layout_type === 'image_text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    텍스트 내용
                  </label>
                  
                  {/* 서식 도구 바 */}
                  <div className="flex gap-2 mb-2 p-2 bg-gray-100 rounded-lg border border-gray-300">
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = newScene.content.substring(start, end);
                          const newText = newScene.content.substring(0, start) + `**${selectedText}**` + newScene.content.substring(end);
                          setNewScene({ ...newScene, content: newText });
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                      title="굵게"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = newScene.content.substring(start, end);
                          const newText = newScene.content.substring(0, start) + `*${selectedText}*` + newScene.content.substring(end);
                          setNewScene({ ...newScene, content: newText });
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
                      title="기울임"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = newScene.content.substring(start, end);
                          const newText = newScene.content.substring(0, start) + `__${selectedText}__` + newScene.content.substring(end);
                          setNewScene({ ...newScene, content: newText });
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 underline"
                      title="밑줄"
                    >
                      U
                    </button>
                    <div className="border-l border-gray-300 mx-2"></div>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const lines = newScene.content.substring(0, start).split('\n');
                          const currentLineStart = start - lines[lines.length - 1].length;
                          const newText = newScene.content.substring(0, currentLineStart) + '# ' + newScene.content.substring(currentLineStart);
                          setNewScene({ ...newScene, content: newText });
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-lg font-bold"
                      title="제목 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const lines = newScene.content.substring(0, start).split('\n');
                          const currentLineStart = start - lines[lines.length - 1].length;
                          const newText = newScene.content.substring(0, currentLineStart) + '## ' + newScene.content.substring(currentLineStart);
                          setNewScene({ ...newScene, content: newText });
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
                      title="제목 2"
                    >
                      H2
                    </button>
                    <div className="border-l border-gray-300 mx-2"></div>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const lines = newScene.content.substring(0, start).split('\n');
                          const currentLineStart = start - lines[lines.length - 1].length;
                          const newText = newScene.content.substring(0, currentLineStart) + '- ' + newScene.content.substring(currentLineStart);
                          setNewScene({ ...newScene, content: newText });
                        }
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                      title="목록"
                    >
                      • 목록
                    </button>
                  </div>

                  <textarea
                    id="content-editor"
                    value={typeof newScene.content === 'string' ? newScene.content : ''}
                    onChange={(e) => setNewScene({ ...newScene, content: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    placeholder="이미지와 함께 표시될 텍스트를 입력하세요...&#10;&#10;서식 사용법:&#10;**굵게** - 굵은 텍스트&#10;*기울임* - 기울임 텍스트&#10;__밑줄__ - 밑줄 텍스트&#10;# 제목 1&#10;## 제목 2&#10;- 목록 항목"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Markdown 서식을 사용할 수 있습니다. 도구 바 버튼으로 텍스트를 선택한 후 서식을 적용하세요.
                  </p>
                </div>
              )}

              {/* 문제 추가 섹션 */}
              <div className="border-t border-gray-300 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    이 화면에 문제 추가 (선택사항)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewQuestions([...newQuestions, {
                        title: '',
                        type: 'multiple_choice',
                        description: '',
                        answer: '',
                        hint: '',
                        points: 10
                      }]);
                    }}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ➕ 문제 추가
                  </button>
                </div>

                {newQuestions.map((question, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700">문제 #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setNewQuestions(newQuestions.filter((_, i) => i !== index));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        삭제
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          문제 제목 *
                        </label>
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[index].title = e.target.value;
                            setNewQuestions(updated);
                          }}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                          placeholder="문제 제목을 입력하세요"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            문제 유형 *
                          </label>
                          <select
                            value={question.type}
                            onChange={(e) => {
                              const updated = [...newQuestions];
                              updated[index].type = e.target.value;
                              setNewQuestions(updated);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="multiple_choice">객관식</option>
                            <option value="short_answer">주관식 단답형</option>
                            <option value="true_false">O/X</option>
                            <option value="essay">서술형</option>
                            <option value="code">코딩</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            배점
                          </label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => {
                              const updated = [...newQuestions];
                              updated[index].points = parseInt(e.target.value) || 10;
                              setNewQuestions(updated);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          문제 설명
                        </label>
                        <textarea
                          value={question.description}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[index].description = e.target.value;
                            setNewQuestions(updated);
                          }}
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                          placeholder="문제에 대한 설명을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          정답 *
                        </label>
                        <input
                          type="text"
                          value={question.answer}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[index].answer = e.target.value;
                            setNewQuestions(updated);
                          }}
                          required
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                          placeholder="정답을 입력하세요"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          힌트
                        </label>
                        <input
                          type="text"
                          value={question.hint}
                          onChange={(e) => {
                            const updated = [...newQuestions];
                            updated[index].hint = e.target.value;
                            setNewQuestions(updated);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                          placeholder="힌트를 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {newQuestions.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    문제를 추가하려면 위의 "➕ 문제 추가" 버튼을 클릭하세요
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  생성하기
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 화면 편집 모달 */}
      {showEditModal && editingScene && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-900">화면 편집</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingScene(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateScene} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  화면 제목 *
                </label>
                <input
                  type="text"
                  value={newScene.title}
                  onChange={(e) => setNewScene({ ...newScene, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newScene.description}
                  onChange={(e) => setNewScene({ ...newScene, description: e.target.value })}
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
                    value={newScene.background_color}
                    onChange={(e) => setNewScene({ ...newScene, background_color: e.target.value })}
                    className="h-10 w-20 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newScene.background_color}
                    onChange={(e) => setNewScene({ ...newScene, background_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  레이아웃 유형
                </label>
                <select
                  value={newScene.layout_type}
                  onChange={(e) => setNewScene({ ...newScene, layout_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">선택하세요</option>
                  <option value="full_image">전체 이미지</option>
                  <option value="text_only">텍스트만</option>
                  <option value="image_text">이미지 + 텍스트</option>
                  <option value="split">분할 화면</option>
                  <option value="custom">사용자 정의</option>
                </select>
              </div>

              {(newScene.layout_type === 'full_image' || newScene.layout_type === 'image_text' || newScene.layout_type === 'split') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이미지 업로드
                  </label>
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
                        setNewScene({ ...newScene, background_image: data.url });
                      } catch (err: any) {
                        setError(err.message);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {newScene.background_image && (
                    <p className="text-xs text-green-600 mt-1">✓ 이미지가 설정되었습니다</p>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold"
                >
                  수정하기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingScene(null);
                  }}
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

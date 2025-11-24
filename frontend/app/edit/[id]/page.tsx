'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import SlatePreview from './SlatePreview';
import SlateEditor from '../../create/SlateEditor';

interface RoomInfo {
  id: string;
  title: string;
  intro_content?: string;
  intro_image?: string;
}
interface Scene {
  id: string;
  title: string;
  description: string;
  order_index: number;
  background_image: string;
  background_color: string;
  layout_type: string;
  content?: string;
  isDraft?: boolean;
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
  // Check for preview=1 in URL
  const [previewMode, setPreviewMode] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('preview') === '1') {
        setPreviewMode(true);
      }
    }
  }, []);

  const [scenes, setScenes] = useState<Scene[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editIntroMode, setEditIntroMode] = useState(false);
  const [editedIntroContent, setEditedIntroContent] = useState<any[]>([]);

  const uploadImage = async (file: File): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('로그인이 필요합니다');
    }

    const formDataImg = new FormData();
    formDataImg.append('image', file);
    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formDataImg,
    });

    if (!uploadRes.ok) {
      throw new Error('이미지 업로드에 실패했습니다');
    }

    const imgData = await uploadRes.json();
    return imgData.url;
  };

  const processIntroContentImages = async (content: any[]): Promise<any[]> => {
    const processedContent = await Promise.all(
      content.map(async (element) => {
        if ((element as any).type === 'image' && (element as any).imageId) {
          const imageId = (element as any).imageId;
          const base64 = localStorage.getItem(imageId);

          if (base64) {
            try {
              // base64를 File로 변환
              const response = await fetch(base64);
              const blob = await response.blob();
              const file = new File([blob], `image_${imageId}.png`, { type: blob.type });

              // 서버에 업로드
              const uploadedUrl = await uploadImage(file);

              // 로컬스토리지에서 제거
              localStorage.removeItem(imageId);

              // URL 교체
              return { ...element, url: uploadedUrl };
            } catch (error) {
              console.error('Image upload failed:', error);
              // 업로드 실패 시 base64 URL 유지
              return element;
            }
          }
        }
        return element;
      })
    );
    return processedContent;
  };
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
  // (moved above for preview param logic)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] = useState(false);
  const [questionBuilderLocked, setQuestionBuilderLocked] = useState(false);
  const [imagePreview, setImagePreview] = useState('');


  // 1. 로그인/권한 체크 및 roomInfo fetch
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
    fetchRoomInfo();
  }, [roomId, router]);

  // 2. roomInfo가 세팅된 후에만 scenes/questions fetch
  useEffect(() => {
    if (roomInfo) {
      fetchScenes();
      fetchQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomInfo]);

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setRoomInfo(data.room);
      }
    } catch (err) {
      // ignore
    }
  };

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
      let savedScenes: Scene[] = [];
      if (!response.ok) {
        // DB에 저장된 씬이 없어도 계속 진행
        console.log('No saved scenes in database');
      } else {
        const data = await response.json();
        savedScenes = data.scenes || [];
      }

      // localStorage에서 임시저장된 장면 가져오기
      const draftData = localStorage.getItem(`draft_scene_${roomId}`);
      if (draftData) {
        try {
          const parsed = JSON.parse(draftData);
          if (parsed.scene && parsed.scene.title) {
            // 임시저장된 장면을 배열에 추가
            const draftScene: Scene = {
              id: 'draft_temp',
              title: parsed.scene.title,
              description: parsed.scene.description || '',
              order_index: savedScenes.length,
              background_image: parsed.scene.background_image || '',
              background_color: parsed.scene.background_color || '#ffffff',
              layout_type: parsed.scene.layout_type || 'text_only',
              isDraft: true
            };
            savedScenes.push(draftScene);
          }
        } catch (err) {
          console.error('Failed to parse draft scene:', err);
        }
      }

      // Always prepend virtual intro scene if roomInfo has intro_content or intro_image
      if (roomInfo && (roomInfo.intro_content || roomInfo.intro_image)) {
        let introImage = roomInfo.intro_image || '';
        if (introImage && !introImage.startsWith('http') && !introImage.startsWith('/uploads')) {
          introImage = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${introImage}`;
        } else if (introImage && !introImage.startsWith('http')) {
          introImage = `${process.env.NEXT_PUBLIC_API_URL}${introImage}`;
        }
        savedScenes.unshift({
          id: 'virtual_intro',
          title: '소개',
          description: '',
          order_index: -1,
          background_image: introImage,
          background_color: '#ffffff',
          layout_type: 'image_text',
          content: roomInfo.intro_content || '',
        });
      }

      // Fix background_image for all scenes (DB scenes)
      savedScenes = savedScenes.map(scene => {
        if (scene.background_image && !scene.background_image.startsWith('http') && !scene.background_image.startsWith('/uploads')) {
          return { ...scene, background_image: `${process.env.NEXT_PUBLIC_API_URL}/uploads/${scene.background_image}` };
        } else if (scene.background_image && !scene.background_image.startsWith('http')) {
          return { ...scene, background_image: `${process.env.NEXT_PUBLIC_API_URL}${scene.background_image}` };
        }
        return scene;
      });

      // Sort so that the intro scene (title: '소개') is always first (in case DB에도 있음)
      const introIndex = savedScenes.findIndex(s => s.title === '소개');
      if (introIndex > 0) {
        const [introScene] = savedScenes.splice(introIndex, 1);
        savedScenes.unshift(introScene);
      }
      setScenes(savedScenes);
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

  // Markdown 파싱 함수
  const parseMarkdown = (text: string) => {
    if (!text) return null;
    let raw: any = text;
    // Handle object content (e.g., { text: string })
    if (typeof raw === 'object' && raw !== null && Object.prototype.hasOwnProperty.call(raw, 'text')) {
      raw = raw.text;
    }
    if (typeof raw !== 'string') return null;
    let html = raw;
    // 제목 파싱
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');
    // 굵게, 기울임, 밑줄
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    html = html.replace(/__(.+?)__/g, '<u class="underline">$1</u>');
    // 목록
    html = html.replace(/^\* (.+)$/gim, '<li class="ml-4">• $1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-4">• $1</li>');
    // 줄바꿈
    html = html.replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // 미리보기 모드 전환 시 모든 scene의 content 불러오기
  useEffect(() => {
    if (previewMode && scenes.length > 0) {
      const fetchAllSceneContents = async () => {
        const token = localStorage.getItem('token');
        const updatedScenes = await Promise.all(
          scenes.map(async (scene) => {
            // 임시저장이거나 draft ID를 가진 scene은 API 호출 건너뛰기
            if (scene.isDraft || scene.id.startsWith('draft_') || scene.id === 'draft_temp') {
              return scene;
            }
            try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${scene.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (response.ok) {
                const data = await response.json();
                return { 
                  ...scene, 
                  content: data.scene?.content || '',
                  background_image: data.scene?.background_image || scene.background_image,
                  layout_type: data.scene?.layout_type || scene.layout_type
                };
              }
            } catch (err) {
              // silently skip error
            }
            return scene;
          })
        );
        setScenes(updatedScenes);
      };
      fetchAllSceneContents();
    }
  }, [previewMode]);

  useEffect(() => {
    if (newQuestions.length === 0) {
      setQuestionBuilderLocked(false);
    }
  }, [newQuestions.length]);

  const createQuestionTemplate = (type: string = 'multiple_choice') => ({
    title: '',
    type,
    description: '',
    answer: '',
    hint: '',
    points: 10
  });

  const handleQuestionTypeSelect = (type: string) => {
    setNewQuestions([createQuestionTemplate(type)]);
    setShowQuestionTypeSelector(false);
    setQuestionBuilderLocked(true);
  };

  const handleAddNewQuestionAfterExisting = () => {
    setNewQuestions(prev => [...prev, createQuestionTemplate()]);
  };

  const resolveImageUrl = (value: string) => {
    if (!value) return '';
    if (value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('http')) {
      return value;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}${value}`;
  };

  // 기존 이미지가 있으면 모달 열릴 때 미리보기 세팅, 닫힐 때 초기화
  useEffect(() => {
    if (showCreateModal) {
      if (newScene.background_image) {
        setImagePreview(resolveImageUrl(newScene.background_image));
      } else {
        setImagePreview('');
      }
    } else {
      setImagePreview('');
      localStorage.removeItem('scene_image_preview');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateModal]);

  // 업로드 input에서 이미지가 바뀌면 미리보기 갱신 (newScene.background_image가 바뀔 때도 반영)
  useEffect(() => {
    if (showCreateModal && newScene.background_image) {
      setImagePreview(resolveImageUrl(newScene.background_image));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newScene.background_image]);

  const handleSceneImageUpload = async (file: File): Promise<void> => {
    // 1. Convert to base64 and store in localStorage for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      localStorage.setItem('scene_image_preview', base64);
    };
    reader.readAsDataURL(file);

    // 2. Upload to server as before
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
      setNewScene(prev => ({ ...prev, background_image: data.url }));
      setImagePreview(data.preview || resolveImageUrl(data.url));
      localStorage.removeItem('scene_image_preview');
    } catch (err: any) {
      setError(err.message || '이미지 업로드 중 오류가 발생했습니다.');
      setImagePreview('');
      localStorage.removeItem('scene_image_preview');
    }
  };

  const renderImagePreview = () => {
    // 1. Try localStorage preview first (if exists and not yet uploaded)
    let previewUrl = imagePreview;
    const localPreview = localStorage.getItem('scene_image_preview');
    if (localPreview) previewUrl = localPreview;
    if (!previewUrl) return null;

    return (
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-1">이미지 미리보기</p>
        <div className="w-full h-44 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${previewUrl}')` }}
          />
        </div>
      </div>
    );
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
          title: newScene.title,
          description: newScene.description,
          background_color: newScene.background_color,
          background_image: newScene.background_image,
          layout_type: newScene.layout_type,
          content: newScene.content ? JSON.stringify({ text: newScene.content }) : JSON.stringify({ text: '' })
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
      localStorage.removeItem('scene_image_preview');
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
    // Custom confirm dialog with copyable '삭제' text
    let confirmed = false;
    const confirmDiv = document.createElement('div');
    confirmDiv.style.position = 'fixed';
    confirmDiv.style.left = '0';
    confirmDiv.style.top = '0';
    confirmDiv.style.width = '100vw';
    confirmDiv.style.height = '100vh';
    confirmDiv.style.background = 'rgba(0,0,0,0.3)';
    confirmDiv.style.display = 'flex';
    confirmDiv.style.alignItems = 'center';
    confirmDiv.style.justifyContent = 'center';
    confirmDiv.style.zIndex = '9999';
    confirmDiv.innerHTML = `
      <div style="background:white;padding:2rem 2.5rem;border-radius:1rem;box-shadow:0 2px 16px #0002;max-width:90vw;min-width:320px;text-align:center;">
        <div style="font-size:1.1rem;margin-bottom:1.5rem;font-weight:bold;color:#111;">이 화면을 삭제하시겠습니까?<br><span style='font-weight:bold;color:#111;'>삭제를 확인하려면 <span id="copy-delete-text" style="color:#e53e3e;cursor:pointer;text-decoration:underline;font-weight:bold;">삭제</span>를 입력하세요.</span></div>
        <input id="delete-confirm-input" style="padding:0.5rem 1rem;border:1px solid #333;border-radius:0.5rem;width:70%;font-size:1rem;font-weight:bold;color:#111;" placeholder="삭제" />
        <div style="margin-top:1.5rem;display:flex;gap:1rem;justify-content:center;">
          <button id="delete-confirm-btn" style="background:#e53e3e;color:white;padding:0.5rem 1.5rem;border:none;border-radius:0.5rem;font-weight:bold;">삭제</button>
          <button id="delete-cancel-btn" style="background:#eee;color:#111;padding:0.5rem 1.5rem;border:none;border-radius:0.5rem;font-weight:bold;">취소</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmDiv);
    const input = confirmDiv.querySelector('#delete-confirm-input') as HTMLInputElement;
    const confirmBtn = confirmDiv.querySelector('#delete-confirm-btn') as HTMLButtonElement;
    const cancelBtn = confirmDiv.querySelector('#delete-cancel-btn') as HTMLButtonElement;
    const copyDeleteText = confirmDiv.querySelector('#copy-delete-text') as HTMLSpanElement;
    if (copyDeleteText) {
      copyDeleteText.addEventListener('click', () => {
        navigator.clipboard.writeText('삭제');
        copyDeleteText.innerText = '복사됨!';
        setTimeout(() => { copyDeleteText.innerText = '삭제'; }, 1000);
      });
    }
    return new Promise<void>((resolve) => {
      confirmBtn.onclick = async () => {
        if (input.value.trim() === '삭제') {
          confirmed = true;
          document.body.removeChild(confirmDiv);
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
          resolve();
        } else {
          input.style.borderColor = '#e53e3e';
          input.focus();
        }
      };
      cancelBtn.onclick = () => {
        document.body.removeChild(confirmDiv);
        resolve();
      };
      input.onkeydown = (e) => {
        if (e.key === 'Enter') confirmBtn.click();
      };
      input.focus();
    });
  };

  const handleOpenQuestionModal = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    // 빈 문제 목록으로 시작 (유형 선택 그리드를 먼저 보여줌)
    setBulkQuestions([]);
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

  const handleEditScene = async (scene: Scene) => {
    setEditingScene(scene);
    
    // Scene의 기존 content 불러오기 (있다면)
    let sceneContent = '';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${scene.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        sceneContent = data.scene?.content || '';
      }
    } catch (err) {
      console.error('Failed to fetch scene content:', err);
    }
    
    setNewScene({
      title: scene.title,
      description: scene.description,
      background_color: scene.background_color,
      layout_type: scene.layout_type,
      background_image: scene.background_image,
      content: sceneContent
    });
    setShowEditModal(true);
  };

  const handleUpdateScene = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScene) return;

    try {
      const token = localStorage.getItem('token');
      // content는 항상 JSON string으로 전송 (MySQL JSON 컬럼 호환)
      let contentString = '';
      if (typeof newScene.content === 'string') {
        contentString = JSON.stringify({ text: newScene.content });
      } else if (typeof newScene.content === 'object' && newScene.content !== null && Object.prototype.hasOwnProperty.call(newScene.content, 'text')) {
        contentString = JSON.stringify(newScene.content);
      } else {
        contentString = JSON.stringify({ text: '' });
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes/${editingScene.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newScene.title,
          description: newScene.description,
          background_color: newScene.background_color,
          background_image: newScene.background_image,
          layout_type: newScene.layout_type,
          content: contentString
        }),
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

  const handleUpdateIntro = async (introContent: any[]) => {
    if (!roomInfo) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      // Process images in intro content (same as create page)
      const processedIntroContent = await processIntroContentImages(introContent);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intro_content: JSON.stringify(processedIntroContent),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update intro content');
      }

      // Update local roomInfo
      setRoomInfo({
        ...roomInfo,
        intro_content: JSON.stringify(processedIntroContent),
      });

      setEditIntroMode(false);
      alert('소개 내용이 수정되었습니다.');
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
                게임 컨텐츠 관리 ({scenes.length}개)
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
                <>
                  {scenes.length === 0 ? (
                    <button
                      onClick={() => {
                        setSelectedSceneId("");
                        setNewScene({
                          title: roomInfo?.title || '',
                          description: '',
                          background_color: '#ffffff',
                          layout_type: '',
                          background_image: '',
                          content: roomInfo?.intro_content || ''
                        });
                        setShowCreateModal(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                      ➕ 새 화면 만들기
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSceneId("");
                        setShowCreateModal(true);
                      }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                      ➕ 새 화면 추가 (맨 뒤에)
                    </button>
                  )}
                </>
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
              <div>
                <p className="text-lg mb-2">아직 화면이 없습니다</p>
                <p className="text-sm">화면을 추가하여 게임 스토리를 구성하세요!</p>
                {/* 여기에 원하는 추가 내용을 넣을 수 있습니다 */}
              </div>
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
                {/* (console.log removed) */}
                <div
                  className="h-96 flex items-center justify-center text-9xl relative"
                  style={{
                    backgroundColor: scenes[currentPreviewIndex].background_color,
                      backgroundImage: scenes[currentPreviewIndex].background_image 
                        ? `url(${
                            scenes[currentPreviewIndex].background_image.startsWith('http') || scenes[currentPreviewIndex].background_image.startsWith('data:')
                              ? scenes[currentPreviewIndex].background_image 
                              : `${process.env.NEXT_PUBLIC_API_URL}${scenes[currentPreviewIndex].background_image}`
                          })` 
                        : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!scenes[currentPreviewIndex].background_image && '🖼️'}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                    화면 #{currentPreviewIndex + 1}
                  </div>
                  {scenes[currentPreviewIndex].isDraft && (
                    <div className="absolute top-4 right-4 bg-yellow-500 bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg animate-pulse">
                      💾 임시저장
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-gray-900">
                        {scenes[currentPreviewIndex].title}
                        {scenes[currentPreviewIndex].title === '소개' && (
                          <span className="ml-3 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-semibold align-middle">소개 페이지</span>
                        )}
                      </h2>
                      {scenes[currentPreviewIndex].isDraft && (
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                          💾 임시저장됨
                        </span>
                      )}
                    </div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {scenes[currentPreviewIndex].layout_type}
                    </span>
                  </div>
                  {scenes[currentPreviewIndex].description && (
                    <p className="text-lg text-gray-900 font-semibold mb-6">
                      {scenes[currentPreviewIndex].description}
                    </p>
                  )}

                  {/* 텍스트 컨텐츠 미리보기 */}
                  {/* (console.log removed) */}
                  {scenes[currentPreviewIndex].layout_type === 'image_text' && scenes[currentPreviewIndex].content && (
                    <div className="mt-6 p-6 bg-white border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-indigo-600">📝</span>
                        텍스트 컨텐츠
                      </h3>
                      <div className="prose prose-sm max-w-none text-gray-900 font-semibold">
                        {parseMarkdown(scenes[currentPreviewIndex].content)}
                      </div>
                    </div>
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
                    className={`border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow ${selectedSceneId === scene.id ? 'ring-4 ring-indigo-400' : ''}`}
                  >
                  <div
                    className="h-40 flex items-center justify-center text-6xl"
                    style={{
                      backgroundColor: scene.background_color,
                      backgroundImage: scene.background_image 
                        ? `url(${
                            scene.background_image.startsWith('http') || scene.background_image.startsWith('data:')
                              ? scene.background_image 
                              : `${process.env.NEXT_PUBLIC_API_URL}${scene.background_image}`
                          })` 
                        : 'none',
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
                    {scene.title === '소개' && (
                      <span className="ml-2 text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-semibold align-middle">소개 페이지</span>
                    )}
                    {/* 소개 페이지일 때 intro_content/intro_image 미리보기 */}
                    {scene.id === 'virtual_intro' && (
                      <div className="mt-2">
                        {scene.background_image && (
                          <img src={scene.background_image.startsWith('http') || scene.background_image.startsWith('data:') ? scene.background_image : `${process.env.NEXT_PUBLIC_API_URL}${scene.background_image}`} alt="소개 이미지" className="max-h-32 rounded mb-2" />
                        )}
                        {scene.content && (
                          <div className="bg-gray-50 p-2 rounded">
                            {!editIntroMode ? (
                              <>
                                {(() => {
                                  try {
                                    const parsedContent = JSON.parse(scene.content);
                                    return <SlatePreview content={parsedContent} />;
                                  } catch (error) {
                                    // Fallback to markdown parsing if JSON parsing fails
                                    return <div className="prose prose-sm max-w-none" style={{whiteSpace:'pre-line'}}>
                                      {parseMarkdown(scene.content)}
                                    </div>;
                                  }
                                })()}
                                <button
                                  onClick={() => {
                                    setEditIntroMode(true);
                                    // 편집 모드로 전환할 때 현재 내용을 초기화
                                    try {
                                      const parsedContent = scene.content ? JSON.parse(scene.content) : [{ type: 'paragraph', children: [{ text: '' }] }];
                                      setEditedIntroContent(parsedContent);
                                    } catch (error) {
                                      setEditedIntroContent([{ type: 'paragraph', children: [{ text: '' }] }]);
                                    }
                                  }}
                                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                >
                                  소개 내용 편집
                                </button>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">소개 내용 편집</span>
                                  <div className="space-x-2">
                                    <button
                                      onClick={() => setEditIntroMode(false)}
                                      className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleUpdateIntro(editedIntroContent);
                                      }}
                                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                                    >
                                      저장
                                    </button>
                                  </div>
                                </div>
                                {(() => {
                                  try {
                                    const parsedContent = JSON.parse(scene.content);
                                    return (
                                      <SlateEditor
                                        value={editedIntroContent}
                                        onChange={setEditedIntroContent}
                                      />
                                    );
                                  } catch (error) {
                                    return <div className="text-red-500">내용을 불러올 수 없습니다.</div>;
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {scene.description && (
                      <p className="text-sm text-gray-900 font-semibold mb-3 line-clamp-2">{scene.description}</p>
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

                    <div className="flex gap-2 mb-2 items-center">
                      <button
                        onClick={() => handleEditScene(scene)}
                        className="flex-1 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                      >
                        ✏️ 편집
                      </button>
                      <button
                        onClick={() => handleDeleteScene(scene.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        id={`delete-btn-${scene.id}`}
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

            {/* 문제가 없을 때 문제 유형 선택 그리드 표시 */}
            {bulkQuestions.length === 0 && (
              <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📝 추가할 문제 유형을 선택하세요 (15가지)</h3>
                
                <div className="space-y-4">
                  {/* 기본 문제 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">기본 문제</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'multiple_choice',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">📝</div>
                        <div className="font-semibold text-sm text-gray-900">객관식</div>
                        <div className="text-xs text-gray-500 mt-1">4지선다</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'short_answer',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">✍️</div>
                        <div className="font-semibold text-sm text-gray-900">주관식 단답형</div>
                        <div className="text-xs text-gray-500 mt-1">짧은 답 입력</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'true_false',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">⭕</div>
                        <div className="font-semibold text-sm text-gray-900">O/X 퀴즈</div>
                        <div className="text-xs text-gray-500 mt-1">참/거짓</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'essay',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">📄</div>
                        <div className="font-semibold text-sm text-gray-900">서술형</div>
                        <div className="text-xs text-gray-500 mt-1">긴 답변</div>
                      </button>
                    </div>
                  </div>

                  {/* 특수 문제 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">특수 문제</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'fill_blank',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">📋</div>
                        <div className="font-semibold text-sm text-gray-900">빈칸 채우기</div>
                        <div className="text-xs text-gray-500 mt-1">문장 완성</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'matching',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🔗</div>
                        <div className="font-semibold text-sm text-gray-900">연결하기</div>
                        <div className="text-xs text-gray-500 mt-1">짝 맞추기</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'ordering',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🔢</div>
                        <div className="font-semibold text-sm text-gray-900">순서 맞추기</div>
                        <div className="text-xs text-gray-500 mt-1">올바른 순서</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'image_choice',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🖼️</div>
                        <div className="font-semibold text-sm text-gray-900">이미지 선택</div>
                        <div className="text-xs text-gray-500 mt-1">이미지 고르기</div>
                      </button>
                    </div>
                  </div>

                  {/* 고급 문제 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">고급 문제</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'code',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">💻</div>
                        <div className="font-semibold text-sm text-gray-900">코딩 문제</div>
                        <div className="text-xs text-gray-500 mt-1">코드 작성</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'puzzle',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🧩</div>
                        <div className="font-semibold text-sm text-gray-900">퍼즐</div>
                        <div className="text-xs text-gray-500 mt-1">조각 맞추기</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'drag_drop',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🎯</div>
                        <div className="font-semibold text-sm text-gray-900">드래그 앤 드롭</div>
                        <div className="text-xs text-gray-500 mt-1">항목 배치</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'drawing',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🎨</div>
                        <div className="font-semibold text-sm text-gray-900">그림 그리기</div>
                        <div className="text-xs text-gray-500 mt-1">스케치</div>
                      </button>
                    </div>
                  </div>

                  {/* 게임형 문제 */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">게임형 문제</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'word_search',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🔍</div>
                        <div className="font-semibold text-sm text-gray-900">단어 찾기</div>
                        <div className="text-xs text-gray-500 mt-1">단어 검색</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'crossword',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">📝</div>
                        <div className="font-semibold text-sm text-gray-900">십자말풀이</div>
                        <div className="text-xs text-gray-500 mt-1">가로세로</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkQuestions([{
                            title: '',
                            type: 'memory_card',
                            description: '',
                            answer: '',
                            hint: '',
                            points: 10
                          }]);
                        }}
                        className="p-4 bg-white border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-1">🃏</div>
                        <div className="font-semibold text-sm text-gray-900">카드 짝 맞추기</div>
                        <div className="text-xs text-gray-500 mt-1">메모리 게임</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                        문제 유형 * <span className="text-xs text-gray-500">(15가지)</span>
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
                        <optgroup label="기본 문제">
                          <option value="multiple_choice">📝 객관식 (4지선다)</option>
                          <option value="short_answer">✍️ 주관식 단답형</option>
                          <option value="true_false">⭕ O/X 퀴즈</option>
                          <option value="essay">📄 서술형</option>
                        </optgroup>
                        <optgroup label="특수 문제">
                          <option value="fill_blank">📋 빈칸 채우기</option>
                          <option value="matching">🔗 연결하기</option>
                          <option value="ordering">🔢 순서 맞추기</option>
                          <option value="image_choice">🖼️ 이미지 선택</option>
                        </optgroup>
                        <optgroup label="고급 문제">
                          <option value="code">💻 코딩 문제</option>
                          <option value="puzzle">🧩 퍼즐 조각 맞추기</option>
                          <option value="drag_drop">🎯 드래그 앤 드롭</option>
                          <option value="drawing">🎨 그림 그리기</option>
                        </optgroup>
                        <optgroup label="게임형 문제">
                          <option value="word_search">🔍 단어 찾기</option>
                          <option value="crossword">📝 십자말풀이</option>
                          <option value="memory_card">🃏 카드 짝 맞추기</option>
                        </optgroup>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {question.type === 'multiple_choice' && '4개의 선택지 중 정답 선택'}
                        {question.type === 'short_answer' && '짧은 답을 직접 입력'}
                        {question.type === 'true_false' && 'O 또는 X 선택'}
                        {question.type === 'essay' && '긴 답변을 서술형으로 작성'}
                        {question.type === 'fill_blank' && '문장의 빈칸에 알맞은 단어 입력'}
                        {question.type === 'matching' && '좌우 항목을 서로 연결'}
                        {question.type === 'ordering' && '항목들을 올바른 순서로 배열'}
                        {question.type === 'image_choice' && '이미지 중 정답 선택'}
                        {question.type === 'code' && '프로그래밍 코드 작성 및 실행'}
                        {question.type === 'puzzle' && '흩어진 조각을 맞춰 완성'}
                        {question.type === 'drag_drop' && '항목을 드래그하여 적절한 위치에 배치'}
                        {question.type === 'drawing' && '그림을 그려서 답 제출'}
                        {question.type === 'word_search' && '글자판에서 숨겨진 단어 찾기'}
                        {question.type === 'crossword' && '가로세로 낱말 퍼즐 풀기'}
                        {question.type === 'memory_card' && '뒤집힌 카드에서 같은 짝 찾기'}
                      </p>
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
                {scenes.length === 0 ? (
                  <input
                    type="text"
                    value={newScene.title}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={newScene.title}
                    onChange={(e) => setNewScene({ ...newScene, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="예: 게임 소개"
                  />
                )}
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
                      await handleSceneImageUpload(file);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, SVG, WEBP (최대 10MB)
                  </p>
                  {imagePreview && renderImagePreview()}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-gray-900 placeholder:text-gray-500"
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
                  {questionBuilderLocked ? (
                    <button
                      type="button"
                      onClick={handleAddNewQuestionAfterExisting}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      ➕ 새로운 문제 추가
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowQuestionTypeSelector(!showQuestionTypeSelector)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      ➕ 문제 유형 선택
                    </button>
                  )}
                </div>

                {/* 문제 유형 선택 그리드 */}
                {showQuestionTypeSelector && !questionBuilderLocked && (
                  <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📝 추가할 문제 유형을 선택하세요 (15가지)</h3>
                    
                    <div className="space-y-4">
                      {/* 기본 문제 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">기본 문제</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('multiple_choice')}
                            className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">📝</div>
                            <div className="font-semibold text-sm text-gray-900">객관식</div>
                            <div className="text-xs text-gray-500 mt-1">4지선다</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('short_answer')}
                            className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">✍️</div>
                            <div className="font-semibold text-sm text-gray-900">주관식 단답형</div>
                            <div className="text-xs text-gray-500 mt-1">짧은 답 입력</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('true_false')}
                            className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">⭕</div>
                            <div className="font-semibold text-sm text-gray-900">O/X 퀴즈</div>
                            <div className="text-xs text-gray-500 mt-1">참/거짓</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('essay')}
                            className="p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">📄</div>
                            <div className="font-semibold text-sm text-gray-900">서술형</div>
                            <div className="text-xs text-gray-500 mt-1">긴 답변</div>
                          </button>
                        </div>
                      </div>

                      {/* 특수 문제 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">특수 문제</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('fill_blank')}
                            className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">📋</div>
                            <div className="font-semibold text-sm text-gray-900">빈칸 채우기</div>
                            <div className="text-xs text-gray-500 mt-1">문장 완성</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('matching')}
                            className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🔗</div>
                            <div className="font-semibold text-sm text-gray-900">연결하기</div>
                            <div className="text-xs text-gray-500 mt-1">짝 맞추기</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('ordering')}
                            className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🔢</div>
                            <div className="font-semibold text-sm text-gray-900">순서 맞추기</div>
                            <div className="text-xs text-gray-500 mt-1">올바른 순서</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('image_choice')}
                            className="p-4 bg-white border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🖼️</div>
                            <div className="font-semibold text-sm text-gray-900">이미지 선택</div>
                            <div className="text-xs text-gray-500 mt-1">이미지 고르기</div>
                          </button>
                        </div>
                      </div>

                      {/* 고급 문제 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">고급 문제</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('code')}
                            className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">💻</div>
                            <div className="font-semibold text-sm text-gray-900">코딩 문제</div>
                            <div className="text-xs text-gray-500 mt-1">코드 작성</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('puzzle')}
                            className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🧩</div>
                            <div className="font-semibold text-sm text-gray-900">퍼즐</div>
                            <div className="text-xs text-gray-500 mt-1">조각 맞추기</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('drag_drop')}
                            className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🎯</div>
                            <div className="font-semibold text-sm text-gray-900">드래그 앤 드롭</div>
                            <div className="text-xs text-gray-500 mt-1">항목 배치</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeSelect('drawing')}
                            className="p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🎨</div>
                            <div className="font-semibold text-sm text-gray-900">그림 그리기</div>
                            <div className="text-xs text-gray-500 mt-1">스케치</div>
                          </button>
                        </div>
                      </div>

                      {/* 게임형 문제 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">게임형 문제</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setNewQuestions([...newQuestions, {
                                title: '',
                                type: 'word_search',
                                description: '',
                                answer: '',
                                hint: '',
                                points: 10
                              }]);
                              setShowQuestionTypeSelector(false);
                            }}
                            className="p-4 bg-white border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🔍</div>
                            <div className="font-semibold text-sm text-gray-900">단어 찾기</div>
                            <div className="text-xs text-gray-500 mt-1">단어 검색</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewQuestions([...newQuestions, {
                                title: '',
                                type: 'crossword',
                                description: '',
                                answer: '',
                                hint: '',
                                points: 10
                              }]);
                              setShowQuestionTypeSelector(false);
                            }}
                            className="p-4 bg-white border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">📝</div>
                            <div className="font-semibold text-sm text-gray-900">십자말풀이</div>
                            <div className="text-xs text-gray-500 mt-1">가로세로</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNewQuestions([...newQuestions, {
                                title: '',
                                type: 'memory_card',
                                description: '',
                                answer: '',
                                hint: '',
                                points: 10
                              }]);
                              setShowQuestionTypeSelector(false);
                            }}
                            className="p-4 bg-white border-2 border-yellow-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                          >
                            <div className="text-2xl mb-1">🃏</div>
                            <div className="font-semibold text-sm text-gray-900">카드 짝 맞추기</div>
                            <div className="text-xs text-gray-500 mt-1">메모리 게임</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {newQuestions.map((question, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">문제 #{index + 1}</h4>
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
                            <optgroup label="기본 문제">
                              <option value="multiple_choice">📝 객관식</option>
                              <option value="short_answer">✍️ 주관식 단답형</option>
                              <option value="true_false">⭕ O/X</option>
                              <option value="essay">📄 서술형</option>
                            </optgroup>
                            <optgroup label="특수 문제">
                              <option value="fill_blank">📋 빈칸 채우기</option>
                              <option value="matching">🔗 연결하기</option>
                              <option value="ordering">🔢 순서 맞추기</option>
                              <option value="image_choice">🖼️ 이미지 선택</option>
                            </optgroup>
                            <optgroup label="고급 문제">
                              <option value="code">💻 코딩</option>
                              <option value="puzzle">🧩 퍼즐</option>
                              <option value="drag_drop">🎯 드래그 앤 드롭</option>
                              <option value="drawing">🎨 그림 그리기</option>
                            </optgroup>
                            <optgroup label="게임형 문제">
                              <option value="word_search">🔍 단어 찾기</option>
                              <option value="crossword">📝 십자말풀이</option>
                              <option value="memory_card">🃏 카드 짝 맞추기</option>
                            </optgroup>
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
                      await handleSceneImageUpload(file);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {renderImagePreview()}
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
                        const textarea = document.getElementById('edit-content-editor') as HTMLTextAreaElement;
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
                        const textarea = document.getElementById('edit-content-editor') as HTMLTextAreaElement;
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
                        const textarea = document.getElementById('edit-content-editor') as HTMLTextAreaElement;
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
                        const textarea = document.getElementById('edit-content-editor') as HTMLTextAreaElement;
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
                        const textarea = document.getElementById('edit-content-editor') as HTMLTextAreaElement;
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
                        const textarea = document.getElementById('edit-content-editor') as HTMLTextAreaElement;
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
                    id="edit-content-editor"
                    value={typeof newScene.content === 'string' ? newScene.content : ''}
                    onChange={(e) => setNewScene({ ...newScene, content: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    placeholder="이미지와 함께 표시될 텍스트를 입력하세요..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Markdown 서식을 사용할 수 있습니다.
                  </p>
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

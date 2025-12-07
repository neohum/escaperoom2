'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SlateEditor from './SlateEditor';
import type { ParagraphElement } from './slate.d';
// import { Editor, EditorProvider } from 'react-simple-wysiwyg';

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
  const [introImage, setIntroImage] = useState<File | string>('');
  const [introImagePreview, setIntroImagePreview] = useState<string>('');
  const [introContent, setIntroContent] = useState<ParagraphElement[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  const [authorContent, setAuthorContent] = useState<ParagraphElement[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  const [sponsorContent, setSponsorContent] = useState<ParagraphElement[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  const safeSetIntroContent = (val: any) => {
    if (!Array.isArray(val) || val.length === 0) {
      setIntroContent([{ type: 'paragraph', children: [{ text: '' }] }]);
    } else {
      setIntroContent(val as ParagraphElement[]);
    }
  };
  const safeSetAuthorContent = (val: any) => {
    if (!Array.isArray(val) || val.length === 0) {
      setAuthorContent([{ type: 'paragraph', children: [{ text: '' }] }]);
    } else {
      setAuthorContent(val as ParagraphElement[]);
    }
  };
  const safeSetSponsorContent = (val: any) => {
    if (!Array.isArray(val) || val.length === 0) {
      setSponsorContent([{ type: 'paragraph', children: [{ text: '' }] }]);
    } else {
      setSponsorContent(val as ParagraphElement[]);
    }
  };
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
      setError('컨텐츠 제작자만 접근할 수 있습니다');
      router.push('/');
      return;
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

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

  const processIntroContentImages = async (content: ParagraphElement[]): Promise<ParagraphElement[]> => {
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
      // 1. 이미지 업로드 (있으면)
      let uploadedImageUrl = '';
      if (introImage && introImage instanceof File) {
        uploadedImageUrl = await uploadImage(introImage);
      }

      // 2. 에디터 내용의 이미지들 처리
      const processedIntroContent = await processIntroContentImages(introContent);
      const processedAuthorContent = await processIntroContentImages(authorContent);
      const processedSponsorContent = await processIntroContentImages(sponsorContent);

      // 3. 컨텐츠 생성
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          intro_image: uploadedImageUrl,
          intro_content: JSON.stringify(processedIntroContent),
          author: JSON.stringify(processedAuthorContent),
          sponsor: JSON.stringify(processedSponsorContent),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // 4. 첫 번째 scene (시작 페이지) 생성
      const sceneResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: data.room.id,
          title: '',
          description: '컨텐츠 시작 페이지',
          background_image: uploadedImageUrl,
          background_color: '#ffffff',
          content: JSON.stringify(processedIntroContent),
          layout_type: 'image_text',
          transition_type: 'fade',
          auto_advance: false,
          auto_advance_delay: 0
        }),
      });

      if (!sceneResponse.ok) {
        console.warn('Failed to create intro scene, but room was created');
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">새 컨텐츠 만들기</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* <EditorProvider> */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              컨텐츠 제목 *
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 font-bold placeholder-gray-400"
              placeholder="컨텐츠에 대한 설명을 입력하세요"
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

          {/* 소개 이미지 & 텍스트 에디터 - moved here, right after play time inputs */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-2">소개 페이지 이미지 및 텍스트</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">소개 이미지 업로드</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIntroImage(file as any);
                    setIntroImagePreview(URL.createObjectURL(file));
                  } else {
                    setIntroImage('');
                    setIntroImagePreview('');
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              {introImagePreview && (
                <div className="mt-2">
                  <img src={introImagePreview} alt="소개 이미지 미리보기" className="max-h-48 rounded-lg border" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">소개 텍스트 (서식 지원)</label>
              <div className="bg-white border border-gray-300 rounded-lg">
                <SlateEditor
                  value={Array.isArray(introContent) && introContent.length > 0 && introContent.some(e => e && e.type && Array.isArray(e.children))
                    ? introContent
                    : [{ type: 'paragraph', children: [{ text: '' }] }]}
                  onChange={safeSetIntroContent}
                  placeholder="컨텐츠 소개, 규칙, 배경 등 자유롭게 입력하세요. (굵게, 색상, 이미지, 링크 등 지원)"
                  minHeight="100px"
                />
              </div>
            </div>
          </div>

          {/* 제작자와 후원자 정보 */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">제작 및 후원 정보</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  제작자 정보
                </label>
                <div className="bg-white border border-gray-300 rounded-lg">
                  <SlateEditor
                    value={Array.isArray(authorContent) && authorContent.length > 0 && authorContent.some(e => e && e.type && Array.isArray(e.children))
                      ? authorContent
                      : [{ type: 'paragraph', children: [{ text: '' }] }]}
                    onChange={safeSetAuthorContent}
                    placeholder="제작자 이름, 역할 등 (예: 김철수 - 기획/개발)"
                    minHeight="100px"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="sponsor" className="block text-sm font-medium text-gray-700 mb-2">
                  후원자 정보
                </label>
                <div className="bg-white border border-gray-300 rounded-lg">
                  <SlateEditor
                    value={Array.isArray(sponsorContent) && sponsorContent.length > 0 && sponsorContent.some(e => e && e.type && Array.isArray(e.children))
                      ? sponsorContent
                      : [{ type: 'paragraph', children: [{ text: '' }] }]}
                    onChange={safeSetSponsorContent}
                    placeholder="후원자 이름, 기관 등 (예: ABC 교육청 - 후원)"
                    minHeight="100px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
            >
              {loading ? '생성 중...' : '컨텐츠 생성'}
            </button>
            <Link
              href="/my-games"
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 text-center"
            >
              취소
            </Link>
          </div>
        </form>
        {/* </EditorProvider> */}
      </main>
    </div>
  );
}


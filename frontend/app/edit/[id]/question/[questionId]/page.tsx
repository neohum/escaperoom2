'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface QuestionFormData {
  title: string;
  type: string;
  content: any;
  answer: any;
  hint: string;
  points: number;
  order_index: number;
  description?: string;
  youtube_id?: string;
  character_svg_url?: string;
}

interface QuestionType {
  value: string;
  label: string;
  icon: string;
  description: string;
  example: string;
}

const QUESTION_TYPES: QuestionType[] = [
  {
    value: 'multiple_choice',
    label: '객관식',
    icon: '📝',
    description: '여러 선택지 중 정답을 고르는 문제',
    example: '다음 중 정답은? ① 사과 ② 바나나 ③ 포도',
  },
  {
    value: 'multiple_answer',
    label: '다답형',
    icon: '☑️',
    description: '여러 선택지 중 정답을 모두 고르는 문제',
    example: '다음 중 과일을 모두 고르세요 (복수 선택)',
  },
  {
    value: 'true_false',
    label: 'OX 문제',
    icon: '⭕',
    description: 'O 또는 X로 답하는 문제',
    example: '대한민국의 수도는 서울이다 (O/X)',
  },
  {
    value: 'short_answer',
    label: '주관식',
    icon: '✍️',
    description: '직접 답을 입력하는 문제',
    example: '대한민국의 수도는?',
  },
  {
    value: 'password',
    label: '비밀번호',
    icon: '🔐',
    description: '숫자나 문자 비밀번호를 입력하는 문제',
    example: '금고의 비밀번호 4자리를 입력하세요',
  },
  {
    value: 'image_puzzle',
    label: '이미지 퍼즐',
    icon: '🧩',
    description: '이미지를 보고 답을 찾는 문제',
    example: '그림 속 숨겨진 단서를 찾으세요',
  },
  {
    value: 'sequence',
    label: '순서 맞추기',
    icon: '🔢',
    description: '항목들을 올바른 순서로 배열하는 문제',
    example: '다음 사건을 시간 순서대로 배열하세요',
  },
  {
    value: 'drag_drop',
    label: '드래그 앤 드롭',
    icon: '🎯',
    description: '항목을 드래그하여 올바른 위치에 배치',
    example: '각 동물을 서식지에 맞게 배치하세요',
  },
  {
    value: 'hotspot',
    label: '핫스팟',
    icon: '📍',
    description: '이미지에서 특정 영역을 클릭하는 문제',
    example: '지도에서 서울의 위치를 클릭하세요',
  },
  {
    value: 'story_choice',
    label: '스토리 선택',
    icon: '📖',
    description: '스토리 진행에 따라 선택지를 고르는 문제',
    example: '다음 중 어떤 행동을 하시겠습니까?',
  },
  {
    value: 'mini_game',
    label: '미니 컨텐츠',
    icon: '🎮',
    description: '간단한 컨텐츠 형태의 문제',
    example: '카드 뒤집기, 숨은그림찾기 등',
  },
];

export default function QuestionEditPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const questionId = params.questionId as string;
  const isNew = questionId === 'new';

  // URL에서 sceneId 파라미터 가져오기
  const [sceneId, setSceneId] = useState<string | null>(null);

  const [step, setStep] = useState<'select-type' | 'edit-question'>(isNew ? 'select-type' : 'edit-question');
  const [selectedType, setSelectedType] = useState<string>('');

  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    type: '',
    content: {},
    answer: {},
    hint: '',
    points: 10,
    order_index: 0,
  });

  // 객관식 선택지 관리
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(0);

  // 다답형 선택지 관리
  const [multipleAnswerOptions, setMultipleAnswerOptions] = useState<string[]>(['', '', '', '']);
  const [correctAnswerIndices, setCorrectAnswerIndices] = useState<number[]>([]);

  // OX 문제 관리
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // URL에서 sceneId 파라미터 가져오기
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sceneIdParam = urlParams.get('sceneId');
      if (sceneIdParam) {
        setSceneId(sceneIdParam);
      }
    }

    // Check if user is creator
    const userData = localStorage.getItem('user');
    if (!userData) {
      setError('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'creator') {
      setError('컨텐츠 제작자만 접근할 수 있습니다');
      router.push('/');
      return;
    }

    if (!isNew) {
      fetchQuestion();
    }
  }, [questionId, isNew, router]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${questionId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const data = await response.json();
      const q = data.question;

      // 객관식인 경우 선택지와 정답 처리
      if (q.type === 'multiple_choice' && q.content?.options) {
        setMultipleChoiceOptions(q.content.options);
        setCorrectAnswerIndex(q.answer?.correctIndex || 0);
      }

      // 다답형인 경우 선택지와 정답 처리
      if (q.type === 'multiple_answer' && q.content?.options) {
        setMultipleAnswerOptions(q.content.options);
        setCorrectAnswerIndices(q.answer?.correctIndices || []);
      }

      // OX 문제인 경우 정답 처리
      if (q.type === 'true_false') {
        setTrueFalseAnswer(q.answer?.value === true || q.answer?.value === 'true');
      }

      setFormData({
        title: q.title,
        type: q.type,
        description: q.description || '',
        content: typeof q.content === 'object' && q.content?.text ? q.content.text : (typeof q.content === 'string' ? q.content : ''),
        answer: typeof q.answer === 'object' && q.answer?.value ? q.answer.value : (typeof q.answer === 'string' ? q.answer : ''),
        hint: q.hint || '',
        points: q.points || 10,
        order_index: q.order_index || 0,
        youtube_id: q.youtube_id || '',
        character_svg_url: q.character_svg_url || '',
      });

      setStep('edit-question');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setFormData({
      ...formData,
      type: type,
    });

    // 객관식 선택 시 기본 선택지 초기화
    if (type === 'multiple_choice') {
      setMultipleChoiceOptions(['', '', '', '']);
      setCorrectAnswerIndex(0);
    }

    // 다답형 선택 시 기본 선택지 초기화
    if (type === 'multiple_answer') {
      setMultipleAnswerOptions(['', '', '', '']);
      setCorrectAnswerIndices([]);
    }

    // OX 문제 선택 시 기본값 초기화
    if (type === 'true_false') {
      setTrueFalseAnswer(true);
    }

    setStep('edit-question');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'points' || name === 'order_index' ? parseInt(value) : value,
    });
  };

  // 객관식 선택지 관리 함수
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...multipleChoiceOptions];
    newOptions[index] = value;
    setMultipleChoiceOptions(newOptions);
  };

  const addOption = () => {
    setMultipleChoiceOptions([...multipleChoiceOptions, '']);
  };

  const removeOption = (index: number) => {
    if (multipleChoiceOptions.length <= 2) {
      alert('최소 2개의 선택지가 필요합니다.');
      return;
    }
    const newOptions = multipleChoiceOptions.filter((_, i) => i !== index);
    setMultipleChoiceOptions(newOptions);

    // 정답 인덱스 조정
    if (correctAnswerIndex >= newOptions.length) {
      setCorrectAnswerIndex(newOptions.length - 1);
    } else if (correctAnswerIndex === index) {
      setCorrectAnswerIndex(0);
    }
  };

  // 다답형 선택지 관리 함수
  const handleMultipleAnswerOptionChange = (index: number, value: string) => {
    const newOptions = [...multipleAnswerOptions];
    newOptions[index] = value;
    setMultipleAnswerOptions(newOptions);
  };

  const addMultipleAnswerOption = () => {
    setMultipleAnswerOptions([...multipleAnswerOptions, '']);
  };

  const removeMultipleAnswerOption = (index: number) => {
    if (multipleAnswerOptions.length <= 2) {
      alert('최소 2개의 선택지가 필요합니다.');
      return;
    }
    const newOptions = multipleAnswerOptions.filter((_, i) => i !== index);
    setMultipleAnswerOptions(newOptions);

    // 정답 인덱스 조정
    setCorrectAnswerIndices(correctAnswerIndices.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const toggleCorrectAnswer = (index: number) => {
    if (correctAnswerIndices.includes(index)) {
      setCorrectAnswerIndices(correctAnswerIndices.filter(i => i !== index));
    } else {
      setCorrectAnswerIndices([...correctAnswerIndices, index]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // 문제 유형별 데이터 처리
      let contentData: any;
      let answerData: any;

      if (formData.type === 'multiple_choice') {
        // 객관식
        contentData = { options: multipleChoiceOptions };
        answerData = { correctIndex: correctAnswerIndex };
      } else if (formData.type === 'multiple_answer') {
        // 다답형
        if (correctAnswerIndices.length === 0) {
          alert('최소 1개 이상의 정답을 선택해주세요.');
          setLoading(false);
          return;
        }
        contentData = { options: multipleAnswerOptions };
        answerData = { correctIndices: correctAnswerIndices };
      } else if (formData.type === 'true_false') {
        // OX 문제
        contentData = { question: formData.content };
        answerData = { value: trueFalseAnswer };
      } else {
        // 기타 유형
        contentData = typeof formData.content === 'string' ? { text: formData.content } : formData.content;
        answerData = typeof formData.answer === 'string' ? { value: formData.answer } : formData.answer;
      }

      const payload = {
        room_id: roomId,
        title: formData.title,
        type: formData.type,
        description: formData.description || null,
        content: contentData,
        answer: answerData,
        hint: formData.hint || null,
        points: formData.points,
        order_index: formData.order_index,
        youtube_id: formData.youtube_id || null,
        character_svg_url: formData.character_svg_url || null,
        scene_id: sceneId || null,
      };

      const url = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/questions`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${questionId}`;

      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save question');
      }

      router.push(`/edit/${roomId}`);
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
          <Link href={`/edit/${roomId}`} className="text-2xl font-bold text-indigo-600">
            ← 컨텐츠 편집으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {isNew ? '새 문제 만들기' : '문제 수정'}
        </h1>

        {/* 화면 연결 정보 표시 */}
        {sceneId && (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
            <span className="text-purple-700 font-semibold">🎬 특정 화면에 연결됨</span>
            <span className="text-purple-600 text-sm">
              이 문제는 선택한 화면에 자동으로 연결됩니다
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Step 1: 문제 유형 선택 */}
        {step === 'select-type' && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">문제 유형을 선택하세요</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeSelect(type.value)}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-200 text-left border-2 border-transparent hover:border-indigo-500"
                >
                  <div className="text-5xl mb-4">{type.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{type.label}</h3>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <p className="text-xs text-gray-500 italic">예: {type.example}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 문제 편집 */}
        {step === 'edit-question' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6 max-w-3xl mx-auto">
            {/* 뒤로가기 버튼 (새 문제일 때만) */}
            {isNew && (
              <button
                type="button"
                onClick={() => setStep('select-type')}
                className="text-indigo-600 hover:text-indigo-800 font-medium mb-4"
              >
                ← 문제 유형 다시 선택
              </button>
            )}

            {/* 선택된 문제 유형 표시 */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">
                  {QUESTION_TYPES.find((t) => t.value === formData.type)?.icon}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-indigo-900">
                    {QUESTION_TYPES.find((t) => t.value === formData.type)?.label}
                  </h3>
                  <p className="text-sm text-indigo-700">
                    {QUESTION_TYPES.find((t) => t.value === formData.type)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* 문제 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                문제 제목 *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="예: 조선시대 왕의 이름은?"
              />
            </div>

            {/* 문제 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                문제 설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="문제에 대한 설명이나 스토리를 입력하세요"
              />
            </div>

            {/* 문제 내용 (유형별로 다른 입력 폼) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문제 내용 *
              </label>

              {/* 객관식 */}
              {formData.type === 'multiple_choice' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-2">선택지를 입력하세요</p>
                  {multipleChoiceOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-gray-700 w-8">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder={`선택지 ${index + 1}`}
                          required
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={correctAnswerIndex === index}
                          onChange={() => setCorrectAnswerIndex(index)}
                          className="w-5 h-5 text-indigo-600"
                          title="정답으로 선택"
                        />
                      </div>
                      {multipleChoiceOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="삭제"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
                  >
                    + 선택지 추가
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 라디오 버튼을 클릭하여 정답을 선택하세요
                  </p>
                </div>
              )}

              {/* 다답형 */}
              {formData.type === 'multiple_answer' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-2">선택지를 입력하세요 (복수 정답 가능)</p>
                  {multipleAnswerOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-gray-700 w-8">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleMultipleAnswerOptionChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder={`선택지 ${index + 1}`}
                          required
                        />
                        <input
                          type="checkbox"
                          checked={correctAnswerIndices.includes(index)}
                          onChange={() => toggleCorrectAnswer(index)}
                          className="w-5 h-5 text-indigo-600"
                          title="정답으로 선택"
                        />
                      </div>
                      {multipleAnswerOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeMultipleAnswerOption(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="삭제"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addMultipleAnswerOption}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
                  >
                    + 선택지 추가
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 체크박스를 클릭하여 정답을 모두 선택하세요 (복수 선택 가능)
                  </p>
                </div>
              )}

              {/* OX 문제 */}
              {formData.type === 'true_false' && (
                <div className="space-y-3">
                  <textarea
                    name="content"
                    value={typeof formData.content === 'string' ? formData.content : ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="OX 문제를 입력하세요&#10;예: 대한민국의 수도는 서울이다"
                    required
                  />
                  <div className="flex gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">정답:</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trueFalseAnswer"
                          checked={trueFalseAnswer === true}
                          onChange={() => setTrueFalseAnswer(true)}
                          className="w-5 h-5 text-green-600"
                        />
                        <span className="text-2xl">⭕ O (참)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="trueFalseAnswer"
                          checked={trueFalseAnswer === false}
                          onChange={() => setTrueFalseAnswer(false)}
                          className="w-5 h-5 text-red-600"
                        />
                        <span className="text-2xl">❌ X (거짓)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 주관식 */}
              {formData.type === 'short_answer' && (
                <div>
                  <textarea
                    name="content"
                    value={typeof formData.content === 'string' ? formData.content : ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="문제 내용을 입력하세요"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    예: 대한민국의 수도는 어디인가요?
                  </p>
                </div>
              )}

              {/* 비밀번호 */}
              {formData.type === 'password' && (
                <div>
                  <textarea
                    name="content"
                    value={typeof formData.content === 'string' ? formData.content : ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="비밀번호를 찾기 위한 힌트나 설명을 입력하세요"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    예: 금고의 비밀번호는 4자리 숫자입니다. 힌트: 1+2+3+4 = ?
                  </p>
                </div>
              )}

              {/* 순서 맞추기 */}
              {formData.type === 'sequence' && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">순서를 맞춰야 할 항목들을 입력하세요 (한 줄에 하나씩)</p>
                  <textarea
                    name="content"
                    value={typeof formData.content === 'string' ? formData.content : ''}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="항목 1&#10;항목 2&#10;항목 3&#10;항목 4"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    예: 조선시대 왕들을 순서대로 나열하세요
                  </p>
                </div>
              )}

              {/* 기타 유형들 */}
              {!['multiple_choice', 'multiple_answer', 'true_false', 'short_answer', 'password', 'sequence'].includes(formData.type) && (
                <div>
                  <textarea
                    name="content"
                    value={typeof formData.content === 'string' ? formData.content : ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="문제 내용을 입력하세요"
                    required
                  />
                </div>
              )}
            </div>

            {/* 정답 (객관식, 다답형, OX 문제 제외) */}
            {!['multiple_choice', 'multiple_answer', 'true_false'].includes(formData.type) && (
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  정답 *
                </label>
                <input
                  id="answer"
                  name="answer"
                  type="text"
                  value={typeof formData.answer === 'string' ? formData.answer : ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder={
                    formData.type === 'password'
                      ? '비밀번호 (숫자 또는 문자)'
                      : '정답을 입력하세요'
                  }
                />
                {formData.type === 'sequence' && (
                  <p className="mt-1 text-xs text-gray-500">
                    올바른 순서를 쉼표로 구분하여 입력하세요. 예: 1,2,3,4
                  </p>
                )}
              </div>
            )}

            {/* 힌트 */}
            <div>
              <label htmlFor="hint" className="block text-sm font-medium text-gray-700 mb-2">
                힌트 (선택사항)
              </label>
              <textarea
                id="hint"
                name="hint"
                value={formData.hint}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="힌트를 입력하세요"
              />
            </div>

            {/* YouTube ID (선택사항) */}
            <div>
              <label htmlFor="youtube_id" className="block text-sm font-medium text-gray-700 mb-2">
                YouTube 비디오 ID (선택사항)
              </label>
              <input
                id="youtube_id"
                name="youtube_id"
                type="text"
                value={formData.youtube_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="예: dQw4w9WgXcQ"
              />
              <p className="mt-1 text-xs text-gray-500">
                YouTube URL에서 v= 뒤의 ID만 입력하세요
              </p>
            </div>

            {/* 캐릭터 이미지 업로드 (선택사항) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                캐릭터 이미지 (선택사항)
              </label>
              {formData.character_svg_url && (
                <div className="mb-2">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL}${formData.character_svg_url}`} 
                    alt="캐릭터 이미지" 
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

                  const formDataUpload = new FormData();
                  formDataUpload.append('character', file);

                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/character`, {
                      method: 'POST',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                      body: formDataUpload,
                    });

                    if (!response.ok) {
                      throw new Error('이미지 업로드 실패');
                    }

                    const data = await response.json();
                    setFormData({
                      ...formData,
                      character_svg_url: data.url,
                    });
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

            {/* 점수 및 순서 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                  점수
                </label>
                <input
                  id="points"
                  name="points"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.points}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                  순서
                </label>
                <input
                  id="order_index"
                  name="order_index"
                  type="number"
                  min="0"
                  value={formData.order_index}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                {loading ? '저장 중...' : isNew ? '문제 생성' : '수정 완료'}
              </button>
              <Link
                href={`/edit/${roomId}`}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 text-center flex items-center"
              >
                취소
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}



'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Room {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  estimated_time: number;
  creator_name: string;
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; similarity: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      // Fetch room details
      const roomResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`);
      const roomData = await roomResponse.json();

      if (!roomResponse.ok) {
        throw new Error(roomData.error || 'Failed to fetch room');
      }

      setRoom(roomData.room);

      // Fetch questions
      const questionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/room/${roomId}`
      );
      const questionsData = await questionsResponse.json();

      if (!questionsResponse.ok) {
        throw new Error(questionsData.error || 'Failed to fetch questions');
      }

      setQuestions(questionsData.questions);
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.title}</h1>
          <p className="text-gray-600">{room.description}</p>
          <div className="mt-4 flex gap-4 text-sm text-gray-500">
            <span>📝 {questions.length}문제</span>
            <span>⏱️ {room.estimated_time}분</span>
            <span>
              진행: {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.title}</h2>

            {currentQuestion.content && (
              <p className="text-gray-700 mb-6 whitespace-pre-wrap">{currentQuestion.content}</p>
            )}

            {currentQuestion.image_url && (
              <img
                src={currentQuestion.image_url}
                alt="Question"
                className="w-full max-h-96 object-contain mb-6 rounded-lg"
              />
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">답변</label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="답을 입력하세요"
                disabled={!!feedback}
              />
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-lg mb-4 ${
                  feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                <p className="font-bold">{feedback.correct ? '정답입니다! 🎉' : '틀렸습니다 😢'}</p>
                <p className="text-sm">유사도: {feedback.similarity}%</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={submitAnswer}
                disabled={!!feedback}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
              >
                제출
              </button>
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                💡 힌트
              </button>
            </div>

            {showHint && currentQuestion.hint && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">{currentQuestion.hint}</p>
              </div>
            )}
          </div>
        )}

        {!sessionId && questions.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={startGame}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 font-bold text-lg"
            >
              컨텐츠 시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


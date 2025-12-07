export default function DebugPage() {
  const checkToken = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    console.log('Token:', token);
    console.log('User:', user);

    alert(`Token: ${token ? '있음' : '없음'}\nUser: ${user ? '있음' : '없음'}`);
  };

  const testAPI = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('토큰이 없습니다. 먼저 로그인해주세요.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/my/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.text();
      console.log('API Response:', response.status, data);
      alert(`Status: ${response.status}\nResponse: ${data}`);
    } catch (error) {
      console.error('API Error:', error);
      alert(`Error: ${error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">디버깅 페이지</h1>

      <div className="space-y-4">
        <button
          onClick={checkToken}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          로컬스토리지 토큰 확인
        </button>

        <button
          onClick={testAPI}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          API 테스트 (/api/rooms/my/rooms)
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">콘솔 로그 확인:</h2>
        <p className="text-sm text-gray-600">
          브라우저 콘솔(F12)에서 로그를 확인해주세요.
        </p>
      </div>
    </div>
  );
}
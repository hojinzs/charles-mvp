import React, { useEffect, useState } from 'react';

export function SchedulerPage() {
  const [intervalSec, setIntervalSec] = useState<number>(60);
  const [queue, setQueue] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    refreshData();
    const timer = setInterval(refreshData, 2000); // Poll queue updates
    return () => clearInterval(timer);
  }, []);

  const refreshData = async () => {
    try {
      const state = await window.electronAPI.getSchedulerState();
      // Only update local state if not editing (basic heuristic, improves UX)
      // Actually for interval display, we might want to sync always unless focused.
      // For now, let's just set it on first load or if we implement a "reset" logic.
      // Simplify: Just sync initial, user changes input manually.
    } catch (err) {
      console.error(err);
    }
    
    // Always fetch queue
    try {
      const q = await window.electronAPI.getSchedulerQueue();
      setQueue(q);
    } catch (err) {
      console.error(err);
    }
  };

  // Separate effect for initial interval load to avoid overriding user input while typing
  useEffect(() => {
    const loadInit = async () => {
      const state = await window.electronAPI.getSchedulerState();
      setIntervalSec(state.interval / 1000);
    };
    loadInit();
  }, []);

  const handleApply = async () => {
    setLoading(true);
    try {
      await window.electronAPI.setSchedulerInterval(intervalSec * 1000);
      alert('스케줄러 시간이 변경되었습니다.');
    } catch (err) {
      console.error(err);
      alert('설정 변경 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">스케줄러 설정 (Configuration)</h2>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
              실행 주기 (초)
            </label>
            <input 
              type="number" 
              min="10"
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg"
            />
          </div>
          <button 
            onClick={handleApply}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm active:scale-95 disabled:opacity-50"
          >
            {loading ? '저장 중...' : '변경 내용 저장'}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-3">
          * 설정은 즉시 반영되며, 스케줄러 타이머가 재시작됩니다.
        </p>
      </div>

      {/* Queue Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            대기열 (Execution Queue)
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            대기 중: {queue.length}개
          </span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-semibold text-gray-600 text-sm w-16">#</th>
              <th className="p-5 font-semibold text-gray-600 text-sm">Keyword</th>
              <th className="p-5 font-semibold text-gray-600 text-sm">Target URL</th>
              <th className="p-5 font-semibold text-gray-600 text-sm">Last Rank</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {queue.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 text-gray-400 font-mono text-sm">{idx + 1}</td>
                <td className="p-5 font-medium text-gray-900">{item.keyword}</td>
                <td className="p-5 text-gray-500 text-sm">{item.url}</td>
                <td className="p-5 text-sm">
                  {item.last_rank ? `${item.last_rank}위` : <span className="text-gray-300">-</span>}
                </td>
              </tr>
            ))}
            {queue.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  모니터링 대기 중인 키워드가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

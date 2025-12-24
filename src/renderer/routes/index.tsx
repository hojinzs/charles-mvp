import React, { useState, useEffect } from 'react';

interface Keyword {
  id: number;
  keyword: string;
  url: string;
  last_rank: number | null;
  last_checked_at: string | null;
  created_at: string;
}

export function MonitoringPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const fetchKeywords = async () => {
    try {
      const data = await window.electronAPI.getKeywords();
      setKeywords(data);
    } catch (err) {
      console.error("Failed to fetch keywords", err);
    }
  };

  useEffect(() => {
    fetchKeywords();
    const interval = setInterval(fetchKeywords, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword || !newUrl) return;
    try {
      await window.electronAPI.addKeyword(newKeyword, newUrl);
      setNewKeyword('');
      setNewUrl('');
      fetchKeywords();
    } catch (err) {
      console.error("Failed to add keyword", err);
    }
  };

  return (
    <>
      {/* Helper Text */}
      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm">
        <p>ℹ️ Scheduler runs every 1 minute. Add a keyword below and wait for the "Rank" and "Last Check" to update.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Keyword</label>
          <input 
            type="text" 
            placeholder="e.g. 꽃배달" 
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Display URL / Title Match</label>
          <input 
            type="text" 
            placeholder="e.g. 99flower" 
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm active:scale-95 transform">
            Monitor
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 font-semibold text-gray-600 text-sm">Keyword</th>
              <th className="p-5 font-semibold text-gray-600 text-sm">Target URL</th>
              <th className="p-5 font-semibold text-gray-600 text-sm">Current Rank</th>
              <th className="p-5 font-semibold text-gray-600 text-sm">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {keywords.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-medium text-gray-900">{k.keyword}</td>
                <td className="p-5 text-gray-500">{k.url}</td>
                <td className="p-5">
                  {k.last_rank ? (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${k.last_rank <= 5 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {k.last_rank}위
                    </span>
                  ) : k.last_checked_at ? (
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-500">
                      순위 없음
                    </span>
                  ) : (
                    <span className="text-gray-300 text-sm">• 대기중</span>
                  )}
                </td>
                <td className="p-5 text-sm text-gray-400">
                  {k.last_checked_at ? new Date(k.last_checked_at).toLocaleTimeString() : '-'}
                </td>
              </tr>
            ))}
            {keywords.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  No keywords are being monitored.
                  <br/>Add one to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

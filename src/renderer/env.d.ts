export {};

declare global {
  interface Keyword {
    id: number;
    keyword: string;
    url: string;
    last_rank: number | null;
    last_checked_at: string | null;
    created_at: string;
  }

  interface JoinedRanking {
    id: number;
    rank: number;
    checked_at: string;
    keyword: string;
    url: string;
  }

  interface Window {
    electronAPI: {
      addKeyword: (keyword: string, url: string) => Promise<void>;
      addKeywordsBulk: (items: {keyword: string, url: string}[]) => Promise<void>;
      deleteKeywords: (ids: number[]) => Promise<void>;
      getKeywords: () => Promise<Keyword[]>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getRankings: (id: number) => Promise<any>;
      getAllHistory: () => Promise<JoinedRanking[]>;
      setSchedulerInterval: (ms: number) => Promise<void>;
      getSchedulerState: () => Promise<{ interval: number; isRunning: boolean }>;
      getSchedulerQueue: () => Promise<Keyword[]>;
    };
  }
}

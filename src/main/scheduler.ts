import { dbOps, Keyword } from './db';
import { checkRanking } from './services/crawler-service';

class Scheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private currentIndex = 0;
  private keywords: Keyword[] = [];
  private currentIntervalMs: number = 60000;

  constructor() {
    this.refreshKeywords();
  }

  // Reload keywords from DB to ensure we have the latest list
  // In a real app, might separate "active" vs "paused" keywords
  refreshKeywords() {
    this.keywords = dbOps.getKeywords();
    // If currentIndex is out of bounds after refresh, reset it
    if (this.currentIndex >= this.keywords.length) {
      this.currentIndex = 0;
    }
  }

  start(intervalMs?: number) {
    if (this.isRunning) return;
    
    const interval = intervalMs || this.currentIntervalMs;
    this.currentIntervalMs = interval;

    this.isRunning = true;
    console.log(`[Scheduler] Started. Interval: ${this.currentIntervalMs}ms`);

    // Run immediately first? Or wait? 
    // Usually wait for interval, but user might want immediate action. 
    // Let's wait for interval to avoid spamming on startup if not needed.
    this.processNext(); // Actually, let's run one immediately or short delay.

    this.intervalId = setInterval(() => {
      this.processNext();
    }, this.currentIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[Scheduler] Stopped.');
  }

  private async processNext() {
    // Refresh list occasionally or on every tick? 
    // For simplicity, let's fetch fresh list if empty, 
    // or we can rely on `refreshKeywords` being called when ITEM is ADDED.
    // Let's just re-fetch to be safe and simple for POC.
    this.keywords = dbOps.getKeywords();

    if (this.keywords.length === 0) {
      console.log('[Scheduler] No keywords to monitor.');
      return;
    }

    if (this.currentIndex >= this.keywords.length) {
      this.currentIndex = 0;
    }

    const target = this.keywords[this.currentIndex];
    console.log(`[Scheduler] Processing [${this.currentIndex + 1}/${this.keywords.length}]: ${target.keyword} (${target.url})`);

    try {
      // Crawl
      const rank = await checkRanking(target.keyword, target.url);
      
      // Update DB
      // Store null if not found (rank is null from crawler)
      dbOps.addRanking(target.id, rank);
      console.log(`[Scheduler] Updated: ${target.keyword} -> Rank ${rank}`);

    } catch (err) {
      console.error(`[Scheduler] Failed to process ${target.keyword}:`, err);
    }

    // Move to next
    this.currentIndex = (this.currentIndex + 1) % this.keywords.length;
  }

  setInterval(ms: number) {
    if (ms < 1000) {
      console.warn('[Scheduler] Interval too short, setting to 1000ms');
      ms = 1000;
    }
    this.currentIntervalMs = ms;
    console.log(`[Scheduler] Interval updated to ${ms}ms`);
    
    if (this.isRunning) {
      this.stop();
      this.start(this.currentIntervalMs);
    }
  }

  getInterval() {
    return this.currentIntervalMs;
  }

  getStatus() {
    return this.isRunning;
  }

  getQueue() {
    if (this.keywords.length === 0) return [];
    // Return keywords rotated so currentIndex is first
    const part1 = this.keywords.slice(this.currentIndex);
    const part2 = this.keywords.slice(0, this.currentIndex);
    return [...part1, ...part2];
  }
}

export const scheduler = new Scheduler();

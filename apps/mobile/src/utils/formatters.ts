export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatRank(rank: number): string {
  const s = String(rank);
  const last = rank % 10;
  const tenth = Math.floor(rank / 10) % 10;
  if (tenth === 1) return `${s}th`;
  if (last === 1) return `${s}st`;
  if (last === 2) return `${s}nd`;
  if (last === 3) return `${s}rd`;
  return `${s}th`;
}

export function formatScore(score: number, max: number): string {
  return `${score}/${max} (${Math.round((score / max) * 100)}%)`;
}

export function gradeFromPercentage(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'D';
}

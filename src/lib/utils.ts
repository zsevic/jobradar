export function getHoursAgo(isoDate: string): number {
  const now = Date.now();
  const posted = new Date(isoDate).getTime();
  return Math.max(0, Math.floor((now - posted) / (1000 * 60 * 60)));
}

export function formatPostedAgo(isoDate: string): string {
  const hours = getHoursAgo(isoDate);
  if (hours < 1) {
    return "posted just now";
  }
  if (hours === 1) {
    return "posted 1 hour ago";
  }
  return `posted ${hours} hours ago`;
}

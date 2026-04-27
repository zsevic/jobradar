const MS_HOUR = 1000 * 60 * 60;
const MS_DAY = MS_HOUR * 24;

export function getHoursAgo(isoDate: string): number {
  const now = Date.now();
  const posted = new Date(isoDate).getTime();
  return Math.max(0, Math.floor((now - posted) / MS_HOUR));
}

export function formatPostedAgo(isoDate: string): string {
  const posted = new Date(isoDate).getTime();
  const msAgo = Math.max(0, Date.now() - posted);

  const hours = Math.floor(msAgo / MS_HOUR);
  const days = Math.floor(msAgo / MS_DAY);

  if (hours < 1) {
    return "posted just now";
  }
  if (hours <= 23) {
    return hours === 1
      ? "posted 1 hour ago"
      : `posted ${hours} hours ago`;
  }
  if (days < 30) {
    return days === 1
      ? "posted 1 day ago"
      : `posted ${days} days ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    const m = Math.max(1, months);
    return m === 1
      ? "posted 1 month ago"
      : `posted ${m} months ago`;
  }

  const years = Math.floor(days / 365);
  return years === 1
    ? "posted 1 year ago"
    : `posted ${years} years ago`;
}

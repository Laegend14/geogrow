
export function error(title: string, options?: { description: string }) {
  console.error(`[ERROR] ${title}: ${options?.description || ''}`);
  alert(`${title}\n${options?.description || ''}`);
}

export function userRejected(message: string) {
  console.warn(`[REJECTED] ${message}`);
  // Usually we don't alert on rejection to avoid annoyance, but user's code suggests it
}

export function formatText(text: string): string {
  return atob(text).split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ "doof".charCodeAt(i % 4))
  ).join('');
}
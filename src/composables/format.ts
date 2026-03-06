export function formatText(text: string): string {
  if (text == undefined) return ''
  return atob(text).split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ "doof".charCodeAt(i % 4))
  ).join('');
}
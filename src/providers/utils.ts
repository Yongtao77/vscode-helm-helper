/**
 * 获取该位置周围的word
 * 从最后一个单词到下一个单词直接的内容
 */
export function getWordAt(str: string, pos: number): string {
  const left = str.slice(0, pos + 1).search(/\S+$/);
  return str.slice(left, pos + 1);
}
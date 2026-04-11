/**
 * Lightweight classname utility.
 * Replaces `cn` from @mintlify/components to avoid pulling in
 * the entire package (Shiki, mermaid, etc.) on the client.
 */
type ClassValue = string | undefined | null | false | 0;

export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(' ');
}

// src/utils/blog.util.ts

const looksLikeHtml = (text: string): boolean =>
  /<[a-zA-Z][^>]*>/.test(text.trimStart().slice(0, 100));

/**
 * Strip markdown and HTML from text for plain-text previews.
 */
export const stripMarkdown = (text: string): string => {
  if (!text) return '';
  // If content is HTML (from Quill), just strip the tags
  if (looksLikeHtml(text)) {
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  // Normalize inline markdown block markers onto their own lines first
  const normalized = text
    .replace(/\s*(#{1,6} )/g, '\n$1')
    .replace(/\s+(- (?=[^\s]))/g, '\n$1');
  return normalized
    .replace(/^#{1,6} /gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^[-*+] /gm, '')
    .replace(/^> /gm, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Convert markdown string to safe HTML for use with dangerouslySetInnerHTML.
 * Handles both newline-separated and single-line content (## / - embedded inline).
 */
export const renderPreview = (md: string): string => {
  if (!md) return '<p class="text-gray-400 italic">Nội dung bài viết...</p>';
  // If content is HTML (from Quill WYSIWYG editor), return as-is
  if (looksLikeHtml(md)) return md;

  // Normalize: insert newlines before block-level markers when they appear mid-line
  const normalized = md
    .replace(/([^\n])\s+(#{2,3} )/g, '$1\n$2')   // ## / ### headers
    .replace(/([^\n])\s+(- (?=\S))/g, '$1\n$2'); // list items (- followed by non-space)

  const lines = normalized.split('\n');
  const parts: string[] = [];
  let inList = false;
  let paraLines: string[] = [];

  const inline = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');

  const flushPara = () => {
    if (!paraLines.length) return;
    const content = paraLines.join('<br/>').trim();
    if (content) parts.push(`<p class="mb-5 text-gray-700 leading-7">${content}</p>`);
    paraLines = [];
  };

  const closeList = () => {
    if (inList) { parts.push('</ul>'); inList = false; }
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushPara(); closeList();
    } else if (/^## (.+)$/.test(line)) {
      flushPara(); closeList();
      parts.push(`<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">${inline(line.slice(3))}</h2>`);
    } else if (/^### (.+)$/.test(line)) {
      flushPara(); closeList();
      parts.push(`<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">${inline(line.slice(4))}</h3>`);
    } else if (/^> (.+)$/.test(line)) {
      flushPara(); closeList();
      parts.push(`<blockquote class="border-l-4 border-orange-400 pl-4 italic text-gray-600 my-4 bg-orange-50 py-2 rounded-r-lg">${inline(line.slice(2))}</blockquote>`);
    } else if (/^- (.+)$/.test(line)) {
      flushPara();
      if (!inList) {
        parts.push('<ul class="my-4 space-y-1.5 list-disc pl-5 text-gray-700">');
        inList = true;
      }
      parts.push(`<li class="leading-relaxed">${inline(line.slice(2))}</li>`);
    } else {
      closeList();
      paraLines.push(inline(line));
    }
  }

  flushPara(); closeList();

  return parts.length
    ? parts.join('\n')
    : '<p class="text-gray-400 italic">Nội dung bài viết...</p>';
};

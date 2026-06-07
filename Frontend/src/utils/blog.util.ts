// src/utils/blog.util.ts

export const renderPreview = (md: string): string => {
  if (!md) return '<p class="text-gray-400 italic">Nội dung bài viết...</p>';
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mt-6 mb-2">$1</h3>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-orange-400 pl-4 italic text-gray-600 my-4 bg-orange-50 py-2 rounded-r-lg">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-gray-700">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-7">')
    .replace(/\n/g, '<br/>')
    .replace(/^(.)/m, '<p class="mb-4 text-gray-700 leading-7">$1')
    + '</p>';
};

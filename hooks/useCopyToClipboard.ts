import { useState } from 'react';

export const useCopyToClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      // 2秒后重置状态
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    }
  };

  return {
    isCopied,
    copyToClipboard
  };
}; 
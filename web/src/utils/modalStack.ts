import { useState, useEffect } from "react";

/**
 * Global z-index counter cho modal stack.
 * Bắt đầu từ 100, mỗi modal mở sau sẽ tự động được cấp z-index cao hơn modal mở trước (+10),
 * đảm bảo modal mở sau luôn nằm trên cùng (đè lên cả backdrop và nội dung của modal trước).
 */
let currentTopZIndex = 100;

export const getNextModalZIndex = (): number => {
  currentTopZIndex += 10;
  return currentTopZIndex;
};

export const useModalZIndex = (isOpen: boolean, baseZIndex = 100): number => {
  const [zIndex, setZIndex] = useState(baseZIndex);

  useEffect(() => {
    if (isOpen) {
      currentTopZIndex = Math.max(currentTopZIndex + 10, baseZIndex + 10);
      setZIndex(currentTopZIndex);
    }
  }, [isOpen, baseZIndex]);

  return zIndex;
};

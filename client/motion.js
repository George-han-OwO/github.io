export const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), Math.max(min, max));
export function visibleRect(rect, width, height, header = 90) {
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > header + 30 &&
    rect.top < height - 50 &&
    rect.right > 0 &&
    rect.left < width
  );
}
export function safePosition(x, y, width, height, size) {
  return {
    x: clamp(x, size * 0.4, width - size * 0.4),
    y: clamp(
      y,
      Math.min(size + 82, Math.max(0, height - 16)),
      Math.max(0, height - 16),
    ),
  };
}
export const ease = (value) =>
  value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;

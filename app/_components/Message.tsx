'use client';

interface MessageProps {
  message: string;
  isSuccess?: boolean;
  currentTheme?: [string, string];
}

export default function Message({ message, isSuccess = false, currentTheme }: MessageProps) {
  const textColor = isSuccess 
    ? (currentTheme ? currentTheme[1] : 'green') 
    : 'var(--accent)';

  return (
    <div 
      id="message"
      style={{ color: textColor }}
    >
      {message}
    </div>
  );
} 
/** 예외/주의 사항을 표시하는 amber 테마 카드 */

interface ExceptionCardProps {
  text: string;
}

export function ExceptionCard({ text }: ExceptionCardProps) {
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{
        backgroundColor: 'rgba(245,158,11,0.08)',
        borderLeft: '3px solid rgb(245,158,11)',
      }}
    >
      <p className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>
        <span className="mr-1.5">⚠</span>
        {text}
      </p>
    </div>
  );
}

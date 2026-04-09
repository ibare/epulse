import { useStateColors } from '../../hooks/useStateColors';

interface IntensityDotsProps {
  intensity: number; // -3 ~ +3
}

export function IntensityDots({ intensity }: IntensityDotsProps) {
  const stateColors = useStateColors();
  const absIntensity = Math.abs(intensity);
  const color = intensity > 0
    ? stateColors.positive
    : intensity < 0
      ? stateColors.negative
      : stateColors.neutral;

  return (
    <span className="inline-flex gap-0.5" aria-label={`강도 ${intensity}`}>
      {[1, 2, 3].map((level) => (
        <span
          key={level}
          className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
          style={{
            backgroundColor: level <= absIntensity ? color : 'rgba(100,116,139,0.2)',
            boxShadow: level <= absIntensity ? `0 0 4px ${color}` : 'none',
          }}
        />
      ))}
    </span>
  );
}

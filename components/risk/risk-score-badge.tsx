// ============================================
// RISK SCORE BADGE COMPONENT
// ============================================

import { Badge } from '@/components/ui/badge';
import { getRiskLevel, getRiskColor, type RiskLevel } from '@/lib/types/risk';

interface RiskScoreBadgeProps {
  score: number;
  showScore?: boolean;
  className?: string;
}

export function RiskScoreBadge({ score, showScore = true, className }: RiskScoreBadgeProps) {
  const level = getRiskLevel(score);
  const color = getRiskColor(level);

  const variants: Record<RiskLevel, any> = {
    low: 'secondary',
    medium: 'warning',
    high: 'destructive',
    critical: 'destructive',
  };

  const labels: Record<RiskLevel, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
    critical: 'Critical Risk',
  };

  return (
    <Badge variant={variants[level]} className={className}>
      {labels[level]}
      {showScore && ` (${score})`}
    </Badge>
  );
}

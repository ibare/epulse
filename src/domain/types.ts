export type Region = 'KR' | 'US' | 'GL';
export type VariableType = 'input' | 'derived';
export type Layer = 'cause' | 'transmission' | 'market';
export type Lag = 'immediate' | 'short' | 'medium';
export type Direction = 'positive' | 'negative';

export interface EconomicVariable {
  id: string;
  label: string;
  region: Region;
  type: VariableType;
  layer: Layer;
  baseline: number;
  description?: string;
}

export interface CausalRule {
  id: string;
  source: string;
  target: string;
  weight: number;
  direction: Direction;
  lag: Lag;
  explanation: string;
  exceptions?: ConditionalException[];
}

export interface ConditionalException {
  conditions: ExceptionCondition[];
  text: string;
}

export interface ExceptionCondition {
  variable: string;
  operator: 'gt' | 'lt';
  threshold: number;
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  changes: Record<string, number>;
}

export interface NodeState {
  variableId: string;
  value: number;
  delta: number;
  displayState: string;
  intensity: number; // -3 ~ +3
}

export interface EdgeState {
  ruleId: string;
  active: boolean;
  strength: number; // 0~1
  direction: Direction;
}

export interface TimelineItem {
  variableId: string;
  label: string;
  region: Region;
  delta: number;
  displayState: string;
  explanation: string;
  exceptions: string[];
}

export interface RealismWarning {
  id: string;
  severity: 'warning' | 'critical';
  message: string;
  variables: [string, string];
}

export interface SimulationResult {
  nodeStates: Record<string, NodeState>;
  edgeStates: Record<string, EdgeState>;
  timeline: {
    immediate: TimelineItem[];
    short: TimelineItem[];
    medium: TimelineItem[];
  };
  exceptions: Array<{ ruleId: string; text: string }>;
  warnings: RealismWarning[];
  summary: string;
}

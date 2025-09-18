// Export all chart components
export * from './ResponsiveChart';

// Export types
export type { ChartDataPoint } from './ResponsiveChart';

// Re-export recharts components for convenience
export {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  BarChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Default export for easier imports
import ResponsiveChart, { UsersActiveChart } from './ResponsiveChart';

export default {
  ResponsiveChart,
  UsersActiveChart,
};

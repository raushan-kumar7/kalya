/**
 * Kalya Mobile Charts Library (`@kalya/mobile`)
 *
 * High-craft financial visualization components powered by `react-native-gifted-charts`
 * and styled according to the Kalya Sovereign Design System.
 */

// Custom Styled Financial Charts
export * from './donut-chart';
export * from './bar-chart';
export * from './line-chart';

// Re-export core GiftedCharts primitives and components for advanced usage
export {
  PieChart,
  PieChartPro,
  BarChart,
  LineChart,
  LineChartBicolor,
  RadarChart,
  PopulationPyramid,
} from 'react-native-gifted-charts';

// Re-export core GiftedCharts types
export type {
  pieDataItem,
  barDataItem,
  lineDataItem,
  stackDataItem,
  PieChartPropsType,
  BarChartPropsType,
  LineChartPropsType,
  StackedBarChartPropsType,
  LineChartBicolorPropsType,
} from 'react-native-gifted-charts';

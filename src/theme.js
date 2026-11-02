import { useEffect, useState } from 'react';

// Recharts draws SVG attributes, which cannot use CSS variables, so the chart colours are read
// from the tokens in index.css and re-read when the system switches between light and dark.
const readColors = () => {
  const style = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const v = (name, fallback) => (style && style.getPropertyValue(name).trim()) || fallback;
  return {
    series1: v('--series-1', '#2a78d6'),
    series2: v('--series-2', '#eb6834'),
    grid: v('--grid', '#e1e0d9'),
    axis: v('--axis', '#c3c2b7'),
    axisText: v('--axis-text', '#898781'),
    surface: v('--surface', '#ffffff'),
  };
};

export function useChartColors() {
  const [colors, setColors] = useState(readColors);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setColors(readColors());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return colors;
}

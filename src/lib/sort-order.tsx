import type { ReactNode } from "react";

const DoubleChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9L8 5L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 13L8 9L12 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUp = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EqualBars = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 10H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoubleChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3L8 7L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 7L8 11L12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface SortOrderOption {
  value: string;
  label: string;
  icon: ReactNode;
  color: string;
}

export const SORT_ORDER_OPTIONS: SortOrderOption[] = [
  { value: "1", label: "Highest", icon: <DoubleChevronUp />, color: "text-red-500" },
  { value: "2", label: "High", icon: <ChevronUp />, color: "text-orange-500" },
  { value: "3", label: "Medium", icon: <EqualBars />, color: "text-yellow-600" },
  { value: "4", label: "Low", icon: <ChevronDown />, color: "text-blue-500" },
  { value: "5", label: "Lowest", icon: <DoubleChevronDown />, color: "text-blue-400" },
];

export const getSortOrderOption = (value: number): SortOrderOption =>
  SORT_ORDER_OPTIONS.find((o) => o.value === String(value)) ?? SORT_ORDER_OPTIONS[2];

import { OvertimeFilters } from "../types";

export const operators = {
  Equal: (a: number, b: number) => a === b,
  Greater: (a: number, b: number) => a > b,
  Less: (a: number, b: number) => a < b,
};

export function applyOvertimeFilters<
  T extends { totalHours: number; totalOvertimeDays: number },
>(data: T[], filters: OvertimeFilters) {
  const { hours, days } = filters;
  const hoursActive = hours.value !== "";
  const daysActive = days.value !== "";

  if (!hoursActive && !daysActive) return data;
  return data.filter((item) => {
    const hoursMatch = operators[hours.condition as keyof typeof operators](
      item.totalHours,
      parseFloat(hours.value),
    );
    const daysMatch = operators[days.condition as keyof typeof operators](
      item.totalOvertimeDays,
      parseFloat(days.value),
    );

    if (hoursActive && daysActive) return hoursMatch && daysMatch;
    return hoursActive ? hoursMatch : daysMatch;
  });
}

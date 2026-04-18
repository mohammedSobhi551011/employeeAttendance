import z from "zod";

export interface ITableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
}

export interface Employee {
  id: string;
  name: string | null;
  jobNumber: string | null;
  transportation: string | null;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: string | null;
  jobNumber: string | null;
  note: string | null;
  hoursLate: number | null;
  overtimeHours: number | null;
  _rowNumber?: number;
}

export interface AttendanceFilter {
  employee_id: string | null;
  from_date: string | null;
  to_date: string | null;
  status: string | null;
}

export type OvertimeRecord = [string, string, number]; // [employeeId, name, totalOvertimeHours]

export const AttendanceStatuses = [
  "Present",
  "Absent",
  "Late",
  "Leave",
  "Morning",
  "Night",
  "Errand",
  "Overtime",
] as const;

export type TAttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Leave"
  | "Morning"
  | "Night"
  | "Errand"
  | "Overtime";

export type InferSchema<T extends (...args: any) => any> = z.infer<
  ReturnType<T>
>;

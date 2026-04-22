import { invoke } from "@tauri-apps/api/core";
import type {
  Employee,
  AttendanceRecord,
  AttendanceFilter,
  OvertimeRecord,
} from "../types";

// Employees
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    return invoke("get_employees", {});
  } catch (error) {
    console.error("Error getting employees:", error);
    return [];
  }
};

export const addEmployee = async (
  employee: Omit<Employee, "id">,
): Promise<Employee> => {
  const newEmployee: Employee = { id: Date.now().toString(), ...employee };
  try {
    return invoke("add_employee", {
      emp: newEmployee,
    });
  } catch (e) {
    console.error("Tauri add_employee error:", e);
    return newEmployee;
  }
};

export const updateEmployee = async (
  id: string,
  updatedData: Partial<Employee>,
): Promise<Employee | null> => {
  try {
    return invoke("update_employee", {
      id,
      updated: { ...updatedData, id },
    });
  } catch (e) {
    console.error("Tauri update_employee error:", e);
    return null;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await invoke("delete_employee", { id });
    return;
  } catch (e) {
    console.error("Tauri delete_employee error:", e);
    return;
  }
};

export const getEmployeeById = async (
  id: string,
): Promise<Employee | undefined> => {
  const employees = await getEmployees();
  return employees.find((emp) => emp.id === id);
};

export const importEmployees = async (data: string) => {
  try {
    await invoke("import_employees", { data });
  } catch (error) {
    console.log("Failed to import employees", error);
  }
};

export const exportEmployees = async () => {
  try {
    return invoke("get_employees", {}) as Promise<Employee[]>;
  } catch (error) {
    console.log("Failed to export employees", error);
    return [];
  }
};

// Attendance
export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  try {
    return invoke("get_attendance", {});
  } catch (e) {
    console.error("Tauri get_attendance error:", e);
    return [];
  }
};

export const addAttendanceRecord = async (
  record: Omit<AttendanceRecord, "id">,
): Promise<AttendanceRecord> => {
  const newRecord: AttendanceRecord = { id: Date.now().toString(), ...record };
  try {
    return invoke("add_attendance", {
      rec: newRecord,
    });
  } catch (e) {
    console.error("Tauri add_attendance error:", e);
    return newRecord;
  }
};

export const addMultipleAttendanceRecords = async (
  records: Omit<AttendanceRecord, "id">[],
): Promise<AttendanceRecord[]> => {
  const added: AttendanceRecord[] = [];
  for (const r of records) {
    const rec: AttendanceRecord = {
      id: Date.now().toString() + Math.random(),
      ...r,
    };
    try {
      const res = (await invoke("add_attendance", {
        rec,
      })) as AttendanceRecord;
      added.push(res);
    } catch (e) {
      console.error("Tauri add_attendance error:", e);
      added.push(rec);
    }
  }
  return added;
};

export const updateAttendanceRecord = async (
  id: string,
  updatedData: Partial<AttendanceRecord>,
): Promise<AttendanceRecord | null> => {
  try {
    const updated = { id, ...updatedData };
    return invoke("update_attendance", {
      id,
      updated,
    });
  } catch (e) {
    console.error("Tauri update_attendance error:", e);
    return null;
  }
};

export const deleteAttendanceRecord = async (id: string): Promise<void> => {
  try {
    await invoke("delete_attendance", { id });
    return;
  } catch (e) {
    console.error("Tauri delete_attendance error:", e);
    return;
  }
};

export const deleteAttendanceRecordsByEmployeeId = async (
  employeeId: string,
): Promise<void> => {
  try {
    await invoke("delete_attendance_by_employee_id", {
      employeeId: employeeId,
    });
    return;
  } catch (e) {
    console.error("Tauri delete_attendance error:", e);
    return;
  }
};

export const getAttendanceFiltered = async (
  filters: AttendanceFilter,
): Promise<AttendanceRecord[]> => {
  try {
    return invoke("get_attendance_filtered", { filters });
  } catch (e) {
    console.error("Tauri get_attendance_filtered error:", e);
    return [];
  }
};

export const getOvertimeByDateRange = async (
  fromDate: string,
  toDate: string,
): Promise<OvertimeRecord[]> => {
  try {
    return invoke("get_overtime_by_date_range", {
      fromDate,
      toDate,
    });
  } catch (e) {
    console.error("Tauri get_overtime_by_date_range error:", e);
    return [];
  }
};

export const importAttendanceRecords = async (data: string) => {
  try {
    await invoke("import_attendance_records", { data });
  } catch (error) {
    console.log("Failed to import records", error);
  }
};

export const exportAttendanceRecords = async () => {
  try {
    return invoke("get_attendance", {}) as Promise<AttendanceRecord[]>;
  } catch (error) {
    console.log("Failed to export records", error);
    return [];
  }
};

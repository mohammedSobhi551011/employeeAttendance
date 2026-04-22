import { createContext, useContext, useEffect, useState } from "react";
import { Employee } from "../types";
import {
  getEmployees,
  addEmployee as addEmployeeStorage,
  updateEmployee as updateEmployeeStorage,
  deleteEmployee as deleteEmployeeStorage,
  deleteAttendanceRecordsByEmployeeId,
} from "../utils/storage";
import { useLoadingBackground } from "../components/ui/LoadingBackground";

interface IEmployeesContext {
  employees: Employee[];
  loadEmployees: () => Promise<void>;
  addEmployee: (employee: Omit<Employee, "id">) => Promise<Employee>;
  updateEmployee: (
    id: string,
    updatedData: Partial<Employee>,
  ) => Promise<Employee | null>;
  deleteEmployee: (id: string) => Promise<void>;
  searchEmployees: (query: string) => Employee[];
}

const EmployeesContext = createContext<IEmployeesContext | null>(null);

export default function EmployeesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setIsLoading } = useLoadingBackground();

  const [employees, setEmployees] = useState<Employee[]>([]);

  const loadEmployees = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getEmployees();
      setEmployees(data || []);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.error("Failed to load employees:", e);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) loadEmployees();
    return () => {
      mounted = false;
    };
  }, []);

  const addEmployee = async (employee: Omit<Employee, "id">) => {
    setIsLoading(true);
    const newEmployee = await addEmployeeStorage(employee);
    setEmployees((prev) => [...prev, newEmployee]);
    setIsLoading(false);
    return newEmployee;
  };

  const updateEmployee = async (id: string, updatedData: Partial<Employee>) => {
    setIsLoading(true);
    const updated = await updateEmployeeStorage(id, updatedData);
    if (updated) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? updated : emp)),
      );
    }
    setIsLoading(false);
    return updated;
  };

  const deleteEmployee = async (id: string) => {
    setIsLoading(true);
    await deleteEmployeeStorage(id);
    await deleteAttendanceRecordsByEmployeeId(id);
    setIsLoading(false);
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
  };

  const searchEmployees = (query: string): Employee[] => {
    return employees.filter((emp) =>
      (emp.name || "").toLowerCase().includes(query.toLowerCase()),
    );
  };

  return (
    <EmployeesContext
      value={{
        employees,
        loadEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        searchEmployees,
      }}
    >
      {children}
    </EmployeesContext>
  );
}

export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error("useEmployees must be used within EmployeesProvider");
  }
  return context;
};

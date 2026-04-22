import { createContext, ReactNode, useContext } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  OvertimeReportFilterData,
  OvertimeRequestFormData,
} from "../utils/forms-schemas";
import { useEmployees } from "./Employees";

interface IOvertimeContext {
  requestForm: UseFormReturn<OvertimeRequestFormData>;
  reportFilterForm: UseFormReturn<OvertimeReportFilterData>;
}

const OvertimeContext = createContext<IOvertimeContext | null>(null);

export default function OvertimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { employees } = useEmployees();
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const requestForm = useForm<OvertimeRequestFormData>({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      employees: employees.map((e) => ({
        ...e,
        selected: false,
        from: "",
        to: "",
      })),
      fromTime: "00:00",
      toTime: "00:00",
    },
  });

  const reportFilterForm = useForm<OvertimeReportFilterData>({
    defaultValues: {
      fromDate: getTodayDate(),
      toDate: getTodayDate(),
      overtimeDays: {
        condition: "Equal",
        number: "",
      },
      overtimeHours: {
        condition: "Equal",
        number: "",
      },
    },
  });

  return (
    <OvertimeContext value={{ requestForm, reportFilterForm }}>
      {children}
    </OvertimeContext>
  );
}

export const useOvertime = () => {
  const ctx = useContext(OvertimeContext);
  if (!ctx)
    throw new Error("useOvertime should be used inside OvertimeProvider");
  return ctx;
};

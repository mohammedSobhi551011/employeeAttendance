import { useState, useEffect, useMemo } from "react";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { useAttendance } from "../hooks/useAttendance";
import { Button } from "../components/ui/Button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AttendanceFormData,
  AttendanceFormSchema,
} from "../utils/forms-schemas";
import {
  AttendanceRecord,
  AttendanceStatuses,
  TAttendanceStatus,
} from "../types";
import { getAttendanceFiltered } from "../utils/storage";
import { Input } from "../components/ui/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployees } from "../contexts/Employees";
import { motion } from "framer-motion";
import useZodSchema from "../hooks/useZodSchema";

export const Attendance = () => {
  const now = new Date();
  const { employees } = useEmployees();
  const defaultEmployeesData = useMemo(
    () =>
      employees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        jobNumber: emp.jobNumber,
        status: "Present" as TAttendanceStatus,
        hoursLate: "",
        overtimeHours: "",
        selected: false,
      })),
    [employees],
  );

  const schema = useZodSchema(AttendanceFormSchema);

  const form = useForm<AttendanceFormData>({
    defaultValues: {
      date: now.toISOString().split("T")[0],
      status: "Present",
      overtimeHours: "",
      employeesData: [...defaultEmployeesData],
    },
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();

  const { addMultipleRecords } = useAttendance();
  const [todayAttendanceEmployees, setTodayAttendanceEmployees] = useState<
    string[]
  >([]);

  const { t } = useTranslation();

  const watchedStatus = form.watch("status");
  const watchedEmployeesData = form.watch("employeesData");
  const watchedDate = form.watch("date");
  const watchedOvertimeHours = form.watch("overtimeHours");

  const eligibleEmployees = employees.filter(
    (emp) => !todayAttendanceEmployees.includes(emp.id.toString()),
  );

  useEffect(() => {
    form.setValue("employeesData", defaultEmployeesData);
  }, [defaultEmployeesData]);

  // Set all selected employees' status
  useEffect(() => {
    form.setValue(
      "employeesData",
      watchedEmployeesData.map((data) => ({
        ...data,
        status: watchedStatus,
        overtimeHours:
          watchedStatus === "Absent" || watchedStatus === "Leave"
            ? ""
            : data.overtimeHours,
      })),
    );
    form.clearErrors("employeesData");
    if (watchedStatus === "Absent" || watchedStatus === "Leave")
      form.setValue("overtimeHours", "");
  }, [watchedStatus]);

  useEffect(() => {
    getAttendanceFiltered({
      from_date: watchedDate,
      to_date: watchedDate,
      employee_id: null,
      status: null,
    }).then((records) =>
      setTodayAttendanceEmployees(records.map((record) => record.employeeId)),
    );
  }, [watchedDate]);

  useEffect(() => {
    form.setValue(
      "employeesData",
      watchedEmployeesData.map((data) => ({
        ...data,
        overtimeHours: watchedOvertimeHours,
      })),
    );
  }, [watchedOvertimeHours]);

  const prepareRecords = ({
    employeesData,
    date,
  }: Pick<AttendanceFormData, "employeesData" | "date">) => {
    let hasError = false;
    const records: AttendanceRecord[] = [];
    for (let index = 0; index < employeesData.length; index++) {
      const emp = employeesData[index];
      if (!emp.selected) continue;
      const record: AttendanceRecord = {
        employeeId: emp.id,
        date,
        status: emp.status.toString(),
        hoursLate: emp.hoursLate ? Number(emp.hoursLate) : null,
        overtimeHours: emp.overtimeHours ? Number(emp.overtimeHours) : null,
        id: (Date.now() + Math.random()).toString(), // simple unique ID generation
        jobNumber: null,
        note: null,
      };

      if (emp.status === "Late") {
        if (emp.hoursLate.length === 0) {
          form.setError(`employeesData.${index}.hoursLate`, {
            message: t("attendance.hoursLateRequired"),
          });
          hasError = true;
        }

        record.hoursLate = parseFloat(emp.hoursLate);
      }

      if (emp.status === "Overtime") {
        if (emp.overtimeHours.length === 0) {
          form.setError(`employeesData.${index}.overtimeHours`, {
            message: t("attendance.overtimeHoursRequired"),
          });
          hasError = true;
        }

        record.overtimeHours = parseFloat(emp.overtimeHours);
      }
      records.push(record);
    }

    return { hasError, records };
  };

  const onSubmit = async (data: AttendanceFormData) => {
    const selectedEmployees = data.employeesData.filter(
      (data) => data.selected,
    );
    if (selectedEmployees.length === 0) {
      toast.error(
        t
          ? t("attendance.selectEmployeesWarning")
          : "Please select at least one employee",
      );
      return;
    }

    const { records, hasError } = prepareRecords({
      date: data.date,
      employeesData: data.employeesData,
    });

    try {
      if (!hasError) {
        await addMultipleRecords(records);
        toast.success(
          t
            ? t("attendance.markedSuccess", {
                count: selectedEmployees.length,
              })
            : `Attendance marked for ${selectedEmployees.length} employee(s)`,
        );
        form.reset();
        navigate("/");
      }
    } catch (error) {
      toast.error(
        t ? t("attendance.errorMarking") : "Error marking attendance",
      );
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:py-8 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t ? t("attendance.title") : "Mark Attendance"}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {t
              ? t("attendance.description")
              : "Select employees and mark their attendance status"}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t ? t("attendance.date") : "Date"} *
                </label>
                <Controller
                  name="date"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t ? t("attendance.status") : "Status (Set All)"} *
                </label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <select
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value as TAttendanceStatus;
                        field.onChange(value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    >
                      {AttendanceStatuses.map((status) => (
                        <option key={status} value={status}>
                          {t ? t(`statuses.${status}`) : status}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              {watchedStatus !== "Absent" &&
                watchedStatus !== "Leave" &&
                watchedEmployeesData.length > 0 && (
                  <div>
                    <Controller
                      control={form.control}
                      name="overtimeHours"
                      render={({ field, fieldState }) => (
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          step="0.5"
                          {...field}
                          placeholder={
                            t
                              ? t("attendance.enterOvertimeHours")
                              : "Overtime hours"
                          }
                          label={t("attendance.overtimeHours")}
                          error={fieldState.error?.message}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    />
                  </div>
                )}
            </div>

            {/* Employee Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t
                    ? t("attendance.selectEmployeesLabel", {
                        count: watchedEmployeesData.filter(
                          (data) => data.selected,
                        ).length,
                      })
                    : `Select Employees * (${watchedEmployeesData.filter((data) => data.selected).length} selected)`}
                </label>
              </div>
              {/* Select All Checkbox  */}
              <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 justify-start">
                <Input
                  type="checkbox"
                  label={t ? t("attendance.selectAll") : "Select All"}
                  checked={
                    eligibleEmployees.length ===
                    watchedEmployeesData.filter((data) => data.selected).length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      form.setValue(
                        "employeesData",
                        watchedEmployeesData.map((data) => {
                          if (
                            eligibleEmployees.some((emp) => emp.id === data.id)
                          ) {
                            return { ...data, selected: true };
                          }
                          return { ...data, selected: false };
                        }),
                      );
                    } else {
                      form.setValue(
                        "employeesData",
                        watchedEmployeesData.map((data) => ({
                          ...data,
                          selected: false,
                        })),
                      );
                    }
                  }}
                  id="select-all-employees"
                />
              </div>

              {/* Employee List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {watchedEmployeesData.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {t
                      ? t("home.noEmployees")
                      : "No employees found. Please add employees first."}
                  </p>
                ) : (
                  watchedEmployeesData.map((data, index) => {
                    const hasAttendanceToday =
                      todayAttendanceEmployees.includes(data.id.toString());
                    return (
                      <EmployeesSelectionItem
                        key={index + "-employee-selection"}
                        form={form}
                        hasAttendanceToday={hasAttendanceToday}
                        index={index}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full text-base py-3 md:py-2"
            >
              {t ? t("attendance.submit") : "Mark Attendance"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface IEmployeesSelectionItemProps {
  hasAttendanceToday: boolean;
  index: number;
  form: UseFormReturn<AttendanceFormData>;
}

const EmployeesSelectionItem = ({
  hasAttendanceToday,
  form,
  index,
}: IEmployeesSelectionItemProps) => {
  const { t } = useTranslation();
  const employeeData = form.watch(`employeesData.${index}`);
  return (
    <Controller
      control={form.control}
      name={`employeesData.${index}.selected`}
      render={({ field: selectedField }) => (
        <motion.div
          whileTap={!hasAttendanceToday ? { scale: 0.95 } : {}}
          onClick={() => {
            if (!hasAttendanceToday)
              selectedField.onChange(!selectedField.value);
          }}
          className={` border rounded-lg p-3 transition-colors  cursor-pointer ${
            selectedField.value
              ? "bg-blue-50 border-blue-300"
              : hasAttendanceToday
                ? "bg-gray-50 border-gray-300"
                : "bg-white border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className="flex gap-3 mb-3">
            <Input
              type="checkbox"
              checked={selectedField.value || hasAttendanceToday}
              onChange={(e) => selectedField.onChange(!e.currentTarget.checked)}
              disabled={hasAttendanceToday}
              className="border-4 border-black"
              id={employeeData.id}
            />
            <label
              htmlFor={employeeData.id}
              className={`text-sm md:text-base font-medium select-none ${
                hasAttendanceToday
                  ? "opacity-50 text-gray-600"
                  : "text-gray-900"
              }`}
            >
              {employeeData.name}
            </label>
            {hasAttendanceToday && (
              <span className="text-xs text-gray-500 ml-auto">
                {t ? t("attendance.alreadyMarked") : "Already marked"}
              </span>
            )}
          </div>

          {selectedField.value && (
            <div className="grid grid-cols-1 gap-3 ml-8">
              <Controller
                control={form.control}
                name={`employeesData.${index}.status`}
                render={({ field: statusField }) => (
                  <select
                    value={statusField.value}
                    onChange={(e) => {
                      const value = e.target.value as TAttendanceStatus;
                      statusField.onChange(value);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {AttendanceStatuses.map((status) => (
                      <option key={status} value={status}>
                        {t ? t(`statuses.${status}`) : status}
                      </option>
                    ))}
                  </select>
                )}
              />

              {employeeData.status === "Late" && (
                <Controller
                  control={form.control}
                  name={`employeesData.${index}.hoursLate`}
                  render={({ field: hoursLateField, fieldState }) => (
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      {...hoursLateField}
                      error={fieldState.error?.message}
                      placeholder={t ? t("home.enterHoursLate") : "Hours late"}
                      label={t("attendance.hoursLate")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                />
              )}

              {employeeData.status !== "Absent" &&
                employeeData.status !== "Leave" && (
                  <Controller
                    control={form.control}
                    name={`employeesData.${index}.overtimeHours`}
                    render={({ field: overtimeHoursField, fieldState }) => (
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        label={t("attendance.overtimeHours")}
                        {...overtimeHoursField}
                        placeholder={
                          t
                            ? t("attendance.enterOvertimeHours")
                            : "Overtime hours"
                        }
                        error={fieldState.error?.message}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  />
                )}
            </div>
          )}
        </motion.div>
      )}
    />
  );
};

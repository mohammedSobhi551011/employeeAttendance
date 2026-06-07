import { useEffect, useMemo } from "react";
import { useOvertime } from "../../contexts/Overtime";
import { Controller } from "react-hook-form";
import { Input } from "../ui/Input";
import { useTranslation } from "react-i18next";
import { TimePickerInput } from "../ui/TimePickerInput";
import { Employee } from "../../types";
import { motion } from "framer-motion";

function OvertimeRequestForm() {
  const { t } = useTranslation();
  const { requestForm: form } = useOvertime();
  const watchedFromTime = form.watch("fromTime");
  const watchedToTime = form.watch("toTime");
  const watchedEmployees = form.watch("employees");
  const watchedEmployeesSearchTerm = form.watch("employeesSearchTerm");

  const filteredEmployees = useMemo(() => {
    if (watchedEmployeesSearchTerm.trim().length === 0) {
      return watchedEmployees;
    }
    const term = watchedEmployeesSearchTerm.toLowerCase();
    return watchedEmployees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.jobNumber?.toLowerCase().includes(term),
    );
  }, [watchedEmployees, watchedEmployeesSearchTerm]);

  useEffect(() => {
    form.setValue(
      "employees",
      watchedEmployees.map((emp) => ({
        ...emp,
        from: watchedFromTime,
        to: watchedToTime,
      })),
    );
  }, [watchedFromTime, watchedToTime]);

  return (
    <div className="bg-white p-4 rounded-lg drop-shadow-lg">
      <div className="flex gap-14 items-start">
        <Controller
          control={form.control}
          name="date"
          render={({ field, fieldState }) => (
            <Input
              type="date"
              {...field}
              error={fieldState.error?.message}
              label={t("overtime.request.date")}
            />
          )}
        />
        <Controller
          control={form.control}
          name="fromTime"
          render={({ field, fieldState }) => (
            <TimePickerInput
              value={field.value}
              onChange={field.onChange}
              label={t("overtime.request.fromTime")}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="toTime"
          render={({ field, fieldState }) => (
            <TimePickerInput
              value={field.value}
              onChange={field.onChange}
              label={t("overtime.request.toTime")}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      {/* Separator */}
      <div className="w-full h-[0.5px] bg-stone-300 my-5" />

      {/* Employees Selection */}
      <div className="flex flex-col gap-4">
        <span>
          {t("overtime.request.selectEmployeesLabel", {
            count: watchedEmployees.filter((emp) => emp.selected).length,
          })}
        </span>
        {/* Select-all checkbox */}
        <div className="px-4 py-2 bg-stone-100 shadow rounded-lg hover:bg-stone-200 transition-colors">
          <Input
            label={t("overtime.request.selectAll")}
            type="checkbox"
            id="select-all"
            checked={
              filteredEmployees.length > 0 &&
              filteredEmployees.every((emp) => emp.selected)
            }
            onChange={(e) => {
              const isChecked = e.currentTarget.checked;
              const filteredIds = new Set(filteredEmployees.map((emp) => emp.id));
              form.setValue(
                "employees",
                watchedEmployees.map((emp) => {
                  if (filteredIds.has(emp.id)) {
                    return { ...emp, selected: isChecked };
                  }
                  return emp;
                }),
              );
            }}
          />
        </div>

        {/* Search Input */}
        <div className="mb-2">
          <Controller
            control={form.control}
            name="employeesSearchTerm"
            render={({ field }) => (
              <Input
                type="text"
                placeholder={t("general.search-placeholder")}
                {...field}
              />
            )}
          />
        </div>

        <div className="flex flex-wrap p-2   gap-3 max-h-[40vh] overflow-y-scroll shadow-xl bg-slate-100 rounded-lg">
          {filteredEmployees.length === 0 ? (
            <p className="text-gray-500 text-center py-4 w-full">
              {t("home.noEmployees")}
            </p>
          ) : (
            filteredEmployees.map((emp) => {
              const fullIndex = watchedEmployees.findIndex(
                (we) => we.id === emp.id,
              );
              return (
                <EmployeesSelectionItem
                  key={emp.id + "-request-form-employee"}
                  index={fullIndex}
                  employeeData={emp}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

interface IEmployeesSelectionItemProps {
  employeeData: Employee & {
    selected: boolean;
    from?: string | undefined;
    to?: string | undefined;
  };
  index: number;
}

const EmployeesSelectionItem = ({
  employeeData: emp,
  index,
}: IEmployeesSelectionItemProps) => {
  const { t } = useTranslation();
  const { requestForm: form } = useOvertime();
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={`gap-2 p-4 border rounded-xl ${emp.selected ? "bg-blue-100 hover:bg-blue-200 border-blue-300" : "border-stone-400 hover:bg-stone-200 bg-stone-100"} transition-colors hover:cursor-pointer`}
      id="item-container"
      onClick={(e) => {
        if (e.currentTarget.id === "item-container") {
          form.setValue(`employees.${index}.selected`, !emp.selected);
        }
      }}
    >
      {/* Checkbox */}
      <div className="flex items-center gap-2">
        <Controller
          control={form.control}
          name={`employees.${index}.selected`}
          render={({ field }) => (
            <Input
              type="checkbox"
              onChange={field.onChange}
              checked={field.value}
              className="w-4 h-4"
            />
          )}
        />
        <label className={`text-sm md:text-base font-medium select-none `}>
          {emp.name}
        </label>
      </div>

      <div className="flex items-center gap-6 mt-4">
        {/* From Time */}
        <Controller
          control={form.control}
          name={`employees.${index}.from`}
          render={({ field }) => (
            <TimePickerInput
              {...field}
              label={t("overtime.request.fromTime")}
            />
          )}
        />

        {/* To Time */}
        <Controller
          control={form.control}
          name={`employees.${index}.to`}
          render={({ field }) => (
            <TimePickerInput {...field} label={t("overtime.request.toTime")} />
          )}
        />
      </div>
    </motion.div>
  );
};

export default OvertimeRequestForm;

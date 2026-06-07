import { useTranslation } from "react-i18next";
import { Input } from "../components/ui/Input";
import { Controller, useForm } from "react-hook-form";
import { MealsFormData } from "../utils/forms-schemas";
import { useEmployees } from "../contexts/Employees";
import { Employee } from "../types";
import { motion } from "framer-motion";
import MealsPreview from "../components/MealsPreview";
import { useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { usePrintShortcut } from "../hooks/usePrintShortcut";
import { Printer } from "lucide-react";
import { Button } from "../components/ui/button";
import toast from "react-hot-toast";

function Meals() {
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const { t } = useTranslation();
  const { employees } = useEmployees();

  const form = useForm<MealsFormData>({
    defaultValues: {
      date: getTodayDate(),
      employeesSearchTerm: "",
      employees: [],
    },
  });
  const watchedEmployees = form.watch("employees");
  const watchedDate = form.watch("date");
  const watchedEmployeesSearchTerm = form.watch("employeesSearchTerm");

  const filteredEmployees = useMemo(() => {
    if (watchedEmployeesSearchTerm.trim().length === 0) {
      return employees;
    }
    const term = watchedEmployeesSearchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(term) ||
        emp.jobNumber?.toLowerCase().includes(term),
    );
  }, [employees, watchedEmployeesSearchTerm]);

  const previewRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: previewRef,
    documentTitle: "meals_list",
    onBeforePrint: async () => {
      if (watchedEmployees.length === 0) {
        toast.error(t("meals.selectEmployeesWarning"));
        throw new Error(t("meals.selectEmployeesWarning"));
      }
    },
  });

  usePrintShortcut({
    onPrint: () => {
      handlePrint();
    },
  });

  const handleEmployeeToggle = (employeeId: string) => {
    const exists = watchedEmployees.find((emp) => emp.id === employeeId);

    if (exists) {
      form.setValue(
        "employees",
        watchedEmployees.filter((emp) => emp.id !== employeeId),
      );
    } else {
      const employee = employees.find((emp) => emp.id === employeeId);
      if (employee)
        form.setValue("employees", [
          ...watchedEmployees,
          {
            id: employee.id,
            jobNumber: employee.jobNumber,
            name: employee.name,
          },
        ]);
    }
  };

  return (
    <div className="py-6 px-4 md:py-8 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {t("meals.title")}
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          {t("meals.subtitle")}
        </p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="mb-4">
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Input type="date" {...field} label={t("home.date")} />
            )}
          />
        </div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            {t
              ? t("attendance.selectEmployeesLabel", {
                  count: watchedEmployees.length,
                })
              : `Select Employees * (${watchedEmployees.length} selected)`}
          </label>
        </div>
        {/* Select-all */}
        <div className="mb-4 flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 justify-start">
          <Input
            type="checkbox"
            label={t ? t("attendance.selectAll") : "Select All"}
            checked={
              filteredEmployees.length > 0 &&
              filteredEmployees.every((fe) =>
                watchedEmployees.some((we) => we.id === fe.id),
              )
            }
            onChange={(e) => {
              if (e.target.checked) {
                const newEmployees = [...watchedEmployees];
                filteredEmployees.forEach((fe) => {
                  if (!newEmployees.some((we) => we.id === fe.id)) {
                    newEmployees.push({
                      id: fe.id,
                      name: fe.name,
                      jobNumber: fe.jobNumber,
                    });
                  }
                });
                form.setValue("employees", newEmployees);
              } else {
                const filteredIds = new Set(filteredEmployees.map((fe) => fe.id));
                form.setValue(
                  "employees",
                  watchedEmployees.filter((we) => !filteredIds.has(we.id)),
                );
              }
            }}
            id="select-all-employees"
          />
        </div>

        {/* Search Input */}
        <div className="mb-4">
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

        {/* Employee List */}
        <div className="gap-3 max-h-96 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-gray-100 p-4 rounded-lg border border-gray-200">
          {filteredEmployees.length === 0 ? (
            <p className="text-gray-500 text-center py-4 col-span-full">
              {t
                ? t("home.noEmployees")
                : "No employees found. Please add employees first."}
            </p>
          ) : (
            filteredEmployees.map((employee) => {
              const selected = watchedEmployees.some(
                (emp) => emp.id === employee.id,
              );
              return (
                <EmployeesSelectionItem
                  key={employee.id + "-employee-selection"}
                  employee={employee}
                  handleEmployeeToggle={handleEmployeeToggle}
                  selected={selected}
                />
              );
            })
          )}
        </div>
      </div>
      {/* Separator */}
      <div className="w-full h-px bg-stone-300 my-5" />
      {/* Preview */}
      <div className="mx-auto">
        <div className="flex items-center gap-x-2 px-4 sm:px-6 lg:px-8 mb-5">
          <Button size="sm" onClick={handlePrint}>
            <Printer size={20} />
          </Button>
          <span>({t("general.print-hint")})</span>
        </div>
        <MealsPreview
          date={watchedDate}
          employees={watchedEmployees}
          ref={previewRef}
        />
      </div>
    </div>
  );
}

export default Meals;

interface IEmployeesSelectionItemProps {
  selected: boolean;
  employee: Employee;
  handleEmployeeToggle: (id: string) => void;
}

const EmployeesSelectionItem = ({
  selected,
  employee,
  handleEmployeeToggle,
}: IEmployeesSelectionItemProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        handleEmployeeToggle(employee.id);
      }}
      className={` border rounded-lg p-3 transition-colors  cursor-pointer ${
        selected
          ? "bg-blue-50 border-blue-300"
          : "bg-white border-gray-200 hover:border-blue-300"
      }`}
    >
      <div className="flex gap-3 mb-3">
        <Input
          type="checkbox"
          checked={selected}
          onChange={() => handleEmployeeToggle(employee.id)}
          className="border-4 border-black"
        />
        <label
          onClick={() => handleEmployeeToggle(employee.id)}
          className={`text-sm md:text-base font-medium select-none text-gray-900`}
        >
          {employee.name}
        </label>
      </div>
    </motion.div>
  );
};

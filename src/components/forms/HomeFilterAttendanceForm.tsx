import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import { Input } from "../ui/Input";
import { AttendanceStatuses } from "../../types";
import { useAttendanceFilter } from "../../contexts/AttendanceFilter";
import { useEmployees } from "../../contexts/Employees";
import { Button } from "../ui/button";
import { useMemo, useState } from "react";

interface IHomeFilterAttendanceFormProps {
  handleClearFilters: () => void;
}

function HomeFilterAttendanceForm({
  handleClearFilters,
}: IHomeFilterAttendanceFormProps) {
  const { t } = useTranslation();

  const { employees } = useEmployees();
  const { form, totalRecords } = useAttendanceFilter();
  const [searchTerm, setSearchTerm] = useState("");
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        emp.name?.toLowerCase().includes(searchLower) ||
        emp.jobNumber?.toLowerCase().includes(searchLower) ||
        emp.transportation?.toLowerCase().includes(searchLower) ||
        emp.position?.toLowerCase().includes(searchLower) ||
        emp.phone?.toLowerCase().includes(searchLower) ||
        emp.stamp?.toLowerCase().includes(searchLower)
      );
    });
  }, [employees, searchTerm]);

  return (
    <form className="bg-white rounded-lg shadow-md mb-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
        {/* <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="employees-filter"
          >
            {t ? t("home.filterByEmployee") : "Filter by Employee"}
          </label>
          <Controller
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <select
                id="employees-filter"
                value={field.value || ""}
                onChange={field.onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              >
                <option value="">
                  {t ? t("home.allEmployees") : "All Employees"}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div> */}
        <div className="">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="mb-6 w-full">
              <Input
                type="text"
                placeholder={t("employees.searchPlaceholder")}
                value={searchTerm}
                label="بيانات الموظف"
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:max-w-md flex flex-col"
              />
            </div>
            <div className="w-full">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="employees-filter"
              >
                {t ? t("home.filterByEmployee") : "Filter by Employee"}
              </label>
              <Controller
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <select
                    id="employees-filter"
                    value={field.value || ""}
                    onChange={field.onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  >
                    <option value="">
                      {t ? t("home.allEmployees") : "All Employees"}
                    </option>
                    {filteredEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
            <div className="w-full">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="status-filter"
              >
                {t ? t("home.filterByStatus") : "Filter by Status"}
              </label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <select
                    value={field.value || ""}
                    onChange={field.onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    id="status-filter"
                  >
                    <option value="">
                      {t ? t("home.allStatuses") : "All Statuses"}
                    </option>
                    {AttendanceStatuses.map((status) => (
                      <option key={status} value={status}>
                        {t ? t(`statuses.${status}`) : status}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-4 items-center">
          <div className="w-full">
            <Controller
              control={form.control}
              name="fromDate"
              render={({ field, fieldState }) => (
                <Input
                  type="date"
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  id="from-date"
                  label={t ? t("home.filterFromDate") : "From Date"}
                />
              )}
            />
          </div>
          <div className="w-full">
            <Controller
              control={form.control}
              name="toDate"
              render={({ field, fieldState }) => (
                <Input
                  type="date"
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  label={t ? t("home.filterToDate") : "To Date"}
                  id="to-date"
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <Button
          onClick={handleClearFilters}
          variant="secondary"
          size="sm"
          className="w-full md:w-auto"
        >
          {t ? t("home.clearFilters") : "Clear Filters"}
        </Button>
        <p className="text-sm text-gray-600">
          {t
            ? t("home.found", { count: totalRecords })
            : `Found ${totalRecords} record(s)`}
        </p>
      </div>
    </form>
  );
}
export default HomeFilterAttendanceForm;

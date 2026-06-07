import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getOvertimeByDateRange } from "../utils/storage";
import toast from "react-hot-toast";
import { ComparisonCondition, ITableColumn, OvertimeRecord } from "../types";
import { Table } from "../components/ui/Table";
import { useOvertime } from "../contexts/Overtime";
import { Controller } from "react-hook-form";
import { Input } from "../components/ui/Input";
import { OvertimeReportFilterData } from "../utils/forms-schemas";
import { applyOvertimeFilters } from "../utils/helpers";
import { useEmployees } from "../contexts/Employees";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";
import { Label } from "../components/ui/label";

export const OvertimeReport = () => {
  const { t, i18n } = useTranslation();
  const { reportFilterForm: form } = useOvertime();
  const { employees } = useEmployees();

  const [overtimeData, setOvertimeData] = useState<OvertimeRecord[]>([]);

  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const watchedOvertimeHours = form.watch("overtimeHours");
  const watchedOvertimeDays = form.watch("overtimeDays");
  const watchedSearchTerm = form.watch("searchTerm");
  const watchedEmployeeId = form.watch("employeeId");

  const handleSearch = async (
    data: Pick<OvertimeReportFilterData, "fromDate" | "toDate">,
  ) => {
    const { fromDate, toDate } = data;
    if (!fromDate || !toDate) {
      toast.error(
        t ? t("overtime.report.selectBothDates") : "Please select both dates",
      );
      return;
    }

    if (fromDate > toDate) {
      toast.error(
        t
          ? t("overtime.report.fromDateAfterTo")
          : "From date must be before To date",
      );
      return;
    }

    try {
      const result = await getOvertimeByDateRange(fromDate, toDate);
      setOvertimeData(result);
      if (result.length === 0) {
        toast.success(
          t ? t("overtime.report.noData") : "No overtime records found",
        );
      }
    } catch (error) {
      toast.error(
        t ? t("overtime.report.loadError") : "Error loading overtime data",
      );
      console.error("Error:", error);
    }
  };

  // Load initial overtime data on mount
  useEffect(() => {
    if (fromDate.length > 0 && toDate.length > 0)
      handleSearch({ fromDate, toDate });
  }, [fromDate, toDate]);

  const columns: ITableColumn<{
    id: string;
    _rowNumber: number;
    employeeName: string;
    jobNumber: string;
    totalHours: number;
    totalOvertimeDays: number;
  }>[] = [
    {
      key: "_rowNumber",
      label: i18n.language === "ar" ? "م" : "No.",
    },
    {
      key: "employeeName",
      label: t ? t("overtime.report.employee") : "Employee Name",
    },
    {
      key: "totalHours",
      label: t ? t("overtime.report.totalHours") : "Total Overtime Hours",
    },
    {
      key: "totalOvertimeDays",
      label: t ? t("overtime.report.totalDays") : "Total Days",
    },
  ];

  const formattedOvertimeData = useMemo(() => {
    let data = applyOvertimeFilters(
      overtimeData
        .filter((record) => {
          const matchesEmployee =
            !watchedEmployeeId || record[0] === watchedEmployeeId;
          return record[2] > 0 && matchesEmployee;
        })
        .map((record, idx) => ({
          id: idx + "-overtime", // Add an id for React key
          _rowNumber: idx + 1,
          employeeName: record[1],
          totalHours: record[2],
          totalOvertimeDays: record[3],
          jobNumber: record[4],
        })),
      {
        days: {
          value: watchedOvertimeDays.number,
          condition: watchedOvertimeDays.condition,
        },
        hours: {
          value: watchedOvertimeHours.number,
          condition: watchedOvertimeHours.condition,
        },
      },
    );

    if (watchedSearchTerm.trim().length > 0) {
      const term = watchedSearchTerm.toLowerCase();
      data = data.filter(
        (row) =>
          row.employeeName.toLowerCase().includes(term) ||
          row.jobNumber.toLowerCase().includes(term),
      );
    }

    return data;
  }, [
    overtimeData,
    watchedOvertimeDays.number,
    watchedOvertimeHours.number,
    watchedOvertimeDays.condition,
    watchedOvertimeHours.condition,
    watchedSearchTerm,
    watchedEmployeeId,
  ]);

  const totalOvertime = useMemo(() => {
    return formattedOvertimeData.reduce(
      (sum, record) => sum + (record.totalHours || 0),
      0,
    );
  }, [formattedOvertimeData]);

  return (
    <form className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t ? t("overtime.report.title") : "Overtime Report"}
          </h1>
          <p className="text-gray-600">
            {t
              ? t("overtime.report.subtitle")
              : "View overtime hours for employees within a date range"}
          </p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Controller
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <Input
                    type="date"
                    {...field}
                    label={t("overtime.report.fromDate")}
                    id="from-date"
                  />
                )}
              />
            </div>
            <div>
              <Controller
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <Input
                    type="date"
                    {...field}
                    label={t("overtime.report.toDate")}
                    id="to-date"
                  />
                )}
              />
            </div>
            {/* Employee Selector */}
            <div className="col-span-2">
              <Label htmlFor="employee-select">
                {t("home.filterByEmployee")}
              </Label>
              <Controller
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => field.onChange(val === "all" ? null : val)}
                    value={field.value || "all"}
                  >
                    <SelectTrigger id="employee-select" className="w-full">
                      <SelectValue
                        placeholder={t("home.filterByEmployee")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {i18n.language === "ar" ? "كل الموظفين" : "All Employees"}
                      </SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Controller
                control={form.control}
                name="overtimeHours.number"
                render={({ field }) => (
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={field.value?.toString() || ""}
                      onChange={field.onChange}
                      label={t("overtime.report.overtimeHours")}
                      id="overtime-hours"
                    />
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="overtimeHours.condition"
                render={({ field }) => (
                  <div className="flex flex-col justify-end min-w-[120px]">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "Equal"}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ComparisonCondition.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {t ? t(`conditions.${condition}`) : condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Controller
                control={form.control}
                name="overtimeDays.number"
                render={({ field }) => (
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={field.value?.toString() || ""}
                      onChange={field.onChange}
                      label={t("overtime.report.overtimeDays")}
                      id="overtime-days"
                    />
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="overtimeDays.condition"
                render={({ field }) => (
                  <div className="flex flex-col justify-end min-w-[120px]">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "Equal"}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ComparisonCondition.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {t ? t(`conditions.${condition}`) : condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>
            {/* Search Input */}
            <div className="col-span-2">
              <Controller
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder={t("general.search-placeholder")}
                    {...field}
                    label={t("general.search")}
                  />
                )}
              />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {overtimeData.length > 0 ? (
            <>
              <Table
                columns={columns}
                data={formattedOvertimeData}
                isRTL={i18n.language === "ar"}
              />
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">
                      {t
                        ? t("overtime.report.totalLabel")
                        : "Total Overtime Hours:"}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalOvertime.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600">
                {t
                  ? t("overtime.report.noRecords")
                  : "No overtime records found. Select a date range and search."}
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ArrowDown, ArrowUp, Edit, Trash2 } from "lucide-react";
import { AttendanceRecord, ITableColumn } from "../types";
import UpdateAttendanceRecordForm from "../components/forms/UpdateAttendanceRecordForm";
import DeleteAttendanceRecordForm from "../components/forms/DeleteAttendanceRecordForm";
import HomeFilterAttendanceForm from "../components/forms/HomeFilterAttendanceForm";
import { useAttendanceFilter } from "../contexts/AttendanceFilter";
import { useEmployees } from "../contexts/Employees";
import { useImportExport } from "../hooks/useImportExport";
import toast from "react-hot-toast";
import {
  exportAttendanceRecords,
  importAttendanceRecords,
} from "../utils/storage";

export const Home = () => {
  const { employees } = useEmployees();
  const { t, i18n } = useTranslation();

  const { filteredAttendance, loadFilteredData, currentPage, totalPages } =
    useAttendanceFilter();

  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(
    null,
  );

  const employeesMap = useMemo(() => {
    const map = new Map<string, { jobNumber: string; name: string }>();

    employees.forEach((emp) => {
      if (emp.id && emp.name && emp.jobNumber)
        map.set(emp.id, { jobNumber: emp.jobNumber, name: emp.name });
    });
    return map;
  }, [employees]);

  const columns: ITableColumn<
    AttendanceRecord & { actions: React.ReactNode; employeeName: string | null }
  >[] = [
    {
      key: "_rowNumber",
      label: i18n.language === "ar" ? "م" : "No.",
      render: (rowNumber) => rowNumber,
    },
    {
      key: "employeeId",
      label: t ? t("home.employee") : "Employee Name",
      render: (_, row) =>
        row.employeeName || (t ? t("home.employee") : "Unknown"),
    },
    {
      key: "jobNumber",
      label: t ? t("employees.jobNumberLabel") : "Job Number",
      render: (_, row) => row.jobNumber || "-",
    },
    { key: "date", label: t ? t("home.date") : "Date" },
    {
      key: "status",
      label: t ? t("home.status") : "Status",
      render: (status) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            status === "Present"
              ? "bg-green-100 text-green-800"
              : status === "Absent"
                ? "bg-red-100 text-red-800"
                : status === "Late"
                  ? "bg-red-600 text-red-100"
                  : status === "Errand"
                    ? "text-blue-100 bg-blue-800"
                    : status === "Night"
                      ? "bg-orange-800 text-orange-100"
                      : status === "Morning"
                        ? "bg-orange-400 text-orange-50"
                        : status === "Overtime"
                          ? "bg-emerald-700 text-emerald-100"
                          : "bg-blue-100 text-blue-800"
          }`}
        >
          {t ? t(`statuses.${status}`) : status}
        </span>
      ),
    },

    {
      key: "hoursLate",
      label: t ? t("home.hoursLate") : "Hours Late",
      render: (hoursLate, record) =>
        record.status === "Late" && hoursLate ? `${hoursLate}h` : "-",
    },
    {
      key: "overtimeHours",
      label: t ? t("attendance.overtimeHours") : "Overtime Hours",
      render: (overtimeHours, record) => {
        const OVERTIME_STATUSES = ["Present", "Late", "Errand", "Overtime"];
        return OVERTIME_STATUSES.includes(record.status || "") && overtimeHours
          ? `${overtimeHours}h`
          : "-";
      },
    },
    {
      key: "note",
      label: t ? t("home.note") : "Notes",
      render: (note) =>
        note ? (
          <div className="max-w-xs truncate" title={(note || "").toString()}>
            {note}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      key: "actions",
      label: t ? t("home.actions") : "Actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setEditingRecord(record);
            }}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setDeletingRecord(record);
            }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const { exportData, importData } = useImportExport<{
    attendance: AttendanceRecord[];
  }>({
    keys: ["attendance"],
    onDataExported: async () => {
      toast.success(t("export.success"));
    },
    onDataImported: async (data) => {
      await importAttendanceRecords(data);
      await loadFilteredData(currentPage);
      toast.success(t("import.success"));
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:py-8 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {t ? t("home.title") : "Attendance Records"}
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            {t ? t("home.subtitle") : "View and search attendance records"}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 mb-4">
          <Button
            onClick={async () => {
              const data = await exportAttendanceRecords();
              await exportData({ attendance: data });
            }}
            size="sm"
            variant="ghost"
          >
            <ArrowUp size={20} />
          </Button>
          <Button onClick={importData} size="sm" variant="ghost">
            <ArrowDown size={20} />
          </Button>
        </div>
        {/* Filters Section */}
        <HomeFilterAttendanceForm
          handleClearFilters={() => {}}
          // onChange={onFilterChange}
        />

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
          <Table
            columns={columns}
            data={filteredAttendance.map((record) => ({
              ...record,
              actions: null,
              jobNumber: employeesMap.get(record.employeeId)?.jobNumber || null,
              employeeName: employeesMap.get(record.employeeId)?.name || null,
            }))}
            loading={false}
            isRTL={i18n.language === "ar"}
          />
        </div>

        {/* Pagination Controls */}
        {filteredAttendance.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">
              {t
                ? t("home.pageInfo", {
                    current: currentPage,
                    total: totalPages,
                  })
                : `Page ${currentPage} of ${totalPages}`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadFilteredData(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t ? t("home.previous") : "Previous"}
              </button>
              <button
                onClick={() => loadFilteredData(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {t ? t("home.next") : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingRecord}
        title={t ? t("home.edit") : "Edit Attendance Record"}
        onClose={() => {
          setEditingRecord(null);
        }}
      >
        <UpdateAttendanceRecordForm
          onCancel={() => setEditingRecord(null)}
          onSuccess={async () => {
            await loadFilteredData(currentPage);
            setEditingRecord(null);
          }}
          employeesMap={employeesMap}
          record={editingRecord!}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingRecord}
        title={t ? t("home.deleteConfirmTitle") : "Delete Attendance Record"}
        onClose={() => {
          setDeletingRecord(null);
        }}
      >
        <DeleteAttendanceRecordForm
          deletingRecord={deletingRecord!}
          employeesMap={employeesMap}
          onCancel={() => setDeletingRecord(null)}
          onSuccess={async () => {
            await loadFilteredData(currentPage);
            setDeletingRecord(null);
          }}
        />
      </Modal>
    </div>
  );
};

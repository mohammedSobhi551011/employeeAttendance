import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import toast from "react-hot-toast";
import { useAttendance } from "../hooks/useAttendance";
import { ArrowDown, ArrowUp, Edit, Plus, Trash } from "lucide-react";
import { Employee, ITableColumn } from "../types";
import CreateUpdateEmployeeForm from "../components/forms/CreateUpdateEmployeeForm";
import { useEmployees } from "../contexts/Employees";
import { useImportExport } from "../hooks/useImportExport";
import { exportEmployees, importEmployees } from "../utils/storage";

export const Employees = () => {
  const { employees, deleteEmployee, loadEmployees } = useEmployees();

  const { deleteAttendanceRecordsByEmployeeId } = useAttendance();
  const { t, i18n } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirmEmployee, setDeleteConfirmEmployee] =
    useState<Employee | null>(null);

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    await deleteEmployee(id);
    toast.success(
      t ? t("employees.deleteSuccess") : "Employee deleted successfully",
    );
    await deleteAttendanceRecordsByEmployeeId(id);
    setDeleteConfirmEmployee(null);
  };

  const columns: ITableColumn<
    Employee & { actions: string; _rowNumber: number }
  >[] = [
    {
      key: "_rowNumber",
      label: i18n.language === "ar" ? "م" : "No.",
      render: (_, __, index) => index + 1,
    },
    { key: "name", label: t ? t("employees.nameLabel") : "Employee Name" },
    {
      key: "jobNumber",
      label: t ? t("employees.jobNumberLabel") : "Job Number",
    },
    {
      key: "transportation",
      label: t ? t("employees.transportationLabel") : "Transportation",
    },
    {
      key: "actions",
      label: t ? t("employees.actions") : "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => setEditingEmployee(row)}
            variant="ghost"
            size="sm"
          >
            <Edit size={16} className="text-blue-600" />
          </Button>
          <Button
            onClick={() => setDeleteConfirmEmployee(row)}
            variant="danger"
            size="sm"
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const { exportData, importData } = useImportExport<{ employees: Employee[] }>(
    {
      keys: ["employees"],
      onDataImported: async (data) => {
        await importEmployees(data.employees);
        await loadEmployees();
        toast.success(t("import.success"));
      },
      onDataExported: async () => {
        toast.success(t("export.success"));
      },
    },
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 md:py-8 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {t ? t("employees.title") : "Employees"}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {t ? t("employees.subtitle") : "Manage employees in your system"}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <Button
                onClick={async () => {
                  const data = await exportEmployees();
                  await exportData({ employees: data });
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
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              variant="primary"
              className="w-full md:w-auto flex items-center justify-center gap-2"
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
          <Table
            columns={columns}
            data={employees.map((emp, index) => ({
              ...emp,
              actions: "",
              _rowNumber: index + 1,
            }))}
            loading={false}
            isRTL={i18n.language === "ar"}
          />
        </div>

        {/* Add/Edit Employee Modal */}
        <Modal
          isOpen={isModalOpen || !!editingEmployee}
          title={
            editingEmployee
              ? t
                ? t("employees.editEmployee")
                : "Edit Employee"
              : t
                ? t("employees.addEmployee")
                : "Add Employee"
          }
          onClose={() => {
            setIsModalOpen(false);
            setEditingEmployee(null);
          }}
        >
          <CreateUpdateEmployeeForm
            action={
              editingEmployee
                ? { type: "update", employee: editingEmployee }
                : { type: "create" }
            }
            onCancel={() => {
              setIsModalOpen(false);
              setEditingEmployee(null);
            }}
            onSuccess={() => {
              setIsModalOpen(false);
              setEditingEmployee(null);
            }}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmEmployee !== null}
          title={t ? t("employees.confirmDeleteTitle") : "Confirm Delete"}
          onClose={() => setDeleteConfirmEmployee(null)}
        >
          <p className="text-gray-700">
            {t
              ? t("employees.confirmDeleteMessage")
              : "Are you sure you want to delete this employee? This action cannot be undone."}
          </p>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="success"
              onClick={() => setDeleteConfirmEmployee(null)}
            >
              {t ? t("employees.cancel") : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="danger"
              onClick={() => handleDelete(deleteConfirmEmployee?.id || "")}
            >
              {t("employees.delete")}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

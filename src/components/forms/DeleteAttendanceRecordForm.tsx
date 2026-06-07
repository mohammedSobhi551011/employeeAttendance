import { useTranslation } from "react-i18next";
import { AttendanceRecord } from "../../types";
import { Button } from "../ui/button";
import { useAttendance } from "../../hooks/useAttendance";
import toast from "react-hot-toast";

interface IDeleteAttendanceRecordFormProps {
  deletingRecord: AttendanceRecord;
  employeesMap: Map<string, { jobNumber: string | null; name: string | null }>;
  onCancel: () => void;
  onSuccess: () => void;
}

function DeleteAttendanceRecordForm({
  deletingRecord,
  employeesMap,
  onCancel,
  onSuccess,
}: IDeleteAttendanceRecordFormProps) {
  const { t } = useTranslation();
  const { deleteAttendanceRecord } = useAttendance();

  async function handleDelete() {
    try {
      await deleteAttendanceRecord(deletingRecord.id);
      toast.success(
        t ? t("home.deleteSuccess") : "Attendance record deleted successfully",
      );
      onSuccess();
    } catch (error) {
      toast.error(
        t ? t("home.deleteError") : "Error deleting attendance record",
      );
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-700">
        {t
          ? t("home.deleteConfirmMessage")
          : "Are you sure you want to delete this attendance record?"}
      </p>
      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
        <p className="text-sm">
          <span className="font-medium">
            {t ? t("home.employee") : "Employee"}:
          </span>{" "}
          {employeesMap.get(deletingRecord.employeeId)?.name ||
            (t ? t("home.employee") : "Unknown")}
        </p>
        <p className="text-sm">
          <span className="font-medium">{t ? t("home.date") : "Date"}:</span>{" "}
          {deletingRecord.date}
        </p>
        <p className="text-sm">
          <span className="font-medium">
            {t ? t("home.status") : "Status"}:
          </span>{" "}
          {t ? t(`statuses.${deletingRecord.status}`) : deletingRecord.status}
        </p>
      </div>
      <p className="text-sm text-red-600">
        {t ? t("home.thisCannotUndo") : "This action cannot be undone."}
      </p>
      <div className="flex justify-end space-x-2">
        <Button variant="success" onClick={onCancel}>
          {t ? t("home.cancel") : "Cancel"}
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          {t ? t("home.delete") : "Delete"}
        </Button>
      </div>
    </div>
  );
}

export default DeleteAttendanceRecordForm;

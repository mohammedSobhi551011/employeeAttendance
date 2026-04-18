import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  UpdateAttendanceRecordFormData,
  UpdateAttendanceRecordFormSchema,
} from "../../utils/forms-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/Input";
import {
  AttendanceRecord,
  AttendanceStatuses,
  TAttendanceStatus,
} from "../../types";
import toast from "react-hot-toast";
import { useAttendance } from "../../hooks/useAttendance";
import { Button } from "../ui/Button";
import useZodSchema from "../../hooks/useZodSchema";

interface IUpdateAttendanceRecordProps {
  record: AttendanceRecord;
  employeesMap: Map<string, { jobNumber: string | null; name: string | null }>;
  onCancel: () => void;
  onSuccess: () => void;
}

function UpdateAttendanceRecordForm({
  employeesMap,
  record,
  onCancel,
  onSuccess,
}: IUpdateAttendanceRecordProps) {
  const { t } = useTranslation();
  const schema = useZodSchema(UpdateAttendanceRecordFormSchema);
  const form = useForm<UpdateAttendanceRecordFormData>({
    defaultValues: {
      status: record.status as TAttendanceStatus,
      date: record.date,
      hoursLate: record.hoursLate,
      overtimeHours: record.overtimeHours,
      note: record.note,
    },
    resolver: zodResolver(schema),
  });

  const { updateAttendanceRecord } = useAttendance();

  const watchedStatus = form.watch("status");

  async function onSubmit(data: UpdateAttendanceRecordFormData) {
    try {
      await updateAttendanceRecord(record.id, {
        employeeId: record.employeeId,
        date: data.date,
        status: data.status,
        hoursLate: data.hoursLate ? data.hoursLate : null,
        overtimeHours: data.overtimeHours ? data.overtimeHours : null,
        note: data.note || null,
      });
      toast.success(
        t ? t("home.updateSuccess") : "Record updated successfully",
      );
      onSuccess();
    } catch (error) {
      toast.error(t ? t("home.updateError") : "Failed to update record");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        type="text"
        disabled
        value={employeesMap.get(record.employeeId)?.name || "Unknown"}
        label={t ? t("home.employee") : "Employee"}
        className="bg-gray-100 cursor-not-allowed"
      />
      <Controller
        control={form.control}
        name="date"
        render={({ field, fieldState }) => (
          <Input
            type="date"
            {...field}
            error={fieldState.error?.message}
            label={t ? t("home.date") : "Date"}
          />
        )}
      />
      <Controller
        control={form.control}
        name="status"
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t ? t("home.status") : "Status"}
            </label>
            <select
              {...field}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AttendanceStatuses.map((status) => (
                <option key={status} value={status}>
                  {t ? t(`statuses.${status}`) : status}
                </option>
              ))}
            </select>
          </div>
        )}
      />
      {watchedStatus === "Late" && (
        <Controller
          control={form.control}
          name="hoursLate"
          render={({ field, fieldState }) => (
            <Input
              value={field.value || ""}
              type="number"
              min="0"
              step="0.5"
              onChange={(e) =>
                field.onChange(
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              label={t ? t("home.hoursLate") : "Hours Late"}
              error={fieldState.error?.message}
            />
          )}
        />
      )}
      {watchedStatus !== "Absent" && watchedStatus !== "Leave" && (
        <Controller
          control={form.control}
          name="overtimeHours"
          render={({ field, fieldState }) => (
            <Input
              value={field.value || ""}
              type="number"
              min="0"
              step="0.5"
              onChange={(e) =>
                field.onChange(
                  e.target.value ? parseFloat(e.target.value) : null,
                )
              }
              label={t ? t("attendance.overtimeHours") : "Overtime Hours"}
              error={fieldState.error?.message}
            />
          )}
        />
      )}
      <Controller
        control={form.control}
        name="note"
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t ? t("home.note") : "Notes"}
            </label>
            <textarea
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              rows={3}
              placeholder={t ? t("home.enterNotes") : "Enter notes (optional)"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} type="button">
          {t ? t("home.cancel") : "Cancel"}
        </Button>
        <Button type="submit" variant="primary">
          {t ? t("home.update") : "Update"}
        </Button>
      </div>
    </form>
  );
}

export default UpdateAttendanceRecordForm;

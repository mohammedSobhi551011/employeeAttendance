import { z } from "zod";
import { AttendanceStatuses, InferSchema } from "../types";
import { t, TFunction } from "i18next";

export const AttendanceFormSchema = (t: TFunction) =>
  z.object({
    employeesData: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          jobNumber: z.string().nullable(),
          status: z.enum(AttendanceStatuses, "Status is required"),
          hoursLate: z.string(),
          overtimeHours: z.string(),
          selected: z.boolean(),
        }),
      )
      .min(1, t("attendance.selectEmployeesWarning")),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    status: z.enum(AttendanceStatuses, "Status is required"),
    overtimeHours: z.string(),
  });

export type AttendanceFormData = InferSchema<typeof AttendanceFormSchema>;

export const EmployeeFormSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(3, t("employees.create-form.name-min-error"))
      .max(20, t("employees.create-form.name-max-error")),
    jobNumber: z
      .string()
      .min(1, t("employees.create-form.jobNumber-min-error"))
      .max(6, t("employees.create-form.jobNumber-max-error")),
    transportation: z
      .string()
      .min(1, t("employees.create-form.transportation-min-error"))
      .max(15, t("employees.create-form.transportation-max-error")),
  });

export type EmployeeFormData = InferSchema<typeof EmployeeFormSchema>;

export const LoginFormSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(1, t("login.usernameRequired")),
    password: z.string().min(1, t("login.passwordRequired")),
  });

export type LoginFormData = InferSchema<typeof LoginFormSchema>;

export const UpdateAttendanceRecordFormSchema = (t: TFunction) =>
  z
    .object({
      status: z.enum(AttendanceStatuses, "Status is required"),
      date: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
      }),
      hoursLate: z.number().optional().nullable(),
      overtimeHours: z.number().optional().nullable(),
      note: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      if (data.status === "Late" && !data.hoursLate) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          message: t("attendance.hoursLateRequired"),
          expected: "non-negative number",
          path: ["hoursLate"],
        });
      }
      if (data.status === "Overtime" && !data.overtimeHours) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_type,
          message: t("attendance.overtimeHoursRequired"),
          expected: "non-negative number",
          path: ["overtimeHours"],
        });
      }
    });

export type UpdateAttendanceRecordFormData = InferSchema<
  typeof UpdateAttendanceRecordFormSchema
>;

export const HomeFilterAttendanceFormSchema = (t: TFunction) =>
  z.object({
    employeeId: z.string().nullable(),
    fromDate: z.string().nullable(),
    toDate: z.string().nullable(),
    status: z.enum(AttendanceStatuses).nullable(),
  });

export type HomeFilterAttendanceFormData = InferSchema<
  typeof HomeFilterAttendanceFormSchema
>;

export const OvertimeRequestFormSchema = (t: TFunction) =>
  z.object({
    date: z.string().nonempty("Date must be selected."),
    fromTime: z.string().nonempty(),
    toTime: z.string().nonempty(),
    employees: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          transportation: z.string().nullable(),
          jobNumber: z.string().nullable(),
          selected: z.boolean(),
          from: z
            .string()
            .optional()
            .refine((val) => !val || /^\d{2}:\d{2}$/.test(val), "Invalid time"),
          to: z
            .string()
            .optional()
            .refine((val) => !val || /^\d{2}:\d{2}$/.test(val), "Invalid time"),
        }),
      )
      .min(1, t("overtime.request.selectEmployeesWarning")),
  });

export type OvertimeRequestFormData = InferSchema<
  typeof OvertimeRequestFormSchema
>;

export const OvertimeReportFilterFormSchema = (t: TFunction) =>
  z.object({
    fromDate: z.string(),
    toDate: z.string(),
  });
export type OvertimeReportFilterData = InferSchema<
  typeof OvertimeReportFilterFormSchema
>;

export const MealsFormSchema = (t: TFunction) =>
  z.object({
    date: z.string(),
    employees: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          jobNumber: z.string().nullable(),
        }),
      )
      .min(1, t("meals.selectEmployeesWarning")),
  });
export type MealsFormData = InferSchema<typeof MealsFormSchema>;

import {
  EmployeeFormData,
  EmployeeFormSchema,
} from "../../utils/forms-schemas";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Employee } from "../../types";
import { useEmployees } from "../../contexts/Employees";
import useZodSchema from "../../hooks/useZodSchema";

interface ICreateEmployeeFormProps {
  onCancel: () => void;
  onSuccess: () => void;
  action: { type: "create" } | { type: "update"; employee: Employee };
}

function CreateUpdateEmployeeForm({
  action,
  onCancel,
  onSuccess,
}: ICreateEmployeeFormProps) {
  const { addEmployee, updateEmployee } = useEmployees();
  const { t } = useTranslation();
  const schema = useZodSchema(EmployeeFormSchema);
  const form = useForm<EmployeeFormData>({
    defaultValues:
      action.type === "update"
        ? {
            name: action.employee.name || "",
            jobNumber: action.employee.jobNumber || "",
            transportation: action.employee.transportation || "",
          }
        : {
            name: "",
            jobNumber: "",
            transportation: "",
          },
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (action.type === "create") {
        await addEmployee({
          name: data.name,
          jobNumber: data.jobNumber,
          transportation: data.transportation,
        });
        toast.success(t ? t("employees.added") : "Employee added successfully");
        onSuccess();
      } else {
        const { employee } = action;
        await updateEmployee(employee.id, {
          name: data.name,
          jobNumber: data.jobNumber,
          transportation: data.transportation,
        });
        toast.success(
          t ? t("employees.updated") : "Employee updated successfully",
        );
        onSuccess();
      }
    } catch (error) {
      toast.error(t ? t("employees.errorSaving") : "Error saving employee");
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Input
            label={t ? t("employees.nameLabel") : "Employee Name *"}
            placeholder={t ? t("employees.namePlaceholder") : "e.g., John Doe"}
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="jobNumber"
        render={({ field, fieldState }) => (
          <Input
            label={t ? t("employees.jobNumberLabel") : "Job Number *"}
            placeholder={
              t ? t("employees.jobNumberPlaceholder") : "e.g., EMP001"
            }
            {...field}
            type="number"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={form.control}
        name="transportation"
        render={({ field, fieldState }) => (
          <Input
            label={t ? t("employees.transportationLabel") : "Transportation *"}
            placeholder={
              t ? t("employees.transportationPlaceholder") : "e.g., Bus"
            }
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary">
          {action.type === "create"
            ? t("employees.add")
            : t("employees.update")}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t ? t("employees.cancel") : "Cancel"}
        </Button>
      </div>
    </form>
  );
}

export default CreateUpdateEmployeeForm;

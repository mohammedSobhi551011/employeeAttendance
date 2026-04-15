import { useTranslation } from "react-i18next";
import OvertimeRequestForm from "../components/forms/OvertimeRequestForm";
import { Button } from "../components/ui/Button";
import { Printer } from "lucide-react";
import OvertimeRequestPreview from "../components/OvertimeRequestPerview";
import { usePrintShortcut } from "../hooks/usePrintShortcut";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { useOvertime } from "../contexts/Overtime";
import toast from "react-hot-toast";

export const OvertimeRequest = () => {
  const { t } = useTranslation();

  usePrintShortcut({
    onPrint: () => {
      handlePrint();
    },
  });

  const { requestForm } = useOvertime();

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "attendance-report",
    onBeforePrint: async () => {
      if (
        requestForm.watch("employees").filter((emp) => emp.selected).length ===
        0
      ) {
        toast.error(t("overtime.request.selectEmployeesWarning"));
        throw new Error(t("overtime.request.selectEmployeesWarning"));
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t ? t("overtime.request.title") : "Overtime Report"}
          </h1>
          <p className="text-gray-600">
            {t
              ? t("overtime.request.subtitle")
              : "View overtime hours for employees within a date range"}
          </p>
        </div>
        {/* Request Form */}
        <div className="prin-area">
          <OvertimeRequestForm />
        </div>
        {/* Separator */}
        <div className="w-full h-px bg-stone-300 my-5" />
      </div>

      <div className="flex items-center gap-x-2 px-4 sm:px-6 lg:px-8 mb-5">
        <Button size="sm" onClick={handlePrint}>
          <Printer size={20} />
        </Button>
        <span>({t("general.print-hint")})</span>
      </div>

      {/* PDF-Preview */}

      <OvertimeRequestPreview ref={printRef} />
    </div>
  );
};

import { useTranslation } from "react-i18next";
import { MealsFormData } from "../utils/forms-schemas";
import { forwardRef } from "react";

interface IMealsPreviewProps extends MealsFormData {}

const MealsPreview = forwardRef<HTMLDivElement, IMealsPreviewProps>(
  ({ date, employees }, ref) => {
    const { t } = useTranslation();

    return (
      <div
        className="mx-auto w-[20cm] h-[28cm]  p-12  overtime-request-preview-container font-calibri not-italic"
        ref={ref}
        dir="ltr"
      >
        <div className="flex flex-col items-center mb-4 font-bold text-xl">
          <h1>{t("meals.preview.main-title")}</h1>
          <h1>{date}</h1>
        </div>
        <table className="border border-collapse border-blue-50 w-full text-center">
          <thead>
            <tr className="border-b-4  border-blue-50">
              <th className="bg-blue-500 text-blue-50 px-2 py-1 border border-blue-50">
                No.
              </th>
              <th className="bg-blue-500 text-blue-50 px-2 py-1 border border-blue-50 w-1/2">
                Name
              </th>
              <th className="bg-blue-500 text-blue-50 px-2 py-1 border border-blue-50">
                Personal No.
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, index) => (
              <tr
                key={emp.id}
                className={`${index % 2 === 0 ? "bg-blue-200" : "bg-blue-100"} font-bold`}
              >
                <td className="border border-blue-50">{index + 1}</td>
                <td className="border border-blue-50 text-start ps-4">
                  {emp.name}
                </td>
                <td className="border border-blue-50 ">{emp.jobNumber}</td>
              </tr>
            ))}
            {employees.length < 30 &&
              new Array(30 - employees.length).fill(0).map((_, index) => (
                <tr
                  key={index + "-empty-row"}
                  className={`${index % 2 === 0 ? "bg-blue-200" : "bg-blue-100"}`}
                >
                  <td className="border border-blue-50">&nbsp;</td>
                  <td className="border border-blue-50"></td>
                  <td className="border border-blue-50"></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  },
);

export default MealsPreview;

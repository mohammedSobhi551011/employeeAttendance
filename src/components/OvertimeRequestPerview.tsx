import { forwardRef } from "react";
import { useOvertime } from "../contexts/Overtime";

const OvertimeRequestPreview = forwardRef<HTMLDivElement>((_props, ref) => {
  const { requestForm: form } = useOvertime();
  const selectedEmployees = form
    .watch("employees")
    .filter((emp) => emp.selected);
  const selectedDate = new Date(form.watch("date"));
  return (
    <div
      className="mx-auto w-[21cm] h-[29.7cm]  p-16  overtime-request-preview-container font-calibri not-italic"
      dir="ltr"
      ref={ref}
    >
      {/* Top-Header */}
      <div className="flex justify-start relative ">
        <div className=" absolute left-1/2 -translate-x-1/2 bottom-0">
          <h1 className="font-bold text-xl">OVERTIME REQUEST</h1>
        </div>
        <img width={"100px"} src="/FMC Logo.svg" />
      </div>

      {/* Second-Header */}
      <div className="flex justify-start relative my-8 ">
        <div className=" whitespace-normal wrap-break-word w-25 text-center font-bold text-xs">
          <div className=" p-1 border border-b-0">
            <span>Q.C Department</span>
          </div>
          <div className=" p-1 border ">
            <span>Administrative MGR.</span>
          </div>
        </div>
        <table className=" absolute left-1/2 -translate-x-1/2 top-0 text-xs border-collapse border">
          <tbody>
            <tr className="font-bold">
              <td className="border p-1 pe-8 ">
                <div className="flex items-center justify-start gap-x-2">
                  <span className="w-4 h-4 bg-black" />

                  {selectedDate.toLocaleDateString("en", { weekday: "long" })}
                </div>
              </td>
              <td className="border p-1 px-4 ">
                {selectedDate.toLocaleDateString("en-gb")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Data-Table */}
      <table
        style={{ direction: "ltr" }}
        className="overtime-request-table"
        id="overtime-request-table"
      >
        <thead className="text-sm ">
          <tr>
            <th rowSpan={2} style={{ width: "100px" }}>
              Task
            </th>
            <th
              rowSpan={2}
              style={{ width: "20px", fontSize: "8pt" }}
              className="px-1"
            >
              Hrs. Needed
            </th>
            <th rowSpan={1} colSpan={4}>
              Manpower Required To Do This Job
            </th>
            <th rowSpan={2} style={{ width: "55px" }}>
              FMC Job No.
            </th>
            <th colSpan={2} rowSpan={1} className="py-4">
              Working Hours
            </th>
            <th
              rowSpan={2}
              style={{ width: "90px", height: "70px" }}
              className=" relative text-start text-xs font-extrabold"
            >
              <div className="absolute left-1/2 -translate-x-1/2 bottom-1/2 translate-y-1/2 text-start -rotate-45 origin-center whitespace-nowrap">
                Transportation
              </div>
            </th>
          </tr>
          <tr>
            <th style={{ width: "20px" }}>Sr.</th>
            <th style={{ width: "35px" }}>Job Title</th>
            <th style={{ width: "200px" }}>Name</th>
            <th style={{ width: "60px" }} className="py-1">
              Personal No.
            </th>
            <th style={{ width: "45px" }}>From</th>
            <th style={{ width: "45px" }}>To</th>
          </tr>
        </thead>
        <tbody>
          {selectedEmployees.map((emp, index) => (
            <tr key={emp.id + "-request"}>
              <td></td>
              <td></td>
              <td>{index + 1}</td>
              <td></td>
              <td className="text-start ps-4">{emp.name}</td>
              <td>{emp.jobNumber}</td>
              <td></td>
              <td>{emp.from}</td>
              <td>{emp.to}</td>
              <td className="text-[8pt]">{emp.transportation}</td>
            </tr>
          ))}
          {selectedEmployees.length < 25 &&
            new Array(25 - selectedEmployees.length).fill(0).map((_, index) => (
              <tr key={index + "-empty-row"}>
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="mt-4 text-xl font-bold flex items-center justify-between px-4">
        <h2>Head of Department</h2>
        <h2>Approval</h2>
      </div>
    </div>
  );
});

export default OvertimeRequestPreview;

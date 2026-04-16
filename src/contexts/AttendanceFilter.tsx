import { createContext, useContext, useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import {
  HomeFilterAttendanceFormData,
  HomeFilterAttendanceFormSchema,
} from "../utils/forms-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { AttendanceRecord } from "../types";
import { getAttendanceFiltered } from "../utils/storage";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface IAttendanceFilterContext {
  form: UseFormReturn<HomeFilterAttendanceFormData>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalRecords: number;
  setTotalRecords: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  filteredAttendance: AttendanceRecord[];
  loadFilteredData: (page?: number) => Promise<void>;
}

const AttendanceFilterContext = createContext<IAttendanceFilterContext | null>(
  null,
);

const ITEMS_PER_PAGE = 10;

function AttendanceFilterProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const form = useForm<HomeFilterAttendanceFormData>({
    defaultValues: {
      employeeId: "",
      fromDate: getTodayDate(),
      toDate: getTodayDate(),
      status: null,
    },
    mode: "onChange",
    resolver: zodResolver(HomeFilterAttendanceFormSchema),
  });
  const watchedEmployeeId = form.watch("employeeId");
  const watchedFromDate = form.watch("fromDate");
  const watchedToDate = form.watch("toDate");
  const watchedStatus = form.watch("status");

  const [filteredAttendance, setFilteredAttendance] = useState<
    AttendanceRecord[]
  >([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  const loadFilteredData = async (page: number = 1) => {
    try {
      const result = await getAttendanceFiltered({
        employee_id: watchedEmployeeId || null,
        from_date: watchedFromDate || null,
        to_date: watchedToDate || null,
        status: watchedStatus || null,
      });
      const data = Array.isArray(result) ? result : [];
      setTotalRecords(data.length);
      const start = (page - 1) * ITEMS_PER_PAGE;
      const paginatedData = data
        .slice(start, start + ITEMS_PER_PAGE)
        .map((record, index) => ({
          ...record,
          _rowNumber: start + index + 1,
        }));
      setFilteredAttendance(paginatedData);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading attendance:", error);
      toast.error(t ? t("home.loadError") : "Error loading attendance records");
      setFilteredAttendance([]);
      setTotalRecords(0);
    }
  };

  useEffect(() => {
    // const delayDebounce = setTimeout(() => {
    // }, 3000);
    loadFilteredData(currentPage);

    console.log("render");

    // return () => clearTimeout(delayDebounce);
  }, [
    currentPage,
    watchedEmployeeId,
    watchedFromDate,
    watchedStatus,
    watchedToDate,
  ]);

  return (
    <AttendanceFilterContext
      value={{
        form,
        currentPage,
        setCurrentPage,
        setTotalRecords,
        totalRecords,
        filteredAttendance,
        loadFilteredData,
        totalPages,
      }}
    >
      {children}
    </AttendanceFilterContext>
  );
}

export const useAttendanceFilter = () => {
  const context = useContext(AttendanceFilterContext);
  if (!context) {
    throw new Error(
      "useAttendanceFilter must be used within an AttendanceFilterProvider",
    );
  }
  return context;
};

export default AttendanceFilterProvider;

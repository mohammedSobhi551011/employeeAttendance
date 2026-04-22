import type { AttendanceRecord } from "../types";
import {
  addMultipleAttendanceRecords,
  updateAttendanceRecord as updateAttendanceRecordStorage,
  deleteAttendanceRecord as deleteAttendanceRecordStorage,
  deleteAttendanceRecordsByEmployeeId as deleteAttendanceRecordsStorage,
} from "../utils/storage";
import { useLoadingBackground } from "../components/ui/LoadingBackground";

export const useAttendance = () => {
  const { setIsLoading } = useLoadingBackground();

  const addMultipleRecords = async (
    records: Omit<AttendanceRecord, "id">[],
  ) => {
    try {
      setIsLoading(true);
      await addMultipleAttendanceRecords(records);
      setIsLoading(false);
    } catch (error) {
      console.log("failed to add multiple records");
      setIsLoading(false);
    }
  };

  const updateAttendanceRecord = async (
    id: string,
    updatedData: Partial<AttendanceRecord>,
  ) => {
    try {
      setIsLoading(true);
      await updateAttendanceRecordStorage(id, updatedData);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("failed to update record");
    }
  };

  const deleteAttendanceRecord = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteAttendanceRecordStorage(id);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("failed to delete record");
    }
  };

  const deleteAttendanceRecordsByEmployeeId = async (employeeId: string) => {
    try {
      setIsLoading(true);
      await deleteAttendanceRecordsStorage(employeeId);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("failed to delete records by employee id");
    }
  };

  return {
    addMultipleRecords,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    deleteAttendanceRecordsByEmployeeId,
  };
};

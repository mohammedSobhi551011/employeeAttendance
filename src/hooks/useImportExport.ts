import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useTranslation } from "react-i18next";
import { useLoadingBackground } from "../components/ui/LoadingBackground";

interface IUseImportExportProps {
  keys: string[];
  onDataImported?: (stringifiedData: string) => Promise<void>;
  onDataExported?: () => Promise<void>;
}
export const useImportExport = <T>({
  keys,
  onDataExported,
  onDataImported,
}: IUseImportExportProps) => {
  const { setIsLoading } = useLoadingBackground();

  const { t } = useTranslation();
  const exportData = async (data: T) => {
    try {
      setIsLoading(true);
      const filePath = await save({
        defaultPath:
          keys.join("_") + `-${new Date().getTime()}-` + "backup.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (!filePath) {
        setIsLoading(false);
        return;
      }

      await writeTextFile(filePath, JSON.stringify(data, null, 2));
      onDataExported && (await onDataExported());
      setIsLoading(false);
    } catch (error) {
      console.error("Export ERROR:", error);
      alert(t("export.error"));
      setIsLoading(false);
    }
  };

  const pickFile = async () => {
    const filePath = await open({
      multiple: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });

    return filePath;
  };

  const importData = async () => {
    try {
      setIsLoading(true);
      const filePath = await pickFile();
      if (!filePath) {
        setIsLoading(false);
        return;
      }

      const content = await readTextFile(filePath as string);

      // const data = JSON.parse(content) as T;

      // send to backend
      // await window.__TAURI__.invoke("import_data", { data });

      onDataImported && (await onDataImported(content));
      setIsLoading(false);
    } catch (err) {
      console.error("IMPORT ERROR:", err);
      alert(t("import.error"));
      setIsLoading(false);
    }
  };

  return {
    exportData,
    importData,
  };
};

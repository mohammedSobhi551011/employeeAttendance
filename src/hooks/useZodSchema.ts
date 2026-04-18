import { TFunction } from "i18next";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function useZodSchema<T>(schemaFactory: (t: TFunction) => T) {
  const { t, i18n } = useTranslation();
  return useMemo(() => schemaFactory(t), [i18n.language]);
}

import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { createContext, ReactNode, useContext, useState } from "react";

interface ILoadingBackgroundValue {
  setIsLoading: (value: boolean) => void;
  isLoading: boolean;
}

const Context = createContext<ILoadingBackgroundValue | null>(null);

export const LoadingBackgroundProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return <Context value={{ isLoading, setIsLoading }}>{children}</Context>;
};

export const useLoadingBackground = () => {
  const value = useContext(Context);
  if (!value)
    throw new Error(
      "useLoadingBackground should be used inside LoadingBackgroundProvider",
    );
  return value;
};

function LoadingBackground() {
  const { isLoading } = useLoadingBackground();
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 flex items-center justify-center"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          <LoaderCircle
            size={40}
            className="text-blue-700 animate-spin"
            strokeWidth={3}
            absoluteStrokeWidth
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingBackground;

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface IModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export const Modal = ({ isOpen, title, children, onClose }: IModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0  flex items-end md:items-center justify-center px-0 md:px-4 z-40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            className="bg-white rounded-t-lg md:rounded-lg shadow-xl max-w-full w-full max-h-[90vh]  overflow-y-auto md:mx-4 z-50"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex justify-between items-center rounded-t-lg md:rounded-t-none">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="px-4 md:px-6 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

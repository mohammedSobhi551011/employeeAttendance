import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

const bootstrap = async (): Promise<void> => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

bootstrap();

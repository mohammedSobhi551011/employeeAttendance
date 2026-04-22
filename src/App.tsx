import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import type { ReactNode } from "react";
import { Home } from "./pages/Home";
import { Attendance } from "./pages/Attendance";
import { Employees } from "./pages/Employees";
import { OvertimeReport } from "./pages/OvertimeReport";
import Login from "./pages/Login";
import "./index.css";
import { Toaster } from "react-hot-toast";
import AttendanceFilterProvider from "./contexts/AttendanceFilter";
import EmployeesProvider from "./contexts/Employees";
import { OvertimeRequest } from "./pages/OvertimeRequest";
import OvertimeProvider from "./contexts/Overtime";
import Meals from "./pages/Meals";
import { Navbar } from "./components/Navbar";
import LoadingBackground, {
  LoadingBackgroundProvider,
} from "./components/ui/LoadingBackground";

interface RequireAuthProps {
  children: ReactNode;
}

function RequireAuth({ children }: RequireAuthProps): ReactNode {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <LoadingBackgroundProvider>
                <>
                  <Navbar />
                  <div className="md:pb-0 pb-20">
                    <EmployeesProvider>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <AttendanceFilterProvider>
                              <Home />
                            </AttendanceFilterProvider>
                          }
                        />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/employees" element={<Employees />} />
                        <Route
                          path="/overtime/*"
                          element={
                            <OvertimeProvider>
                              <Routes>
                                <Route
                                  path="/report"
                                  element={<OvertimeReport />}
                                />
                                <Route
                                  path="/request"
                                  element={<OvertimeRequest />}
                                />
                              </Routes>
                            </OvertimeProvider>
                          }
                        />
                        <Route path="/meals" element={<Meals />} />
                      </Routes>
                    </EmployeesProvider>
                  </div>
                  <Toaster position="bottom-left" />
                  <LoadingBackground />
                </>
              </LoadingBackgroundProvider>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

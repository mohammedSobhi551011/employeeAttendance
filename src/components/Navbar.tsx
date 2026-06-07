import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { NavbarDropdown } from "./NavbarDropdown";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const isActive = (path: string): boolean => location.pathname === path;

  useEffect(() => {
    document.documentElement.lang = i18n.language || "en";
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Header */}
      <nav className="hidden md:block bg-blue-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex gap-x-4 items-center">
                <img src="attendance_6612036.png" className="w-8 aspect-auto" />
                <h1 className="text-2xl font-bold"> {t("nav.appName")}</h1>
              </div>
              <div className="flex gap-1">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive("/")
                      ? "bg-white text-blue-700"
                      : "hover:bg-blue-700 text-blue-100"
                  }`}
                >
                  {t("nav.home")}
                </Link>
                <Link
                  to="/attendance"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive("/attendance")
                      ? "bg-white text-blue-700"
                      : "hover:bg-blue-700 text-blue-100"
                  }`}
                >
                  {t("nav.attendance")}
                </Link>
                <Link
                  to="/employees"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive("/employees")
                      ? "bg-white text-blue-700"
                      : "hover:bg-blue-700 text-blue-100"
                  }`}
                >
                  {t("nav.employees")}
                </Link>
                <NavbarDropdown
                  items={[
                    {
                      label: t("nav.overtime.report"),
                      href: "/overtime/report",
                      isActive: location.pathname.includes("/overtime/report"),
                    },
                    {
                      label: t("nav.overtime.request"),
                      href: "/overtime/request",
                      isActive: location.pathname.includes("/overtime/request"),
                    },
                  ]}
                  label={{
                    isActive: location.pathname.includes("overtime"),
                    name: t("nav.overtime.label"),
                  }}
                />

                <Link
                  to="/meals"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive("/meals")
                      ? "bg-white text-blue-700"
                      : "hover:bg-blue-700 text-blue-100"
                  }`}
                >
                  {t("nav.meals")}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  className={`px-2 py-1 rounded text-sm ${i18n.language === "en" ? "bg-white text-blue-700" : "text-blue-100 hover:bg-blue-700"}`}
                  onClick={() => {
                    i18n.changeLanguage("en");
                    document.documentElement.lang = "en";
                    document.documentElement.dir = "ltr";
                  }}
                >
                  EN
                </button>
                <button
                  className={`px-2 py-1 rounded text-sm ${i18n.language === "ar" ? "bg-white text-blue-700" : "text-blue-100 hover:bg-blue-700"}`}
                  onClick={() => {
                    i18n.changeLanguage("ar");
                    document.documentElement.lang = "ar";
                    document.documentElement.dir = "rtl";
                  }}
                >
                  العربية
                </button>
              </div>
              <Button variant="destructive" size="sm" onClick={logout}>
                <LogOut
                  size={16}
                  className={i18n.language === "ar" ? "rotate-180" : ""}
                />
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

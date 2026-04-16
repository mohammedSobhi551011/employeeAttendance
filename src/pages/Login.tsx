import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { LoginFormData, LoginFormSchema } from "../utils/forms-schemas";
import { Input } from "../components/ui/Input";
import { LogIn } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

const USERNAME = "AhmedLotfy";
const PASSWORD = "2698";

export default function Login() {
  const form = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(LoginFormSchema),
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Clear session on component mount to ensure fresh login
    localStorage.removeItem("isLoggedIn");
  }, []);

  const onSubmit = (data: LoginFormData) => {
    if (data.username === USERNAME && data.password === PASSWORD) {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } else {
      form.setError("username", {
        type: "manual",
        message: "Invalid username or password",
      });
      form.setError("password", {
        type: "manual",
        message: "Invalid username or password",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-600 to-blue-800 px-4 py-6">
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Attendance App
          </h1>
          <p className="text-blue-100">Sign in to continue</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-lg p-6 md:p-8 space-y-4"
        >
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                autoFocus
                label="Username"
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                label="Password"
                {...field}
                error={fieldState.error?.message}
              />
            )}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors text-base md:text-lg mt-6"
          >
            <LogIn className="inline-block w-5 h-5 mr-2" />
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-blue-100 text-xs md:text-sm mt-6">
          © 2026 Employees Management System
        </p>
      </div>
    </div>
  );
}

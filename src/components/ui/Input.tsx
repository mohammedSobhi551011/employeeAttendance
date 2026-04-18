export interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({
  label,
  type = "text",
  placeholder,
  error,
  className = "",
  ...props
}: IInputProps) => {
  return (
    <div
      className={` ${type === "checkbox" ? "flex gap-x-1 items-center" : "w-full"}`}
    >
      {label && (
        <label
          htmlFor={props.id}
          className=" text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={`${type !== "checkbox" && "w-full"} mt-2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

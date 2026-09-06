import React from "react";

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  required = false,
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-text"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="
          w-full
          h-11
          px-3
          bg-surface
          border
          border-border
          rounded-md
          text-text
          placeholder:text-muted
          outline-none
          transition
          focus:border-btn
          focus:ring-2
          focus:ring-btn/10
        "
      />
    </div>
  );
}

export default Input;
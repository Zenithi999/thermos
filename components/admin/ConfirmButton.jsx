"use client";

// Submit button that asks before running a destructive server action.
export default function ConfirmButton({ message, children, className = "btn btn-danger btn-sm", ...rest }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

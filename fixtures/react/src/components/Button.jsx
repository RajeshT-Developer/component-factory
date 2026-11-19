export default function Button({
  label,
  icon = "none",
  disabled = false,
  type = "button",
  className = "",
  ...nativeProps
}) {
  return (
    <button
      {...nativeProps}
      className={["ui-button", className].filter(Boolean).join(" ")}
      type={type}
      disabled={disabled}
    >
      {icon === "plus" && (
        <span
          className="ui-button__icon"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            focusable="false"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      )}

      <span className="ui-button__label">
        {label}
      </span>
    </button>
  );
}
import "./button.css";

export default function ConfiguredButton({ onClick } = {}) {
  return (
  <button
    onClick={onClick}
    className="ui-button"
    type="button"
  >
    <span className="ui-button__label">{"Add item"}</span>
  </button>
  );
}

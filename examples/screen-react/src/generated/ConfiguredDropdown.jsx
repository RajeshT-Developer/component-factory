import { useEffect, useId, useRef, useState } from "react";
import "./dropdown.css";

const config = {
  "label": "Browse...!",
  "align": "end",
  "items": [
    {
      "id": "cars",
      "type": "link",
      "label": "Browse cars...!",
      "href": "#factory-cars"
    },
    {
      "id": "filters",
      "label": "Open filters...!",
      "type": "link",
      "href": "#factory-cars"
    },
    {
      "id": "custom-1",
      "type": "action",
      "label": "New action",
      "action": "new-action",
      "disabled": false
    }
  ]
};

export default function ConfiguredDropdown({ onAction } = {}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    const root = rootRef.current;
    const ownerDocument = root.ownerDocument;

    function handleOutsideClick(event) {
      if (!root.contains(event.target)) {
        setOpen(false);
      }
    }

    ownerDocument.addEventListener("click", handleOutsideClick);

    return () => {
      ownerDocument.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  function close(restoreFocus = false) {
    setOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape" || !open) return;

    event.preventDefault();
    event.stopPropagation();
    close(true);
  }

  function handleLinkClick(event) {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.currentTarget.target === "_blank"
    ) {
      return;
    }

    close(true);
  }

  function handleAction(item) {
    if (item.disabled) return;

    close(true);
    setStatus("Action received: " + item.action);
    onAction?.(item.action, item);
  }

  return (
    <div>
      <div
        ref={rootRef}
        className="ui-dropdown"
        data-enhanced="true"
        data-align={config.align}
        onKeyDown={handleKeyDown}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            close();
          }
        }}
      >
        <button
          ref={triggerRef}
          className="ui-dropdown__trigger"
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(current => !current)}
        >
          <span>{config.label}</span>
          <span
            className="ui-dropdown__chevron"
            aria-hidden="true"
          />
        </button>

        <ul
          id={panelId}
          className="ui-dropdown__panel"
          hidden={!open}
        >
          {config.items.map(item => (
            <li key={item.id}>
              {item.type === "link" ? (
                <a
                  className="ui-dropdown__item"
                  href={item.href}
                  onClick={handleLinkClick}
                >
                  <span>{item.label}</span>
                </a>
              ) : (
                <button
                  className="ui-dropdown__item"
                  type="button"
                  disabled={item.disabled}
                  onClick={() => handleAction(item)}
                >
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <p role="status">{status}</p>
    </div>
  );
}

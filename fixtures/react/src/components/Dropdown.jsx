import { useEffect, useId, useRef, useState } from "react";
import Button from "./Button";

import "@factory-dropdown-css";
import "./dropdown.css";

export default function Dropdown({
  label,
  icon = "none",
  items,
  onAction,
  align = "start"
}) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef(null);
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

  function close({ restoreFocus = false } = {}) {
    setOpen(false);

    if (restoreFocus) {
      rootRef.current
        ?.querySelector("[data-dropdown-trigger]")
        ?.focus();
    }
  }

  function handleKeyDown(event) {
    if (event.key !== "Escape" || !open) return;

    event.preventDefault();
    event.stopPropagation();

    close({ restoreFocus: true });
  }

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      close();
    }
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

    close({ restoreFocus: true });

    // Keep normal browser navigation.
    // Do not call preventDefault().
  }

  function handleAction(item) {
    close({ restoreFocus: true });

    onAction?.(item.action, item);
  }

  return (
    <div
      ref={rootRef}
      className="ui-dropdown"
      data-align={align}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <Button
        label={
          <>
            {label}

            <span
              className="ui-dropdown__caret"
              aria-hidden="true"
            />
          </>
        }
        icon={icon}
        type="button"
        data-dropdown-trigger=""
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(current => !current)}
      />

      <ul
        id={panelId}
        className="ui-dropdown__panel"
        hidden={!open}
      >
        {items.map(item => (
          <li key={item.id}>
            {item.type === "link" ? (
              <a
                className="ui-dropdown__item"
                href={item.href}
                target={item.target}
                rel={
                  item.target === "_blank"
                    ? "noopener noreferrer"
                    : undefined
                }
                aria-current={item.current ? "page" : undefined}
                onClick={handleLinkClick}
              >
                {item.icon && (
                  <span
                    className="ui-dropdown__icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}

                <span>{item.label}</span>
              </a>
            ) : item.type === "action" ? (
              <button
                className="ui-dropdown__item"
                type="button"
                disabled={item.disabled}
                onClick={() => handleAction(item)}
              >
                {item.icon && (
                  <span
                    className="ui-dropdown__icon"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                )}

                <span>{item.label}</span>
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
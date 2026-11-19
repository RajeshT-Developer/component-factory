import dropdownCss from "../../../../shared/dropdown/dropdown.css?raw";
import vueDropdownSource from "../components/ui/UiDropdown.vue?raw";
import vueButtonSource from "../components/ui/UiButton.vue?raw";
import buttonCss from "../styles/button.css?raw";
import buttonContract from "../contracts/button.contract.json";

function serialize(value) {
  return JSON.stringify(value, null, 2)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function file(filename, source, mimeType = "text/plain") {
  return { filename, source, mimeType };
}

function replaceImport(source, from, to) {
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pattern = new RegExp(
    `(["'])${escaped}\\1`
  );

  if (!pattern.test(source)) {
    throw new Error(
      `Export dependency could not be rewritten: ${from}`
    );
  }

  return source.replace(pattern, () => JSON.stringify(to));
}

function reactFiles(config) {
  const source = `import { useEffect, useId, useRef, useState } from "react";
import "./dropdown.css";

const config = ${serialize(config)};

${String.raw`export default function ConfiguredDropdown({ onAction } = {}) {
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
`}`;

  return [
    file("ConfiguredDropdown.jsx", source),
    file("dropdown.css", dropdownCss, "text/css")
  ];
}

function vueFiles(config) {
  const localDropdown = replaceImport(
    vueDropdownSource,
    "../../../../../shared/dropdown/dropdown.css",
    "./dropdown.css"
  );

  const localButton = replaceImport(
    replaceImport(
      vueButtonSource,
      "../../styles/button.css",
      "./button.css"
    ),
    "../../contracts/button.contract.json",
    "./button.contract.json"
  );

  const configuredSource = `<script setup>
import { ref, useId } from "vue";
import UiDropdown from "./UiDropdown.vue";

const config = ${serialize(config)};
const panelId = useId();
const status = ref("");

const emit = defineEmits(["action"]);

function handleAction(action, item) {
  status.value = "Action received: " + action;
  emit("action", action, item);
}
</script>

<template>
  <div>
    <UiDropdown
      :label="config.label"
      :panel-id="panelId"
      :items="config.items"
      :align="config.align"
      @action="handleAction"
    />

    <p role="status">{{ status }}</p>
  </div>
</template>
`;

  return [
    file("ConfiguredDropdown.vue", configuredSource),
    file("UiDropdown.vue", localDropdown),
    file("UiButton.vue", localButton),
    file("dropdown.css", dropdownCss, "text/css"),
    file("button.css", buttonCss, "text/css"),
    file(
      "button.contract.json",
      JSON.stringify(buttonContract, null, 2) + "\n",
      "application/json"
    )
  ];
}

export function generateDropdownFrameworkFiles(config, framework) {
  if (framework === "react") {
    return reactFiles(config);
  }

  if (framework === "vue") {
    return vueFiles(config);
  }

  throw new Error(`Unsupported dropdown framework: ${framework}`);
}
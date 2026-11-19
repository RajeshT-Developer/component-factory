import { useState } from "react";
import ConfiguredButton from "./ConfiguredButton.jsx";
import ConfiguredDropdown from "./ConfiguredDropdown.jsx";
import "./screen.css";

const screen = {
  "title": "Vehicle inventory...!",
  "description": "Browse available vehicles and manage listings....!",
  "contentHeading": "Inventory...!",
  "contentText": "Your application content goes here. Connect your data and application behavior...!"
};

export default function ConfiguredScreen({
  onPrimaryAction,
  onDropdownAction
} = {}) {
  const [status, setStatus] = useState("");

  function handlePrimaryAction(event) {
    setStatus("Primary action received.");
    onPrimaryAction?.(event);
  }

  return (
    <main className="screen-shell">
      <header className="screen-header">
        <h1>{screen.title}</h1>
        <p>{screen.description}</p>
      </header>

      <div
        className="screen-toolbar"
        role="group"
        aria-label="Screen actions"
      >
        <ConfiguredDropdown onAction={onDropdownAction} />
        <ConfiguredButton onClick={handlePrimaryAction} />
      </div>

      <p className="screen-feedback" role="status">
        {status}
      </p>

      <section
        id="factory-cars"
        className="screen-content"
        aria-labelledby="screen-content-title"
      >
        <h2 id="screen-content-title">
          {screen.contentHeading}
        </h2>

        <p>{screen.contentText}</p>
      </section>
    </main>
  );
}

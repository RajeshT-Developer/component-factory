import { useId, useState } from "react";
import ConfiguredButton from "./ConfiguredButton.jsx";
import ConfiguredDropdown from "./ConfiguredDropdown.jsx";
import ConfiguredTable from "./ConfiguredTable.jsx";
import "./screen.css";
const screen = {
  "title": "Vehicle inventory...!",
  "description": "Browse available vehicles and manage listings....!",
  "contentHeading": "Inventory...!",
  "contentText": "Your application content goes here. Connect your data and application behavior...!",
  "contentMode": "table"
};
export default function ConfiguredScreen({ rows = [], onPrimaryAction, onDropdownAction, onRowAction } = {}) {
  const titleId = useId();
  const [status, setStatus] = useState("");
  function primary(event) { setStatus("Primary action received."); onPrimaryAction?.(event); }
  return <main className="screen-shell">
    <header className="screen-header"><h1>{screen.title}</h1><p>{screen.description}</p></header>
    <div className="screen-toolbar" role="group" aria-label="Screen actions"><ConfiguredDropdown onAction={onDropdownAction} /><ConfiguredButton onClick={primary} /></div>
    <p className="screen-feedback" role="status">{status}</p>
    <section id="factory-cars" className="screen-content" aria-labelledby={titleId}>
      <h2 id={titleId}>{screen.contentHeading}</h2>
      {screen.contentMode === "table" ? <ConfiguredTable rows={rows} onRowAction={onRowAction} /> : <p>{screen.contentText}</p>}
    </section>
  </main>;
}

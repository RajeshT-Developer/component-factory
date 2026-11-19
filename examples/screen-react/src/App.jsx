import { useState } from "react";
import ConfiguredScreen from "./generated/ConfiguredScreen.jsx";
import "./consumer.css";
const initialRows = [
  { id: "vehicle-1", model: "City hatchback", status: "Available" },
  { id: "vehicle-2", model: "Family SUV", status: "Reserved" }
];
export default function App() {
  const [rows, setRows] = useState(initialRows);
  const [hostMessage, setHostMessage] = useState("The React consumer is ready to receive screen actions.");
  return <>
    <aside className="consumer-feedback" aria-labelledby="consumer-feedback-title">
      <h2 id="consumer-feedback-title">React consumer application</h2>
      <p role="status">{hostMessage}</p>
      <button type="button" style={{ minHeight: 44 }} onClick={() => setRows([])}>Show empty table</button>{" "}
      <button type="button" style={{ minHeight: 44 }} onClick={() => setRows(initialRows)}>Restore sample rows</button>
    </aside>
    <ConfiguredScreen rows={rows}
      onPrimaryAction={() => setHostMessage("The consumer received the primary action. Connect your application workflow here.")}
      onDropdownAction={(action, item) => setHostMessage(`The consumer received "${action}" from item "${item.id}".`)}
      onRowAction={(action, row) => setHostMessage(`Row action: ${action}, row: ${row.id}.`)} />
  </>;
}

import { useState } from "react";
import ConfiguredScreen from "./generated/ConfiguredScreen.jsx";
import "./consumer.css";

export default function App() {
  const [hostMessage, setHostMessage] = useState(
    "The React consumer is ready to receive screen actions."
  );

  function handlePrimaryAction() {
    setHostMessage(
      "The consumer received the primary action. Connect your application workflow here."
    );
  }

  function handleDropdownAction(action, item) {
    setHostMessage(
      `The consumer received "${action}" from item "${item.id}".`
    );
  }

  return (
    <>
      <aside
        className="consumer-feedback"
        aria-labelledby="consumer-feedback-title"
      >
        <h2 id="consumer-feedback-title">
          React consumer application
        </h2>

        <p role="status">{hostMessage}</p>
      </aside>

      <ConfiguredScreen
        onPrimaryAction={handlePrimaryAction}
        onDropdownAction={handleDropdownAction}
      />
    </>
  );
}
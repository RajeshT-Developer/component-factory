import { useRef, useState } from "react";
import Button from "./components/Button";
import ProposalReview from "./components/ProposalReview";
import DropdownDemo from "./components/DropdownDemo";


const scenarios = [
  {
    id: "text-default",
    title: "Text only",
    label: "Save changes",
    icon: "none",
    disabled: false
  },
  {
    id: "icon-default",
    title: "Icon and text",
    label: "Add item",
    icon: "plus",
    disabled: false
  },
  {
    id: "disabled",
    title: "Disabled",
    label: "Unavailable",
    icon: "none",
    disabled: true
  },
  {
    id: "long-label",
    title: "Long label",
    label:
      "Save all changes and continue to the next configuration step",
    icon: "none",
    disabled: false
  }
];

export default function App() {
  const [events, setEvents] = useState([]);
  const nextEventId = useRef(1);

  function recordEvent(type, event, scenario) {
    if (event.currentTarget.disabled) return;

    const entry = {
      id: nextEventId.current++,
      type,
      scenario: scenario.id,
      label: scenario.label
    };

    setEvents(currentEvents =>
      [entry, ...currentEvents].slice(0, 50)
    );
  }

  return (
    <main className="fixture-shell">
      <header className="fixture-header">
        <p className="fixture-eyebrow">
          Component Factory · React fixture
        </p>

        <h1>Button scenarios</h1>

        <p>
          React implementations using the shared button stylesheet.
        </p>
      </header>

      <section
        className="scenario-grid"
        aria-label="Button scenarios"
      >
        {scenarios.map(scenario => (
          <article
            key={scenario.id}
            className="scenario-card"
            data-scenario={scenario.id}
            aria-labelledby={`${scenario.id}-title`}
          >
            <h2 id={`${scenario.id}-title`}>
              {scenario.title}
            </h2>

            <div
              className={[
                "scenario-preview",
                scenario.id === "long-label"
                  ? "scenario-preview--narrow"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <Button
                label={scenario.label}
                icon={scenario.icon}
                disabled={scenario.disabled}
                type="button"
                data-fixture-button=""
                onClick={event =>
                  recordEvent("click", event, scenario)
                }
                onMouseEnter={event =>
                  recordEvent("mouseenter", event, scenario)
                }
                onMouseLeave={event =>
                  recordEvent("mouseleave", event, scenario)
                }
                onFocus={event =>
                  recordEvent("focus", event, scenario)
                }
                onBlur={event =>
                  recordEvent("blur", event, scenario)
                }
              />
            </div>
          </article>
        ))}
      </section>

      <section
        className="event-panel"
        aria-labelledby="events-title"
      >
        <div className="event-panel__heading">
          <h2 id="events-title">Event log</h2>

          <button
            id="clear-events"
            className="fixture-action"
            type="button"
            disabled={events.length === 0}
            onClick={() => setEvents([])}
          >
            Clear log
          </button>
        </div>

        <p>
          Latest event first. Retains up to 50 events.
        </p>

        <p
          id="empty-events"
          hidden={events.length > 0}
        >
          No events yet.
        </p>

        <ol
          id="event-list"
          className="fixture-events"
        >
          {events.map(event => (
            <li
              key={event.id}
              data-event-id={event.id}
              data-event-type={event.type}
              data-scenario={event.scenario}
            >
              <code>{event.type}</code>

              <span>
                {event.scenario} — {event.label}
              </span>
            </li>
          ))}
        </ol>
      </section>
      
      <DropdownDemo />
      {new URLSearchParams(window.location.search).get(
        "proposalReview"
      ) === "1" && <ProposalReview />}


    </main>
  );
}
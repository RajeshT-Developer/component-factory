import "../../../apps/workbench/src/styles/button.css";
import "../../../shared/dropdown/dropdown.css";
import "../../../shared/dropdown/dropdown.js";
import "./style.css";

const buttons = document.querySelectorAll("[data-fixture-button]");
const eventList = document.querySelector("#event-list");
const emptyMessage = document.querySelector("#empty-events");
const clearButton = document.querySelector("#clear-events");

const eventTypes = [
  "click",
  "mouseenter",
  "mouseleave",
  "focus",
  "blur"
];

let nextEventId = 1;

function recordEvent(event) {
  const button = event.currentTarget;

  // Match the workbench policy.
  if (button.disabled) return;

  const scenario = button.closest("[data-scenario]").dataset.scenario;

  const label = button
    .querySelector(".ui-button__label")
    .textContent
    .trim();

  const entry = document.createElement("li");

  entry.dataset.eventId = String(nextEventId++);
  entry.dataset.eventType = event.type;
  entry.dataset.scenario = scenario;

  const eventName = document.createElement("code");
  eventName.textContent = event.type;

  const description = document.createElement("span");
  description.textContent = `${scenario} — ${label}`;

  entry.append(eventName, description);
  eventList.prepend(entry);

  while (eventList.children.length > 50) {
    eventList.lastElementChild.remove();
  }

  emptyMessage.hidden = true;
  clearButton.disabled = false;
}

buttons.forEach(button => {
  eventTypes.forEach(eventType => {
    button.addEventListener(eventType, recordEvent);
  });
});

clearButton.addEventListener("click", () => {
  eventList.replaceChildren();
  emptyMessage.hidden = false;
  clearButton.disabled = true;
});

const dropdownResult = document.querySelector(
  "#html-dropdown-result"
);

document.querySelectorAll("[data-dropdown]").forEach(root => {
  root.addEventListener("dropdown-action", event => {
    if (event.detail.action === "open-filters") {
      dropdownResult.textContent = "Filters action executed.";
    }
  });

  window.ComponentFactoryDropdown.init(root);
});
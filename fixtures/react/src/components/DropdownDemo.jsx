import { useEffect, useState } from "react";
import Dropdown from "./Dropdown";

function CarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="m5 11 2-6h10l2 6" />
      <path d="M4 11h16v7H4z" />
      <path d="M7 18v2m10-2v2M7 14h.01M17 14h.01" />
    </svg>
  );
}

const browseItems = [
  {
    id: "cars",
    label: "Browse cars",
    type: "link",
    href: "#react-cars",
    icon: <CarIcon />
  },
  {
    id: "auctions",
    label: "Upcoming auctions",
    type: "link",
    href: "#react-auctions"
  },
  {
    id: "auctions-new-tab",
    label: "Upcoming auctions — new tab",
    type: "link",
    href: "#react-auctions",
    target: "_blank"
  },
  {
    id: "filters",
    label: "Open filters",
    type: "action",
    action: "open-filters"
  }
];

const accountItems = [
  {
    id: "profile",
    label: "My profile",
    type: "link",
    href: "#react-profile"
  },
  {
    id: "settings",
    label: "Settings",
    type: "action",
    action: "open-settings"
  },
  {
    id: "export",
    label: "Export account data — unavailable",
    type: "action",
    action: "export-account-data",
    disabled: true
  }
];


export default function DropdownDemo() {
  const [smoothScroll, setSmoothScroll] = useState(true);
  const [status, setStatus] = useState("");

  const [carsNavigationEnabled, setCarsNavigationEnabled] = useState(true);

  const configuredBrowseItems = browseItems.map(item => {
    if (item.id !== "cars") {
      return item;
    }

    const { href: _href, action: _action, ...baseItem } = item;
    
    return carsNavigationEnabled
      ? {
          ...baseItem,
          type: "link",
          href: "#react-cars"
        }
      : {
          ...baseItem,
          type: "action",
          action: "select-cars"
        };
  });

  useEffect(() => {
    const root = document.documentElement;
    const attribute = "data-react-smooth-scroll";
    const previousValue = root.getAttribute(attribute);

    root.setAttribute(attribute, String(smoothScroll));

    return () => {
      if (previousValue === null) {
        root.removeAttribute(attribute);
      } else {
        root.setAttribute(attribute, previousValue);
      }
    };
  }, [smoothScroll]);

  function handleAction(action) {
    switch (action) {
      case "select-cars":
        setStatus("Cars action executed. No navigation occurred.");
        break;

      case "open-filters":
        setStatus("Filters action executed.");
        break;

      case "open-settings":
        setStatus("Settings action executed.");
        break;

      default:
        setStatus(`Unknown action: ${action}`);
    }
  }

  return (
    <section
      className="dropdown-demo"
      aria-labelledby="dropdown-demo-title"
    >
      <h2 id="dropdown-demo-title">Dropdown scenarios</h2>

      <label className="dropdown-demo__scroll-toggle">
        <input
          type="checkbox"
          checked={smoothScroll}
          onChange={event =>
            setSmoothScroll(event.currentTarget.checked)
          }
        />

        Smooth scrolling
      </label>

      <label className="dropdown-demo__scroll-toggle">
        <input
          type="checkbox"
          checked={carsNavigationEnabled}
          onChange={event =>
            setCarsNavigationEnabled(event.currentTarget.checked)
          }
        />

        Enable navigation for “Browse cars”
      </label>

      <nav
        className="dropdown-demo__toolbar"
        aria-label="Dropdown examples"
      >
        <Dropdown
          label="Browse"
          items={configuredBrowseItems}
          onAction={handleAction}
        />

        <Dropdown
          label="Account"
          items={accountItems}
          onAction={handleAction}
        />
      </nav>

      <p className="dropdown-demo__status" role="status">
        {status}
      </p>

      <section
        id="react-cars"
        className="dropdown-demo__destination"
      >
        <h3>Cars</h3>
        <p>Cars navigation destination.</p>
      </section>

      <section
        id="react-auctions"
        className="dropdown-demo__destination"
      >
        <h3>Upcoming auctions</h3>
        <p>Auctions navigation destination.</p>
      </section>

      <section
        id="react-profile"
        className="dropdown-demo__destination"
      >
        <h3>My profile</h3>
        <p>Profile navigation destination.</p>
      </section>
    </section>
  );
}
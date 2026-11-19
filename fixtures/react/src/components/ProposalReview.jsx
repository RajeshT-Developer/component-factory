import { useRef, useState } from "react";
import Button from "./Button";

const EXPECTED_CONTRACT = "react-button-proposal-v1";

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isStringArray(value) {
  return (
    Array.isArray(value) &&
    value.every(item => typeof item === "string")
  );
}

function validateProposalFile(data) {
  if (!isObject(data)) {
    throw new Error("The file must contain a JSON object.");
  }

  if (data.schemaVersion !== 1) {
    throw new Error("Unsupported or missing schemaVersion.");
  }

  if (data.contractId !== EXPECTED_CONTRACT) {
    throw new Error(
      `Expected contractId "${EXPECTED_CONTRACT}". ` +
      "Generate a new proposal using the updated script."
    );
  }

  if (
    !["pending-review", "needs-attention"].includes(
      data.reviewStatus
    )
  ) {
    throw new Error("Invalid or missing reviewStatus.");
  }

  const proposal = data.proposal;

  if (!isObject(proposal) || !isObject(proposal.config)) {
    throw new Error("Missing proposal.config.");
  }

  const config = proposal.config;
  const allowedKeys = ["label", "icon", "type", "disabled"];

  if (
    Object.keys(config).length !== allowedKeys.length ||
    Object.keys(config).some(key => !allowedKeys.includes(key))
  ) {
    throw new Error(
      "Configuration must contain only label, icon, type, and disabled."
    );
  }

  if (
    typeof config.label !== "string" ||
    !config.label.trim()
  ) {
    throw new Error("Button label must be non-empty text.");
  }

  if (!["none", "plus"].includes(config.icon)) {
    throw new Error('Icon must be "none" or "plus".');
  }

  if (!["button", "submit", "reset"].includes(config.type)) {
    throw new Error("Unsupported button type.");
  }

  if (typeof config.disabled !== "boolean") {
    throw new Error("disabled must be a boolean.");
  }

  if (
    typeof proposal.rationale !== "string" ||
    typeof proposal.needsClarification !== "boolean" ||
    !isStringArray(proposal.unsupportedRequests) ||
    !isStringArray(proposal.questions)
  ) {
    throw new Error("Invalid proposal review fields.");
  }

  if (
    proposal.needsClarification &&
    proposal.questions.length === 0
  ) {
    throw new Error(
      "The proposal requests clarification but has no questions."
    );
  }

  const expectedStatus =
    proposal.needsClarification ||
    proposal.unsupportedRequests.length > 0
      ? "needs-attention"
      : "pending-review";

  if (data.reviewStatus !== expectedStatus) {
    throw new Error(
      "Review status does not match the proposal warnings."
    );
  }

  if (typeof data.sourceDescription !== "string") {
    throw new Error("Missing source description.");
  }

  return data;
}

export default function ProposalReview() {
  const [document, setDocument] = useState(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const selectionVersion = useRef(0);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    const version = ++selectionVersion.current;

    setDocument(null);
    setFilename("");
    setError("");
    setLoading(false);

    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError("Choose a proposal file smaller than 1 MiB.");
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();

      if (version !== selectionVersion.current) return;

      const parsed = validateProposalFile(JSON.parse(text));

      setDocument(parsed);
      setFilename(file.name);
    } catch (failure) {
      if (version !== selectionVersion.current) return;

      setError(
        failure instanceof SyntaxError
          ? "This file does not contain valid JSON."
          : failure.message || "Could not read the proposal."
      );
    } finally {
      if (version === selectionVersion.current) {
        setLoading(false);
      }
    }
  }

  const proposal = document?.proposal;
  const config = proposal?.config;

  return (
    <section
      className="event-panel"
      aria-labelledby="proposal-review-title"
      data-proposal-review=""
    >
      <h2 id="proposal-review-title">
        AI proposal review
      </h2>

      <p>
        Select a saved proposal JSON file. This panel previews
        configuration only; it does not approve, apply, or
        modify component files.
      </p>

      <label htmlFor="proposal-file">
        Saved button proposal
      </label>

      <input
        id="proposal-file"
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
      />

      {loading && (
        <p role="status">Reading proposal…</p>
      )}

      {error && (
        <p role="alert">{error}</p>
      )}

      {document && (
        <div>
          <h3>Proposal details</h3>

          <dl>
            <dt>File</dt>
            <dd>{filename}</dd>

            <dt>Contract</dt>
            <dd>{document.contractId}</dd>

            <dt>Review status</dt>
            <dd>{document.reviewStatus}</dd>
          </dl>

          <h3>Original request</h3>
          <p>{document.sourceDescription}</p>

          <h3>Configuration</h3>
          <pre style={{ overflowX: "auto" }}>
            {JSON.stringify(config, null, 2)}
          </pre>

          <h3>Rationale</h3>
          <p>{proposal.rationale}</p>

          <h3>Unsupported requests</h3>

          {proposal.unsupportedRequests.length === 0 ? (
            <p>None reported.</p>
          ) : (
            <ul>
              {proposal.unsupportedRequests.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}

          <h3>Clarification</h3>

          <p>
            {proposal.needsClarification
              ? "Clarification is required before approval."
              : "No clarification requested."}
          </p>

          {proposal.questions.length > 0 && (
            <ul>
              {proposal.questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          )}

          <h3>Button preview</h3>

          <p>
            Visual preview only. No application action is attached.
          </p>

          <div className="scenario-preview">
            <Button
              label={config.label}
              icon={config.icon}
              disabled={config.disabled}
              type={config.type}
            />
          </div>

          <p>
            Passing these checks does not establish that the
            proposal correctly interpreted every requirement.
            Developer review is still required.
          </p>
        </div>
      )}
    </section>
  );
}
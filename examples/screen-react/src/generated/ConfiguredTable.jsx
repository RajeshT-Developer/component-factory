import "./screen.css";
const table = {
  "caption": "Vehicle inventory",
  "emptyMessage": "No vehicles available.",
  "columns": [
    {
      "key": "model",
      "label": "Model"
    },
    {
      "key": "status",
      "label": "Status"
    }
  ],
  "actions": [
    {
      "id": "view",
      "label": "View"
    }
  ]
};
function cell(row, key) {
  return Object.hasOwn(row, key) && row[key] != null ? String(row[key]) : "";
}
function checkedRows(rows) {
  if (!Array.isArray(rows)) throw new Error("Table rows must be an array.");
  const ids = new Set();
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row) || !Object.hasOwn(row, "id") || typeof row.id !== "string" || !row.id.trim() || ids.has(row.id)) throw new Error("Rows need unique non-empty string ids.");
    ids.add(row.id);
    for (const column of table.columns) {
      const value = Object.hasOwn(row, column.key) ? row[column.key] : null;
      if (value != null && !["string", "number", "boolean"].includes(typeof value)) throw new Error("Table cells must be scalar values.");
      if (typeof value === "number" && !Number.isFinite(value)) throw new Error("Table numbers must be finite.");
    }
  }
  return rows;
}
export default function ConfiguredTable({ rows = [], onRowAction } = {}) {
  const data = checkedRows(rows);
  return <div className="screen-table-scroll" role="region" aria-label={table.caption} tabIndex={0}>
    <table className="screen-table"><caption>{table.caption}</caption>
      <thead><tr>{table.columns.map(c => <th key={c.key} scope="col">{c.label}</th>)}{table.actions.length > 0 && <th scope="col">Actions</th>}</tr></thead>
      <tbody>{data.length ? data.map(row => <tr key={row.id}>
        {table.columns.map(c => <td key={c.key}>{cell(row, c.key)}</td>)}
        {table.actions.length > 0 && <td>{table.actions.map(a => <button type="button" key={a.id} aria-label={a.label + ": " + row.id} onClick={() => onRowAction?.(a.id, row)}>{a.label}</button>)}</td>}
      </tr>) : <tr><td colSpan={table.columns.length + (table.actions.length ? 1 : 0)}>{table.emptyMessage}</td></tr>}</tbody>
    </table>
  </div>;
}

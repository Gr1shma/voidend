import type { ComponentTemplate } from "./types";
import {
    findField,
    findFieldByDataType,
    mapTsType,
    buildFetchHook,
    buildInterface,
    buildHtmlFetchScript,
    buildHtmlStyles,
    safeGet,
} from "./codegen-utils";

export const transactionRowTemplate: ComponentTemplate = {
    id: "transaction-row",
    name: "Transaction Statement Table",
    description: "Account statement / financial log table row list adapting to present columns.",
    requiredFields: [
        "$faker.finance.amount",
        "$faker.commerce.price",
        "$faker.date.anytime",
        "$faker.date.past",
        "$faker.date.recent",
    ],
    optionalFields: [
        "$faker.finance.accountNumber",
        "$faker.finance.currencyCode",
        "$faker.company.name",
        "$faker.commerce.department",
        "$faker.string.uuid",
    ],
    code: (fields, endpointUrl) => {
        const idField =
            findFieldByDataType(fields, ["string.uuid", "string.nanoid", "number.int"]) ??
            findField(fields, ["id", "transactionid", "uuid"]) ??
            fields[0]?.fieldName ??
            "id";
        const amountField =
            findFieldByDataType(fields, ["finance.amount", "commerce.price"]) ??
            findField(fields, ["amount", "price", "value", "cost"]) ??
            "amount";
        const dateField =
            findFieldByDataType(fields, ["date.anytime", "date.past", "date.recent"]) ??
            findField(fields, ["date", "createdat", "timestamp", "time"]) ??
            "date";
        const currencyField =
            findFieldByDataType(fields, ["finance.currencyCode", "finance.currencySymbol"]) ??
            findField(fields, ["currency", "currencycode", "symbol"]);
        const statusField =
            findFieldByDataType(fields, ["datatype.boolean"]) ??
            findField(fields, ["status", "state"]);
        const descriptionField =
            findFieldByDataType(fields, ["lorem.sentence", "company.catchPhrase"]) ??
            findField(fields, ["description", "note", "title", "details"]);
        const merchantField =
            findFieldByDataType(fields, ["company.name", "person.fullName"]) ??
            findField(fields, ["merchant", "payee", "company", "vendor"]);
        const categoryField =
            findFieldByDataType(fields, ["commerce.department", "book.genre"]) ??
            findField(fields, ["category", "type", "department"]);

        const interfaceLines = fields.map((f) => {
            const name = f.fieldName.includes(".") ? `"${f.fieldName}"?` : f.fieldName;
            return `${name}: ${mapTsType(f.dataType)};`;
        });

        return `import { useEffect, useState } from "react";

${buildInterface("Transaction", interfaceLines)}

${buildFetchHook("TransactionRow", endpointUrl, "Transaction")}

export function TransactionTable() {
  const { data, loading, error } = useTransactionRowData();

  if (loading) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#71717a", fontFamily: "monospace" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#ef4444", fontFamily: "monospace" }}>Error: {error}</div>;
  if (!data) return null;

  const transactions = Array.isArray(data) ? data : [data];

  return (
    <div style={{ borderRadius: "12px", border: "1px solid #e4e4e7", backgroundColor: "#ffffff", overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e4e4e7", backgroundColor: "#f4f4f5", textAlign: "left", fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#71717a" }}>
            <th style={{ padding: "0.75rem 1rem" }}>Date</th>
${merchantField ? `            <th style={{ padding: "0.75rem 1rem" }}>Merchant / Payee</th>\n` : ""}${descriptionField ? `            <th style={{ padding: "0.75rem 1rem" }}>Description</th>\n` : ""}${categoryField ? `            <th style={{ padding: "0.75rem 1rem" }}>Category</th>\n` : ""}${statusField ? `            <th style={{ padding: "0.75rem 1rem" }}>Status</th>\n` : ""}            <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody style={{ fontFamily: "monospace" }}>
          {transactions.map((tx, idx) => (
            <tr key={tx.${idField}} style={{ borderBottom: idx === transactions.length - 1 ? "none" : "1px solid #f4f4f5" }}>
              <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#71717a" }}>{tx.${dateField}}</td>
${merchantField ? `              <td style={{ padding: "0.75rem 1rem", fontFamily: "sans-serif", fontWeight: 500, color: "#18181b" }}>{tx.${merchantField}}</td>\n` : ""}${descriptionField ? `              <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#52525b" }}>{tx.${descriptionField}}</td>\n` : ""}${categoryField ? `              <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem" }}><span style={{ padding: "0.125rem 0.5rem", borderRadius: "4px", backgroundColor: "#f4f4f5", color: "#52525b" }}>{tx.${categoryField}}</span></td>\n` : ""}${
            statusField
                ? `              <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem" }}>
                {tx.${statusField} && (
                  <span style={{ padding: "0.125rem 0.5rem", borderRadius: "4px", textTransform: "uppercase", fontWeight: 600, fontSize: "10px", backgroundColor: "#f4f4f5", color: "#3f3f46" }}>
                    {String(tx.${statusField})}
                  </span>
                )}
              </td>\n`
                : ""
        }              <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 700, color: "#18181b" }}>
                {tx.${amountField}}${currencyField ? ` {tx.${currencyField}}` : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
    },
    htmlCode: (fields, endpointUrl) => {
        const amountField =
            findFieldByDataType(fields, ["finance.amount", "commerce.price"]) ??
            findField(fields, ["amount", "price", "value", "cost"]) ??
            "amount";
        const dateField =
            findFieldByDataType(fields, ["date.anytime", "date.past", "date.recent"]) ??
            findField(fields, ["date", "createdat", "timestamp", "time"]) ??
            "date";
        const currencyField =
            findFieldByDataType(fields, ["finance.currencyCode", "finance.currencySymbol"]) ??
            findField(fields, ["currency", "currencycode", "symbol"]);
        const statusField =
            findFieldByDataType(fields, ["datatype.boolean"]) ??
            findField(fields, ["status", "state"]);
        const descriptionField =
            findFieldByDataType(fields, ["lorem.sentence", "company.catchPhrase"]) ??
            findField(fields, ["description", "note", "title", "details"]);
        const merchantField =
            findFieldByDataType(fields, ["company.name", "person.fullName"]) ??
            findField(fields, ["merchant", "payee", "company", "vendor"]);
        const categoryField =
            findFieldByDataType(fields, ["commerce.department", "book.genre"]) ??
            findField(fields, ["category", "type", "department"]);

        const merchantTh = merchantField ? `<th>Merchant</th>` : "";
        const descTh = descriptionField ? `<th>Description</th>` : "";
        const categoryTh = categoryField ? `<th>Category</th>` : "";
        const statusTh = statusField ? `<th>Status</th>` : "";

        const merchantTd = merchantField
            ? `\${${safeGet(merchantField)} ? \`<td style="font-weight:500">\${${safeGet(merchantField)}}</td>\` : '<td></td>'}`
            : "";
        const descTd = descriptionField
            ? `\${${safeGet(descriptionField)} ? \`<td style="color:var(--muted);font-size:.8rem">\${${safeGet(descriptionField)}}</td>\` : '<td></td>'}`
            : "";
        const categoryTd = categoryField
            ? `\${${safeGet(categoryField)} ? \`<td><span class="badge badge-zinc">\${${safeGet(categoryField)}}</span></td>\` : '<td></td>'}`
            : "";
        const statusTd = statusField
            ? `\${${safeGet(statusField)} ? \`<td><span class="badge badge-zinc" style="text-transform:uppercase">\${${safeGet(statusField)}}</span></td>\` : '<td></td>'}`
            : "";
        const amountDisplay = currencyField
            ? `\${${safeGet(amountField)}} \${${safeGet(currencyField)}}`
            : `\${${safeGet(amountField)}}`;

        const renderFn = `item => \`<tr>
  <td style="font-size:.8rem;color:var(--muted)">\${${safeGet(dateField)}}</td>
  ${merchantTd}
  ${descTd}
  ${categoryTd}
  ${statusTd}
  <td class="amount">${amountDisplay}</td>
</tr>\``;

        const theadCols = `<th>Date</th>${merchantTh}${descTh}${categoryTh}${statusTh}<th style="text-align:right">Amount</th>`;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transaction Table</title>
  <style>
${buildHtmlStyles()}
  </style>
</head>
<body>
  <p id="error"></p>
  <div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
    <table>
      <thead><tr>${theadCols}</tr></thead>
      <tbody id="root"></tbody>
    </table>
  </div>
  <script type="module">
${buildHtmlFetchScript(endpointUrl, renderFn)}
  </script>
</body>
</html>
`;
    },
};

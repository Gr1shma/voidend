import type { ComponentTemplate } from "./types";
import {
    buildFetchHook,
    buildInterface,
    buildHtmlFetchScript,
    buildHtmlStyles,
    safeGet,
} from "./codegen-utils";

function normalize(s: string): string {
    return s.toLowerCase().replace(/[_\s-]/g, "");
}

function mapDataTypeToTsType(dataType: string): string {
    const dt = dataType.toLowerCase();
    if (dt.includes("boolean") || dt.includes("datatype.boolean")) {
        return "boolean";
    }
    if (
        dt.includes("number.int") ||
        dt.includes("number.float") ||
        dt.includes("number.bigint") ||
        dt.includes("number.hex") ||
        dt.includes("commerce.price") ||
        dt.includes("finance.amount") ||
        dt.includes("location.latitude") ||
        dt.includes("location.longitude")
    ) {
        return "number";
    }
    return "string";
}

function renderPropAccess(path: string | undefined): string {
    if (!path) return "undefined";
    if (path.includes(".")) {
        return `item?.["${path}"]`;
    }
    return `item.${path}`;
}

export const dynamicGridTemplate: ComponentTemplate = {
    id: "dynamic-grid",
    name: "Dynamic Card Grid",
    description: "Adaptive UI card generated directly from schema fields and Faker types.",
    requiredFields: [],
    optionalFields: [],
    code: (fields, endpointUrl, options) => {
        const validFields = fields.filter((f) => f.fieldName.trim().length > 0);

        const idField =
            validFields.find((f) => {
                const norm = normalize(f.fieldName);
                const dt = normalize(f.dataType);
                return (
                    norm === "id" ||
                    norm.includes("uuid") ||
                    norm.endsWith("id") ||
                    dt.includes("uuid") ||
                    dt.includes("nanoid")
                );
            })?.fieldName ??
            validFields[0]?.fieldName ??
            "id";

        const titleField = validFields.find((f) => {
            const norm = normalize(f.fieldName);
            const dt = normalize(f.dataType);
            return (
                norm.includes("name") ||
                norm.includes("title") ||
                norm.includes("label") ||
                norm.includes("username") ||
                norm.includes("user") ||
                norm.includes("product") ||
                norm.includes("dish") ||
                norm.includes("vehicle") ||
                dt.includes("fullname") ||
                dt.includes("firstname") ||
                dt.includes("lastname") ||
                dt.includes("username") ||
                dt.includes("productname") ||
                dt.includes("company.name") ||
                dt.includes("book.title") ||
                dt.includes("food.dish") ||
                dt.includes("vehicle.vehicle")
            );
        })?.fieldName;

        const subtitleField = validFields.find((f) => {
            const norm = normalize(f.fieldName);
            const dt = normalize(f.dataType);
            return (
                f.fieldName !== titleField &&
                (norm.includes("username") ||
                    norm.includes("user") ||
                    norm.includes("role") ||
                    norm.includes("job") ||
                    norm.includes("category") ||
                    norm.includes("department") ||
                    norm.includes("status") ||
                    norm.includes("author") ||
                    dt.includes("username") ||
                    dt.includes("jobtitle") ||
                    dt.includes("email") ||
                    dt.includes("domainname") ||
                    dt.includes("department") ||
                    dt.includes("book.author") ||
                    dt.includes("vehicle.manufacturer"))
            );
        })?.fieldName;

        const avatarField = validFields.find((f) => {
            const norm = normalize(f.fieldName);
            const dt = normalize(f.dataType);
            return (
                norm.includes("avatar") ||
                norm.includes("image") ||
                norm.includes("photo") ||
                norm.includes("picture") ||
                norm.includes("cover") ||
                dt.includes("image.avatar") ||
                dt.includes("image.url") ||
                dt.includes("image.datauri")
            );
        })?.fieldName;

        const descriptionField = validFields.find((f) => {
            const norm = normalize(f.fieldName);
            const dt = normalize(f.dataType);
            return (
                f.fieldName !== titleField &&
                f.fieldName !== subtitleField &&
                (norm.includes("bio") ||
                    norm.includes("description") ||
                    norm.includes("comment") ||
                    norm.includes("summary") ||
                    norm.includes("catchphrase") ||
                    dt.includes("person.bio") ||
                    dt.includes("lorem.paragraph") ||
                    dt.includes("lorem.paragraphs") ||
                    dt.includes("lorem.sentence") ||
                    dt.includes("commerce.productdescription") ||
                    dt.includes("company.catchphrase"))
            );
        })?.fieldName;

        const detailFields = validFields.filter(
            (f) =>
                f.fieldName !== idField &&
                f.fieldName !== titleField &&
                f.fieldName !== subtitleField &&
                f.fieldName !== avatarField &&
                f.fieldName !== descriptionField,
        );

        const interfaceLines = validFields.map((f) => {
            if (f.fieldName.includes(".")) {
                return `"${f.fieldName}"?: ${mapDataTypeToTsType(f.dataType)};`;
            }
            return `${f.fieldName}: ${mapDataTypeToTsType(f.dataType)};`;
        });

        return `import { useEffect, useState } from "react";

${buildInterface("DataItem", interfaceLines)}

${buildFetchHook("DataItem", endpointUrl, "DataItem", options)}

export function DataCardList() {
  const { data, loading, error } = useDataItemData();

  if (loading) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#71717a", fontFamily: "monospace" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#ef4444", fontFamily: "monospace" }}>Error: {error}</div>;
  if (!data) return <></>;

  const items = Array.isArray(data) ? data : [data];

  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
      {items.map((item, idx) => (
        <div
          key={String(${renderPropAccess(idField)} ?? idx)}
          style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: "12px", border: "1px solid #e4e4e7", padding: "1rem", backgroundColor: "#ffffff", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
${
    avatarField
        ? `              {${renderPropAccess(avatarField)} ? (
                <img
                  src={String(${renderPropAccess(avatarField)})}
                  alt="Avatar"
                  style={{ height: "2.75rem", width: "2.75rem", borderRadius: "9999px", objectFit: "cover", flexShrink: 0, border: "1px solid #e4e4e7" }}
                />
              ) : (
                <div style={{ display: "flex", height: "2.75rem", width: "2.75rem", alignItems: "center", justifyContent: "center", borderRadius: "9999px", backgroundColor: "#f4f4f5", fontWeight: 700, color: "#52525b", flexShrink: 0, border: "1px solid #e4e4e7" }}>
                  {${titleField ? `String(${renderPropAccess(titleField)} ?? "").charAt(0).toUpperCase() || ` : ""} "#"}
                </div>
              )}`
        : `              <div style={{ display: "flex", height: "2.75rem", width: "2.75rem", alignItems: "center", justifyContent: "center", borderRadius: "8px", backgroundColor: "#f4f4f5", fontWeight: 700, color: "#52525b", flexShrink: 0, border: "1px solid #e4e4e7" }}>
                {${titleField ? `String(${renderPropAccess(titleField)} ?? "").charAt(0).toUpperCase() || ` : ""} "D"}
              </div>`
}
              <div style={{ minWidth: 0, flex: 1 }}>
${
    titleField
        ? `                <h4 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, fontSize: "0.875rem", color: "#18181b" }}>{${renderPropAccess(titleField)}}</h4>\n`
        : `                <h4 style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, fontSize: "0.875rem", color: "#18181b" }}>Item #{idx + 1}</h4>\n`
}${subtitleField ? `                <p style={{ margin: "0.125rem 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.75rem", color: "#71717a", fontFamily: "monospace" }}>{${renderPropAccess(subtitleField)}}</p>\n` : ""}              </div>
            </div>

${descriptionField ? `            <p style={{ margin: 0, fontSize: "0.75rem", color: "#52525b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{${renderPropAccess(descriptionField)}}</p>\n` : ""}          </div>

${
    detailFields.length > 0
        ? `          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f4f4f5", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
${detailFields
    .map((f) => {
        const propAccess = renderPropAccess(f.fieldName);
        return `            {${propAccess} !== undefined && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#a1a1aa", fontFamily: "monospace", fontSize: "11px", fontWeight: 500 }}>${f.fieldName}:</span>
                <span style={{ fontFamily: "monospace", color: "#3f3f46", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "11px" }}>{String(${propAccess})}</span>
              </div>
            )}`;
    })
    .join("\n")}
          </div>\n`
        : ""
}        </div>
      ))}
    </div>
  );
}
`;
    },
    htmlCode: (fields, endpointUrl, options) => {
        const validFields = fields.filter((f) => f.fieldName.trim().length > 0);

        const idField =
            validFields.find((f) => {
                const n = normalize(f.fieldName);
                const d = normalize(f.dataType);
                return (
                    n === "id" ||
                    n.includes("uuid") ||
                    n.endsWith("id") ||
                    d.includes("uuid") ||
                    d.includes("nanoid")
                );
            })?.fieldName ??
            validFields[0]?.fieldName ??
            "id";

        const titleField = validFields.find((f) => {
            const n = normalize(f.fieldName);
            const d = normalize(f.dataType);
            return (
                n.includes("name") ||
                n.includes("title") ||
                n.includes("label") ||
                n.includes("username") ||
                n.includes("user") ||
                d.includes("fullname") ||
                d.includes("firstname") ||
                d.includes("productname") ||
                d.includes("food.dish") ||
                d.includes("vehicle.vehicle")
            );
        })?.fieldName;

        const subtitleField = validFields.find((f) => {
            const n = normalize(f.fieldName);
            const d = normalize(f.dataType);
            return (
                f.fieldName !== titleField &&
                (n.includes("username") ||
                    n.includes("role") ||
                    n.includes("job") ||
                    n.includes("category") ||
                    n.includes("status") ||
                    d.includes("username") ||
                    d.includes("jobtitle") ||
                    d.includes("email"))
            );
        })?.fieldName;

        const avatarField = validFields.find((f) => {
            const n = normalize(f.fieldName);
            const d = normalize(f.dataType);
            return (
                n.includes("avatar") ||
                n.includes("image") ||
                n.includes("photo") ||
                n.includes("picture") ||
                d.includes("image.avatar") ||
                d.includes("image.url")
            );
        })?.fieldName;

        const descriptionField = validFields.find((f) => {
            const n = normalize(f.fieldName);
            const d = normalize(f.dataType);
            return (
                f.fieldName !== titleField &&
                f.fieldName !== subtitleField &&
                (n.includes("bio") ||
                    n.includes("description") ||
                    n.includes("comment") ||
                    n.includes("summary") ||
                    d.includes("lorem.paragraph") ||
                    d.includes("person.bio"))
            );
        })?.fieldName;

        const detailFields = validFields.filter(
            (f) =>
                f.fieldName !== idField &&
                f.fieldName !== titleField &&
                f.fieldName !== subtitleField &&
                f.fieldName !== avatarField &&
                f.fieldName !== descriptionField,
        );

        const avatarHtml = avatarField
            ? `\${${safeGet(avatarField)} ? \`<img class="avatar" src="\${${safeGet(avatarField)}}" alt="avatar">\` : \`<div class="avatar-placeholder">\${String(${safeGet(titleField)}).charAt(0).toUpperCase() || '#'}</div>\`}`
            : `<div class="avatar-placeholder">${titleField ? `\${String(${safeGet(titleField)}).charAt(0).toUpperCase() || 'D'}` : "D"}</div>`;

        const titleHtml = titleField
            ? `<div class="card-title">\${${safeGet(titleField)}}</div>`
            : `<div class="card-title">Item</div>`;
        const subtitleHtml = subtitleField
            ? `\${${safeGet(subtitleField)} ? \`<div class="card-sub">\${${safeGet(subtitleField)}}</div>\` : ''}`
            : "";
        const descHtml = descriptionField
            ? `\${${safeGet(descriptionField)} ? \`<div class="card-desc">\${${safeGet(descriptionField)}}</div>\` : ''}`
            : "";
        const detailsHtml =
            detailFields.length > 0
                ? `<div class="details">\${[${detailFields.map((f) => `[${JSON.stringify(f.fieldName)}, ${safeGet(f.fieldName)}]`).join(", ")}].filter(([,v]) => v !== undefined && v !== '').map(([k,v]) => \`<div class="detail-row"><span class="detail-key">\${k}:</span><span>\${v}</span></div>\`).join('')}</div>`
                : "";

        const renderFn = `item => \`<div class="card">
  <div class="card-header">
    ${avatarHtml}
    <div style="min-width:0;flex:1">
      ${titleHtml}
      ${subtitleHtml}
    </div>
  </div>
  ${descHtml}
  ${detailsHtml}
</div>\``;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Card Grid</title>
  <style>
${buildHtmlStyles()}
  </style>
</head>
<body>
  <p id="error"></p>
  <div id="root" class="grid"></div>
  <script type="module">
${buildHtmlFetchScript(endpointUrl, renderFn, options)}
  </script>
</body>
</html>
`;
    },
};

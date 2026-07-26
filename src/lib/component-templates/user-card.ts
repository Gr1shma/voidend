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

export const userCardTemplate: ComponentTemplate = {
    id: "user-card",
    name: "User Card",
    description: "Avatar + profile details grid. Adapts to present fields.",
    requiredFields: [
        "$faker.person.fullName",
        "$faker.person.firstName",
        "$faker.person.lastName",
        "$faker.internet.username",
    ],
    optionalFields: [
        "$faker.internet.email",
        "$faker.person.jobTitle",
        "$faker.phone.number",
        "$faker.person.bio",
        "$faker.image.avatar",
        "$faker.string.uuid",
    ],
    code: (fields, endpointUrl, options) => {
        const idField =
            findFieldByDataType(fields, ["string.uuid", "string.nanoid", "number.int"]) ??
            findField(fields, ["id", "userid", "uuid"]) ??
            fields[0]?.fieldName ??
            "id";
        const fullNameField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "person.lastName",
            ]) ??
            findField(fields, ["fullname", "name", "displayname", "author", "username", "user"]) ??
            fields[0]?.fieldName;
        const usernameField =
            findFieldByDataType(fields, ["internet.username"]) ??
            findField(fields, ["username", "handle"]);
        const avatarField =
            findFieldByDataType(fields, ["image.avatar", "image.url", "image.datauri"]) ??
            findField(fields, ["avatar", "image", "photo", "picture"]);
        const emailField =
            findFieldByDataType(fields, ["internet.email"]) ?? findField(fields, ["email"]);
        const jobTitleField =
            findFieldByDataType(fields, ["person.jobTitle"]) ??
            findField(fields, ["jobtitle", "role", "title"]);
        const phoneField =
            findFieldByDataType(fields, ["phone.number", "phone.imei"]) ??
            findField(fields, ["phone", "phonenumber", "mobile", "cell"]);
        const bioField =
            findFieldByDataType(fields, ["person.bio", "lorem.paragraph", "lorem.sentence"]) ??
            findField(fields, ["bio", "about", "description"]);

        const interfaceLines = fields.map((f) => {
            const name = f.fieldName.includes(".") ? `"${f.fieldName}"?` : f.fieldName;
            return `${name}: ${mapTsType(f.dataType)};`;
        });

        return `import { useEffect, useState } from "react";

${buildInterface("User", interfaceLines)}

${buildFetchHook("UserCard", endpointUrl, "User", options)}

export function UserCard() {
  const { data, loading, error } = useUserCardData();

  if (loading) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#71717a" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#ef4444" }}>Error: {error}</div>;
  if (!data) return <></>;

  const users = Array.isArray(data) ? data : [data];

  return (
    <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
      {users.map((user) => (
        <div key={user.${idField}} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderRadius: "12px", border: "1px solid #e4e4e7", padding: "1rem", backgroundColor: "#ffffff", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
${
    avatarField
        ? `            <img
              src={user.${avatarField}}
              alt={user.${fullNameField}}
              style={{ height: "3rem", width: "3rem", borderRadius: "9999px", objectFit: "cover", flexShrink: 0 }}
            />`
        : `            <div style={{ display: "flex", height: "3rem", width: "3rem", alignItems: "center", justifyContent: "center", borderRadius: "9999px", backgroundColor: "#e4e4e7", fontWeight: 600, color: "#52525b", flexShrink: 0 }}>
              {user.${fullNameField}?.charAt(0) || "U"}
            </div>`
}
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500, fontSize: "1rem", color: "#18181b" }}>{user.${fullNameField}}</p>
${usernameField ? `              <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.875rem", color: "#71717a" }}>@{user.${usernameField}}</p>\n` : ""}${jobTitleField ? `              <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.75rem", color: "#a1a1aa" }}>{user.${jobTitleField}}</p>\n` : ""}            </div>
          </div>
${bioField ? `          <p style={{ margin: 0, fontSize: "0.75rem", color: "#52525b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{user.${bioField}}</p>\n` : ""}${
            emailField || phoneField
                ? `          <div style={{ paddingTop: "0.5rem", borderTop: "1px solid #e4e4e7", fontSize: "0.75rem", color: "#71717a", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
${emailField ? `            {user.${emailField} && <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Email: {user.${emailField}}</p>}\n` : ""}${phoneField ? `            {user.${phoneField} && <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Phone: {user.${phoneField}}</p>}\n` : ""}          </div>\n`
                : ""
        }        </div>
      ))}
    </div>
  );
}
`;
    },
    htmlCode: (fields, endpointUrl, options) => {
        const fullNameField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "person.lastName",
            ]) ??
            findField(fields, ["fullname", "name", "displayname", "author", "username", "user"]) ??
            fields[0]?.fieldName;
        const usernameField =
            findFieldByDataType(fields, ["internet.username"]) ??
            findField(fields, ["username", "handle"]);
        const avatarField =
            findFieldByDataType(fields, ["image.avatar", "image.url", "image.datauri"]) ??
            findField(fields, ["avatar", "image", "photo", "picture"]);
        const emailField =
            findFieldByDataType(fields, ["internet.email"]) ?? findField(fields, ["email"]);
        const jobTitleField =
            findFieldByDataType(fields, ["person.jobTitle"]) ??
            findField(fields, ["jobtitle", "role", "title"]);
        const phoneField =
            findFieldByDataType(fields, ["phone.number", "phone.imei"]) ??
            findField(fields, ["phone", "phonenumber", "mobile", "cell"]);
        const bioField =
            findFieldByDataType(fields, ["person.bio", "lorem.paragraph", "lorem.sentence"]) ??
            findField(fields, ["bio", "about", "description"]);

        const avatarHtml = avatarField
            ? `\${${safeGet(avatarField)} ? \`<img class="avatar" src="\${${safeGet(avatarField)}}" alt="\${${safeGet(fullNameField)}}">\` : \`<div class="avatar-placeholder">\${String(${safeGet(fullNameField)}).charAt(0).toUpperCase() || 'U'}</div>\`}`
            : `<div class="avatar-placeholder">\${String(${safeGet(fullNameField)}).charAt(0).toUpperCase() || 'U'}</div>`;

        const extraRows = [
            usernameField
                ? `\${${safeGet(usernameField)} ? \`<div class="detail-row"><span class="detail-key">@username:</span><span>\${${safeGet(usernameField)}}</span></div>\` : ''}`
                : "",
            jobTitleField
                ? `\${${safeGet(jobTitleField)} ? \`<div class="detail-row"><span class="detail-key">role:</span><span>\${${safeGet(jobTitleField)}}</span></div>\` : ''}`
                : "",
            emailField
                ? `\${${safeGet(emailField)} ? \`<div class="detail-row"><span class="detail-key">email:</span><span>\${${safeGet(emailField)}}</span></div>\` : ''}`
                : "",
            phoneField
                ? `\${${safeGet(phoneField)} ? \`<div class="detail-row"><span class="detail-key">phone:</span><span>\${${safeGet(phoneField)}}</span></div>\` : ''}`
                : "",
        ]
            .filter(Boolean)
            .join("\n      ");

        const bioHtml = bioField
            ? `\${${safeGet(bioField)} ? \`<div class="card-desc">\${${safeGet(bioField)}}</div>\` : ''}`
            : "";

        const renderFn = `item => \`<div class="card">
  <div class="card-header">
    ${avatarHtml}
    <div style="min-width:0;flex:1">
      <div class="card-title">\${${safeGet(fullNameField)}}</div>
    </div>
  </div>
  ${bioHtml}
  <div class="details">
    ${extraRows}
  </div>
</div>\``;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Cards</title>
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

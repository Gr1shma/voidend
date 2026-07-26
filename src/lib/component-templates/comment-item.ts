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

export const commentItemTemplate: ComponentTemplate = {
    id: "comment-item",
    name: "Comment Item",
    description: "Avatar + author + comment text list. Handles single or list response.",
    requiredFields: [
        "$faker.lorem.paragraph",
        "$faker.lorem.sentence",
        "$faker.person.fullName",
        "$faker.internet.username",
    ],
    optionalFields: [
        "$faker.image.avatar",
        "$faker.date.recent",
        "$faker.date.past",
        "$faker.string.uuid",
    ],
    code: (fields, endpointUrl) => {
        const idField =
            findFieldByDataType(fields, ["string.uuid", "string.nanoid", "number.int"]) ??
            findField(fields, ["id", "commentid", "uuid"]) ??
            fields[0]?.fieldName ??
            "id";
        const authorField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "internet.username",
            ]) ??
            findField(fields, ["author", "fullname", "username", "name"]) ??
            "author";
        const commentField =
            findFieldByDataType(fields, ["lorem.paragraph", "lorem.sentence", "lorem.sentences"]) ??
            findField(fields, ["comment", "message", "content", "text"]) ??
            "comment";
        const avatarField =
            findFieldByDataType(fields, ["image.avatar", "image.url", "image.datauri"]) ??
            findField(fields, ["avatar", "image", "photo"]);
        const createdAtField =
            findFieldByDataType(fields, ["date.recent", "date.past", "date.anytime"]) ??
            findField(fields, ["createdat", "date", "timestamp"]);

        const interfaceLines = fields.map((f) => {
            const name = f.fieldName.includes(".") ? `"${f.fieldName}"?` : f.fieldName;
            return `${name}: ${mapTsType(f.dataType)};`;
        });

        return `import { useEffect, useState } from "react";

${buildInterface("Comment", interfaceLines)}

${buildFetchHook("CommentItem", endpointUrl, "Comment")}

export function CommentList() {
  const { data, loading, error } = useCommentItemData();

  if (loading) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#71717a" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#ef4444" }}>Error: {error}</div>;
  if (!data) return null;

  const comments = Array.isArray(data) ? data : [data];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {comments.map((comment) => (
        <div key={comment.${idField}} style={{ display: "flex", gap: "0.75rem" }}>
${avatarField ? `          <img src={comment.${avatarField}} alt={comment.${authorField}} style={{ height: "2rem", width: "2rem", borderRadius: "9999px", objectFit: "cover", flexShrink: 0 }} />\n` : ""}          <div style={{ minWidth: 0, flex: 1, borderRadius: "12px", border: "1px solid #e4e4e7", padding: "0.75rem", backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#18181b" }}>{comment.${authorField}}</span>
${createdAtField ? `              <span style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>{comment.${createdAtField}}</span>\n` : ""}            </div>
            <p style={{ marginTop: "0.25rem", marginBottom: 0, fontSize: "0.875rem", color: "#52525b", lineHeight: 1.5 }}>{comment.${commentField}}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
`;
    },
    htmlCode: (fields, endpointUrl) => {
        const authorField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "internet.username",
            ]) ??
            findField(fields, ["author", "fullname", "username", "name"]) ??
            "author";
        const commentField =
            findFieldByDataType(fields, ["lorem.paragraph", "lorem.sentence", "lorem.sentences"]) ??
            findField(fields, ["comment", "message", "content", "text"]) ??
            "comment";
        const avatarField =
            findFieldByDataType(fields, ["image.avatar", "image.url", "image.datauri"]) ??
            findField(fields, ["avatar", "image", "photo"]);
        const createdAtField =
            findFieldByDataType(fields, ["date.recent", "date.past", "date.anytime"]) ??
            findField(fields, ["createdat", "date", "timestamp"]);

        const avatarHtml = avatarField
            ? `\${${safeGet(avatarField)} ? \`<img class="avatar" style="flex-shrink:0;align-self:flex-start" src="\${${safeGet(avatarField)}}" alt="avatar">\` : \`<div class="avatar-placeholder" style="flex-shrink:0;align-self:flex-start">\${String(${safeGet(authorField)}).charAt(0).toUpperCase() || 'U'}</div>\`}`
            : `<div class="avatar-placeholder" style="flex-shrink:0;align-self:flex-start">\${String(${safeGet(authorField)}).charAt(0).toUpperCase() || 'U'}</div>`;

        const dateHtml = createdAtField
            ? `\${${safeGet(createdAtField)} ? \`<span class="comment-date">\${${safeGet(createdAtField)}}</span>\` : ''}`
            : "";

        const renderFn = `item => \`<div class="comment">
  ${avatarHtml}
  <div class="comment-body">
    <div class="comment-meta">
      <span class="comment-author">\${${safeGet(authorField)}}</span>
      ${dateHtml}
    </div>
    <p class="comment-text">\${${safeGet(commentField)}}</p>
  </div>
</div>\``;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comments</title>
  <style>
${buildHtmlStyles()}
  </style>
</head>
<body>
  <p id="error"></p>
  <div id="root" class="comment-list"></div>
  <script type="module">
${buildHtmlFetchScript(endpointUrl, renderFn)}
  </script>
</body>
</html>
`;
    },
};

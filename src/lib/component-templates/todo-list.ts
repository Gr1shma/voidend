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

export const todoListTemplate: ComponentTemplate = {
    id: "todo-list",
    name: "Todo List",
    description: "Checkbox list adaptively rendering title, status, priority, dates & tags.",
    requiredFields: ["$faker.lorem.words", "$faker.lorem.sentence", "$faker.datatype.boolean"],
    optionalFields: [
        "$faker.date.future",
        "$faker.date.recent",
        "$faker.person.firstName",
        "$faker.person.fullName",
        "$faker.lorem.paragraph",
        "$faker.string.uuid",
    ],
    code: (fields, endpointUrl, options) => {
        const idField =
            findFieldByDataType(fields, ["string.uuid", "string.nanoid", "number.int"]) ??
            findField(fields, ["id", "todoid", "uuid"]) ??
            fields[0]?.fieldName ??
            "id";
        const titleField =
            findFieldByDataType(fields, [
                "lorem.words",
                "lorem.word",
                "lorem.sentence",
                "system.fileName",
            ]) ??
            findField(fields, ["title", "task", "name", "summary", "text", "description"]) ??
            fields.find((f) => f.fieldName !== idField)?.fieldName ??
            fields[0]?.fieldName;
        const completedField =
            findFieldByDataType(fields, ["datatype.boolean"]) ??
            findField(fields, ["completed", "done", "isdone", "iscompleted", "status"]);
        const dueDateField =
            findFieldByDataType(fields, [
                "date.future",
                "date.recent",
                "date.anytime",
                "date.soon",
            ]) ?? findField(fields, ["duedate", "deadline", "date", "due"]);
        const priorityField =
            findFieldByDataType(fields, ["color.human", "lorem.word"]) ??
            findField(fields, ["priority", "level", "urgency"]);
        const categoryField =
            findFieldByDataType(fields, ["commerce.department", "book.genre"]) ??
            findField(fields, ["category", "tag", "project", "label"]);
        const assigneeField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "internet.username",
            ]) ?? findField(fields, ["assignee", "assignedto", "user", "owner"]);
        const descriptionField =
            findFieldByDataType(fields, ["lorem.paragraph", "lorem.sentence"]) ??
            findField(fields, ["description", "details", "notes"]);

        const interfaceLines = fields.map((f) => {
            const name = f.fieldName.includes(".") ? `"${f.fieldName}"?` : f.fieldName;
            return `${name}: ${mapTsType(f.dataType)};`;
        });

        return `import { useEffect, useState } from "react";

${buildInterface("Todo", interfaceLines)}

${buildFetchHook("TodoList", endpointUrl, "Todo", options)}

export function TodoList() {
  const { data, loading, error } = useTodoListData();

  if (loading) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#71717a" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#ef4444" }}>Error: {error}</div>;
  if (!data) return <></>;

  const todos = Array.isArray(data) ? data : [data];

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, border: "1px solid #e4e4e7", borderRadius: "12px", backgroundColor: "#ffffff", overflow: "hidden" }}>
      {todos.map((todo, idx) => (
        <li key={todo.${idField}} style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.75rem 1rem", borderBottom: idx === todos.length - 1 ? "none" : "1px solid #e4e4e7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <input
              type="checkbox"
              checked={${completedField ? `Boolean(todo.${completedField})` : "false"}}
              readOnly
              style={{ height: "1rem", width: "1rem", borderRadius: "4px", accentColor: "#6366f1", cursor: "pointer" }}
            />
            <span style={{ flex: 1, fontWeight: 500, fontSize: "0.875rem", color: ${completedField ? `todo.${completedField} ? "#a1a1aa" : "#18181b"` : '"#18181b"'}, textDecoration: ${completedField ? `todo.${completedField} ? "line-through" : "none"` : '"none"'} }}>
              {${titleField ? `todo.${titleField}` : `"Task"`}}
            </span>
${priorityField ? `            {todo.${priorityField} && <span style={{ padding: "0.125rem 0.5rem", borderRadius: "4px", fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", fontWeight: 600, backgroundColor: "#fef3c7", color: "#92400e" }}>{todo.${priorityField}}</span>}\n` : ""}${categoryField ? `            {todo.${categoryField} && <span style={{ padding: "0.125rem 0.5rem", borderRadius: "4px", fontSize: "10px", fontFamily: "monospace", backgroundColor: "#f4f4f5", color: "#52525b" }}>{todo.${categoryField}}</span>}\n` : ""}          </div>

${
    descriptionField
        ? `          {todo.${descriptionField} && (
            <p style={{ marginLeft: "1.75rem", marginTop: 0, marginBottom: 0, fontSize: "0.75rem", color: "#71717a", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{todo.${descriptionField}}</p>
          )}\n`
        : ""
}${
            dueDateField || assigneeField
                ? `          <div style={{ marginLeft: "1.75rem", display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.75rem", color: "#a1a1aa" }}>
${dueDateField ? `            {todo.${dueDateField} && <span>Due: {todo.${dueDateField}}</span>}\n` : ""}${assigneeField ? `            {todo.${assigneeField} && <span>Assignee: {todo.${assigneeField}}</span>}\n` : ""}          </div>\n`
                : ""
        }        </li>
      ))}
    </ul>
  );
}
`;
    },
    htmlCode: (fields, endpointUrl, options) => {
        const idField =
            findFieldByDataType(fields, ["string.uuid", "string.nanoid", "number.int"]) ??
            findField(fields, ["id", "todoid", "uuid"]) ??
            fields[0]?.fieldName ??
            "id";
        const titleField =
            findFieldByDataType(fields, [
                "lorem.words",
                "lorem.word",
                "lorem.sentence",
                "system.fileName",
            ]) ??
            findField(fields, ["title", "task", "name", "summary", "text", "description"]) ??
            fields.find((f) => f.fieldName !== idField)?.fieldName ??
            fields[0]?.fieldName;
        const completedField =
            findFieldByDataType(fields, ["datatype.boolean"]) ??
            findField(fields, ["completed", "done", "isdone", "iscompleted", "status"]);
        const dueDateField =
            findFieldByDataType(fields, [
                "date.future",
                "date.recent",
                "date.anytime",
                "date.soon",
            ]) ?? findField(fields, ["duedate", "deadline", "date", "due"]);
        const priorityField =
            findFieldByDataType(fields, ["color.human", "lorem.word"]) ??
            findField(fields, ["priority", "level", "urgency"]);
        const categoryField =
            findFieldByDataType(fields, ["commerce.department", "book.genre"]) ??
            findField(fields, ["category", "tag", "project", "label"]);
        const descriptionField =
            findFieldByDataType(fields, ["lorem.paragraph", "lorem.sentence"]) ??
            findField(fields, ["description", "details", "notes"]);
        const assigneeField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "internet.username",
            ]) ?? findField(fields, ["assignee", "assignedto", "user", "owner"]);

        const priorityBadge = priorityField
            ? `\${${safeGet(priorityField)} ? \`<span class="badge badge-amber">\${${safeGet(priorityField)}}</span>\` : ''}`
            : "";
        const categoryBadge = categoryField
            ? `\${${safeGet(categoryField)} ? \`<span class="badge badge-zinc">\${${safeGet(categoryField)}}</span>\` : ''}`
            : "";
        const descHtml = descriptionField
            ? `\${${safeGet(descriptionField)} ? \`<div style="margin-left:1.6rem;font-size:.78rem;color:var(--muted)">\${${safeGet(descriptionField)}}</div>\` : ''}`
            : "";
        const dueDateHtml = dueDateField
            ? `\${${safeGet(dueDateField)} ? \`<span style="font-size:.72rem;color:var(--muted)">Due: \${${safeGet(dueDateField)}}</span>\` : ''}`
            : "";
        const assigneeHtml = assigneeField
            ? `\${${safeGet(assigneeField)} ? \`<span style="font-size:.72rem;color:var(--muted)">Assignee: \${${safeGet(assigneeField)}}</span>\` : ''}`
            : "";

        const renderFn = `item => \`<li class="todo-item">
  <div class="todo-row">
    <input type="checkbox" \${item[${JSON.stringify(completedField)}] ? 'checked' : ''} onclick="return false" style="width:16px;height:16px;flex-shrink:0">
    <span class="todo-title \${item[${JSON.stringify(completedField)}] ? 'done' : ''}">\${${safeGet(titleField)}}</span>
    ${priorityBadge}
    ${categoryBadge}
  </div>
  ${descHtml}
  <div style="margin-left:1.6rem;display:flex;gap:.75rem">${dueDateHtml}${assigneeHtml}</div>
</li>\``;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo List</title>
  <style>
${buildHtmlStyles()}
  </style>
</head>
<body>
  <p id="error"></p>
  <ul id="root" class="todo-list"></ul>
  <script type="module">
${buildHtmlFetchScript(endpointUrl, renderFn, options)}
  </script>
</body>
</html>
`;
    },
};

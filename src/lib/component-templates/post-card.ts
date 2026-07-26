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

export const postCardTemplate: ComponentTemplate = {
    id: "post-card",
    name: "Post Card",
    description: "Cover image + title + excerpt list. Handles single or list response.",
    requiredFields: [
        "$faker.lorem.sentence",
        "$faker.lorem.paragraph",
        "$faker.lorem.paragraphs",
        "$faker.book.title",
    ],
    optionalFields: [
        "$faker.person.fullName",
        "$faker.internet.username",
        "$faker.image.url",
        "$faker.date.anytime",
        "$faker.date.past",
        "$faker.date.recent",
        "$faker.string.uuid",
    ],
    code: (fields, endpointUrl) => {
        const idField =
            findFieldByDataType(fields, ["string.uuid", "string.nanoid", "number.int"]) ??
            findField(fields, ["id", "postid", "uuid"]) ??
            fields[0]?.fieldName ??
            "id";
        const titleField =
            findFieldByDataType(fields, ["book.title", "lorem.sentence", "company.catchPhrase"]) ??
            findField(fields, ["title"]) ??
            "title";
        const contentField =
            findFieldByDataType(fields, ["lorem.paragraph", "lorem.paragraphs", "person.bio"]) ??
            findField(fields, ["content", "body", "paragraph"]) ??
            "content";
        const authorField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "internet.username",
                "book.author",
            ]) ?? findField(fields, ["author", "fullname", "username"]);
        const coverImageField =
            findFieldByDataType(fields, ["image.url", "image.datauri"]) ??
            findField(fields, ["coverimage", "image", "thumbnail"]);
        const publishedAtField =
            findFieldByDataType(fields, [
                "date.anytime",
                "date.past",
                "date.future",
                "date.recent",
            ]) ?? findField(fields, ["publishedat", "createdat", "date"]);

        const interfaceLines = fields.map((f) => {
            const name = f.fieldName.includes(".") ? `"${f.fieldName}"?` : f.fieldName;
            return `${name}: ${mapTsType(f.dataType)};`;
        });

        return `import { useEffect, useState } from "react";

${buildInterface("Post", interfaceLines)}

${buildFetchHook("PostCard", endpointUrl, "Post")}

export function PostCard() {
  const { data, loading, error } = usePostCardData();

  if (loading) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#71717a" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#ef4444" }}>Error: {error}</div>;
  if (!data) return null;

  const posts = Array.isArray(data) ? data : [data];

  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
      {posts.map((post) => (
        <article key={post.${idField}} style={{ overflow: "hidden", borderRadius: "12px", border: "1px solid #e4e4e7", backgroundColor: "#ffffff", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
${coverImageField ? `          <img src={post.${coverImageField}} alt={post.${titleField}} style={{ height: "10rem", width: "100%", objectFit: "cover" }} />\n` : ""}          <div style={{ padding: "1rem" }}>
            <h3 style={{ margin: 0, fontWeight: 600, fontSize: "1rem", color: "#18181b" }}>{post.${titleField}}</h3>
            <p style={{ marginTop: "0.25rem", marginBottom: 0, fontSize: "0.875rem", color: "#71717a", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.${contentField}}</p>
            <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", color: "#a1a1aa" }}>
${authorField ? `              <span>{post.${authorField}}</span>\n` : ""}${publishedAtField ? `              <span>{post.${publishedAtField}}</span>\n` : ""}            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
`;
    },
    htmlCode: (fields, endpointUrl) => {
        const titleField =
            findFieldByDataType(fields, ["book.title", "lorem.sentence", "company.catchPhrase"]) ??
            findField(fields, ["title"]) ??
            "title";
        const contentField =
            findFieldByDataType(fields, ["lorem.paragraph", "lorem.paragraphs", "person.bio"]) ??
            findField(fields, ["content", "body", "paragraph"]) ??
            "content";
        const authorField =
            findFieldByDataType(fields, [
                "person.fullName",
                "person.firstName",
                "internet.username",
                "book.author",
            ]) ?? findField(fields, ["author", "fullname", "username"]);
        const coverImageField =
            findFieldByDataType(fields, ["image.url", "image.datauri"]) ??
            findField(fields, ["coverimage", "image", "thumbnail"]);
        const publishedAtField =
            findFieldByDataType(fields, [
                "date.anytime",
                "date.past",
                "date.future",
                "date.recent",
            ]) ?? findField(fields, ["publishedat", "createdat", "date"]);

        const coverHtml = coverImageField
            ? `\${${safeGet(coverImageField)} ? \`<img class="cover" src="\${${safeGet(coverImageField)}}" alt="cover">\` : ''}`
            : "";
        const authorHtml = authorField
            ? `\${${safeGet(authorField)} ? \`<span>\${${safeGet(authorField)}}</span>\` : ''}`
            : "";
        const dateHtml = publishedAtField
            ? `\${${safeGet(publishedAtField)} ? \`<span>\${${safeGet(publishedAtField)}}</span>\` : ''}`
            : "";

        const renderFn = `item => \`<article class="article">
  ${coverHtml}
  <div class="article-body">
    <div class="article-title">\${${safeGet(titleField)}}</div>
    <div class="article-excerpt">\${${safeGet(contentField)}}</div>
    <div class="article-footer">${authorHtml}${dateHtml}</div>
  </div>
</article>\``;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Post Cards</title>
  <style>
${buildHtmlStyles()}
  .grid { grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
  </style>
</head>
<body>
  <p id="error"></p>
  <div id="root" class="grid"></div>
  <script type="module">
${buildHtmlFetchScript(endpointUrl, renderFn)}
  </script>
</body>
</html>
`;
    },
};

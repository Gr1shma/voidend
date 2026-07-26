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

export const productCardTemplate: ComponentTemplate = {
    id: "product-card",
    name: "Product Card",
    description: "Image + product info card. Gracefully handles present/absent images & tags.",
    requiredFields: [
        "$faker.commerce.productName",
        "$faker.commerce.product",
        "$faker.commerce.price",
        "$faker.finance.amount",
    ],
    optionalFields: [
        "$faker.commerce.productDescription",
        "$faker.commerce.department",
        "$faker.company.name",
        "$faker.image.url",
        "$faker.datatype.boolean",
        "$faker.number.float",
        "$faker.string.uuid",
    ],
    code: (fields, endpointUrl) => {
        const idField =
            findFieldByDataType(fields, ["string.uuid", "string.nanoid", "number.int"]) ??
            findField(fields, ["id", "productid", "uuid"]) ??
            fields[0]?.fieldName ??
            "id";
        const nameField =
            findFieldByDataType(fields, [
                "commerce.productName",
                "commerce.product",
                "food.dish",
                "vehicle.vehicle",
            ]) ??
            findField(fields, ["name", "productname", "title"]) ??
            "name";
        const priceField =
            findFieldByDataType(fields, ["commerce.price", "finance.amount"]) ??
            findField(fields, ["price", "amount", "cost"]) ??
            "price";
        const imageField =
            findFieldByDataType(fields, ["image.url", "image.datauri"]) ??
            findField(fields, ["image", "photo", "picture", "thumbnail", "cover"]);
        const descriptionField =
            findFieldByDataType(fields, [
                "commerce.productDescription",
                "lorem.paragraph",
                "company.catchPhrase",
            ]) ?? findField(fields, ["description", "productdescription", "summary"]);
        const categoryField =
            findFieldByDataType(fields, ["commerce.department", "book.genre"]) ??
            findField(fields, ["category", "department", "genre"]);
        const brandField =
            findFieldByDataType(fields, ["company.name", "vehicle.manufacturer"]) ??
            findField(fields, ["brand", "company", "manufacturer"]);
        const inStockField =
            findFieldByDataType(fields, ["datatype.boolean"]) ??
            findField(fields, ["instock", "available", "isinstock"]);
        const ratingField =
            findFieldByDataType(fields, ["number.float", "number.int"]) ??
            findField(fields, ["rating", "score", "stars"]);

        const interfaceLines = fields.map((f) => {
            const name = f.fieldName.includes(".") ? `"${f.fieldName}"?` : f.fieldName;
            return `${name}: ${mapTsType(f.dataType)};`;
        });

        return `import { useEffect, useState } from "react";

${buildInterface("Product", interfaceLines)}

${buildFetchHook("ProductCard", endpointUrl, "Product")}

export function ProductCard() {
  const { data, loading, error } = useProductCardData();

  if (loading) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#71717a" }}>Loading...</div>;
  if (error) return <div style={{ padding: "1rem", fontSize: "0.875rem", color: "#ef4444" }}>Error: {error}</div>;
  if (!data) return null;

  const products = Array.isArray(data) ? data : [data];

  return (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
      {products.map((product) => (
        <div key={product.${idField}} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", borderRadius: "12px", border: "1px solid #e4e4e7", backgroundColor: "#ffffff", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
          <div>
${
    imageField
        ? `            {product.${imageField} ? (
              <img src={product.${imageField}} alt={product.${nameField}} style={{ height: "11rem", width: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", height: "9rem", width: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f4f5", fontSize: "1.875rem", color: "#a1a1aa" }}>
                📦
              </div>
            )}`
        : `            <div style={{ display: "flex", height: "6rem", width: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f4f5", fontSize: "1.875rem", color: "#a1a1aa" }}>
              📦
            </div>`
}
            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
${categoryField ? `                {product.${categoryField} && <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#71717a" }}>{product.${categoryField}}</span>}\n` : ""}${brandField ? `                {product.${brandField} && <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#a1a1aa" }}>{product.${brandField}}</span>}\n` : ""}              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: "1rem", color: "#18181b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.${nameField}}</p>
${descriptionField ? `              {product.${descriptionField} && <p style={{ margin: 0, fontSize: "0.75rem", color: "#71717a", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.${descriptionField}}</p>}\n` : ""}            </div>
          </div>

          <div style={{ padding: "0.5rem 1rem 1rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #f4f4f5" }}>
            <div>
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#18181b" }}>\${product.${priceField}}</span>
${ratingField ? `              {product.${ratingField} && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#f59e0b" }}>Rating: {product.${ratingField}}</span>}\n` : ""}            </div>

${
    inStockField
        ? `            {product.${inStockField} !== undefined && (
              <span style={{ padding: "0.125rem 0.5rem", fontSize: "10px", fontFamily: "monospace", fontWeight: 600, borderRadius: "4px", backgroundColor: product.${inStockField} ? "#d1fae5" : "#ffe4e6", color: product.${inStockField} ? "#065f46" : "#9f1239" }}>
                {product.${inStockField} ? "In stock" : "Out of stock"}
              </span>
            )}\n`
        : ""
}          </div>
        </div>
      ))}
    </div>
  );
}
`;
    },
    htmlCode: (fields, endpointUrl) => {
        const nameField =
            findFieldByDataType(fields, [
                "commerce.productName",
                "commerce.product",
                "food.dish",
                "vehicle.vehicle",
            ]) ??
            findField(fields, ["name", "productname", "title"]) ??
            "name";
        const priceField =
            findFieldByDataType(fields, ["commerce.price", "finance.amount"]) ??
            findField(fields, ["price", "amount", "cost"]) ??
            "price";
        const imageField =
            findFieldByDataType(fields, ["image.url", "image.datauri"]) ??
            findField(fields, ["image", "photo", "picture", "thumbnail", "cover"]);
        const descriptionField =
            findFieldByDataType(fields, [
                "commerce.productDescription",
                "lorem.paragraph",
                "company.catchPhrase",
            ]) ?? findField(fields, ["description", "productdescription", "summary"]);
        const categoryField =
            findFieldByDataType(fields, ["commerce.department", "book.genre"]) ??
            findField(fields, ["category", "department", "genre"]);
        const brandField =
            findFieldByDataType(fields, ["company.name", "vehicle.manufacturer"]) ??
            findField(fields, ["brand", "company", "manufacturer"]);
        const inStockField =
            findFieldByDataType(fields, ["datatype.boolean"]) ??
            findField(fields, ["instock", "available", "isinstock"]);
        const ratingField =
            findFieldByDataType(fields, ["number.float", "number.int"]) ??
            findField(fields, ["rating", "score", "stars"]);

        const imgHtml = imageField
            ? `\${${safeGet(imageField)} ? \`<img class="product-img" src="\${${safeGet(imageField)}}" alt="product">\` : '<div class="product-img-placeholder">📦</div>'}`
            : `<div class="product-img-placeholder">📦</div>`;

        const categoryBadge = categoryField
            ? `\${${safeGet(categoryField)} ? \`<span class="badge badge-zinc">\${${safeGet(categoryField)}}</span>\` : ''}`
            : "";
        const brandSpan = brandField
            ? `\${${safeGet(brandField)} ? \`<span style="font-size:.75rem;color:var(--muted)">\${${safeGet(brandField)}}</span>\` : ''}`
            : "";
        const descSpan = descriptionField
            ? `\${${safeGet(descriptionField)} ? \`<div class="card-desc" style="padding:0 .85rem">\${${safeGet(descriptionField)}}</div>\` : ''}`
            : "";
        const ratingSpan = ratingField
            ? `\${${safeGet(ratingField)} ? \`<span style="font-size:.78rem;color:#f59e0b">★ \${${safeGet(ratingField)}}</span>\` : ''}`
            : "";
        const inStockBadge = inStockField
            ? `\${item[${JSON.stringify(inStockField)}] !== undefined ? \`<span class="badge \${item[${JSON.stringify(inStockField)}] ? 'badge-emerald' : 'badge-rose'}">\${item[${JSON.stringify(inStockField)}] ? 'In stock' : 'Out of stock'}</span>\` : ''}`
            : "";

        const renderFn = `item => \`<div class="card" style="padding:0;overflow:hidden">
  ${imgHtml}
  <div class="product-body">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
      ${categoryBadge}
      ${brandSpan}
    </div>
    <div class="card-title" style="padding:0">\${${safeGet(nameField)}}</div>
    ${descSpan}
  </div>
  <div class="product-footer">
    <div>
      <span class="price">$\${${safeGet(priceField)}}</span>
      ${ratingSpan}
    </div>
    ${inStockBadge}
  </div>
</div>\``;

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Cards</title>
  <style>
${buildHtmlStyles()}
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

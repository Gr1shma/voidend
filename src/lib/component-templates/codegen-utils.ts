import type { SchemaField } from "~/lib/faker-options";
import type { TemplateOptions } from "./types";

function normalize(s: string): string {
    return s.toLowerCase().replace(/[_\s-]/g, "");
}

export function safeGet(k: string | undefined): string {
    if (!k) return "''";
    if (k.includes(".")) {
        const parts = k.split(".");
        return `(${parts.map((p) => `item?.[${JSON.stringify(p)}]`).join(".") ?? "''"})`;
    }
    return `(item[${JSON.stringify(k)}] ?? '')`;
}

export function mapTsType(dt: string): string {
    const d = dt.toLowerCase();
    if (d.includes("boolean")) return "boolean";
    if (
        d.includes("number") ||
        d.includes("int") ||
        d.includes("float") ||
        d.includes("price") ||
        d.includes("amount")
    )
        return "number";
    return "string";
}

/**
 * Finds a field based on matching its faker dataType string.
 */
export function findFieldByDataType(
    fields: SchemaField[],
    dataTypePatterns: string[],
): string | undefined {
    return fields.find((f) => {
        const dt = f.dataType.toLowerCase();
        return dataTypePatterns.some((pattern) => dt.includes(pattern.toLowerCase()));
    })?.fieldName;
}

/**
 * Finds all fields matching any of the given faker dataType patterns.
 */
export function filterFieldsByDataType(
    fields: SchemaField[],
    dataTypePatterns: string[],
): SchemaField[] {
    return fields.filter((f) => {
        const dt = f.dataType.toLowerCase();
        return dataTypePatterns.some((pattern) => dt.includes(pattern.toLowerCase()));
    });
}

/**
 * Finds the user's actual fieldName matching any of the given candidates
 * (case + separator insensitive). Returns null if none found so the
 * template can decide on a fallback.
 */
export function findField(fields: SchemaField[], candidates: string[]): string | null {
    const normalizedCandidates = new Set(candidates.map(normalize));
    const match = fields.find((f) => normalizedCandidates.has(normalize(f.fieldName)));
    return match ? match.fieldName : null;
}

/**
 * Builds a fetch hook that handles both response shapes from the mock
 * endpoint: a single object (count === 1) or an array (count > 1).
 */
export function buildFetchHook(
    hookName: string,
    endpointUrl: string,
    itemTypeName: string,
    options?: TemplateOptions,
): string {
    const tokenVal = options?.bearerToken || "YOUR_TOKEN_HERE";
    const method = options?.method && options.method !== "GET" ? options.method : undefined;
    const fetchOptions: string[] = [];
    if (method) fetchOptions.push(`method: "${method}"`);
    if (options?.requiresAuth)
        fetchOptions.push(`headers: {\n      "Authorization": "Bearer ${tokenVal}"\n    }`);
    const fetchArgs =
        fetchOptions.length > 0
            ? `"${endpointUrl}", {\n    ${fetchOptions.join(",\n    ")}\n  }`
            : `"${endpointUrl}"`;

    return `function use${hookName}Data() {
  const [data, setData] = useState<${itemTypeName}[] | ${itemTypeName} | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch(${fetchArgs})
      .then((res) => {
        if (!res.ok) throw new Error(\`Request failed: \${res.status}\`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}`;
}

export function buildInterface(name: string, fieldLines: string[]): string {
    return `interface ${name} {
${fieldLines.map((l) => `  ${l}`).join("\n")}
}`;
}

/**
 * Builds a vanilla-JS fetch + DOM-render script block for HTML templates.
 * `renderFn` is a JS expression (string) that maps a single item to an
 * HTML string, the caller provides the item-level template string.
 */
export function buildHtmlFetchScript(
    endpointUrl: string,
    renderFn: string,
    options?: TemplateOptions,
): string {
    const tokenVal = options?.bearerToken || "YOUR_TOKEN_HERE";
    const method = options?.method && options.method !== "GET" ? options.method : undefined;
    const fetchOptions: string[] = [];
    if (method) fetchOptions.push(`method: "${method}"`);
    if (options?.requiresAuth)
        fetchOptions.push(`headers: {\n          "Authorization": "Bearer ${tokenVal}"\n        }`);
    const fetchArgs =
        fetchOptions.length > 0
            ? `"${endpointUrl}", {\n        ${fetchOptions.join(",\n        ")}\n      }`
            : `"${endpointUrl}"`;

    return `  async function loadData() {
    const root = document.getElementById('root');
    const err  = document.getElementById('error');
    root.innerHTML = '<p class="loading">Loading…</p>';
    try {
      const res = await fetch(${fetchArgs});
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      const items = Array.isArray(json) ? json : [json];
      root.innerHTML = items.map(${renderFn}).join('');
    } catch (e) {
      root.innerHTML = '';
      err.textContent = 'Error: ' + e.message;
    }
  }
  loadData();`;
}

/**
 * Returns a baseline CSS string used by all HTML templates:
 * custom properties for color, card grid, avatar, etc.
 */
export function buildHtmlStyles(): string {
    return `  :root {
    --bg: #ffffff;
    --surface: #f4f4f5;
    --border: #e4e4e7;
    --text: #18181b;
    --muted: #71717a;
    --primary: #6366f1;
    --danger: #ef4444;
    --success: #22c55e;
    --radius: 12px;
    --font: system-ui, -apple-system, sans-serif;
    --mono: 'Fira Code', 'Cascadia Code', monospace;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --surface: #18181b;
      --border: #27272a;
      --text: #fafafa;
      --muted: #a1a1aa;
    }
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--font);
    background: var(--bg);
    color: var(--text);
    padding: 1.5rem;
  }
  #error { color: var(--danger); font-family: var(--mono); font-size: .85rem; margin-bottom: 1rem; }
  .loading { color: var(--muted); font-size: .9rem; }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: .75rem;
    transition: box-shadow .2s;
  }
  .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12); }
  .card-header { display: flex; align-items: center; gap: .75rem; }
  .avatar {
    width: 44px; height: 44px; border-radius: 50%;
    object-fit: cover; border: 1px solid var(--border); flex-shrink: 0;
  }
  .avatar-placeholder {
    width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
    background: var(--border); display: flex; align-items: center;
    justify-content: center; font-weight: 700; font-size: 1.1rem; color: var(--muted);
  }
  .card-title { font-weight: 600; font-size: .95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .card-sub   { font-size: .78rem; color: var(--muted); font-family: var(--mono); margin-top: .15rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .card-desc  { font-size: .8rem; color: var(--muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .details    { margin-top: .5rem; padding-top: .75rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: .35rem; }
  .detail-row { display: flex; justify-content: space-between; font-size: .75rem; font-family: var(--mono); }
  .detail-key { color: var(--muted); }
  .badge { display: inline-block; padding: .15rem .5rem; border-radius: 4px; font-size: .68rem; font-weight: 600; font-family: var(--mono); text-transform: uppercase; letter-spacing: .05em; }
  .badge-amber { background: #fef3c7; color: #92400e; }
  .badge-emerald { background: #d1fae5; color: #065f46; }
  .badge-rose { background: #ffe4e6; color: #9f1239; }
  .badge-zinc { background: var(--border); color: var(--muted); }
  img.cover { width: 100%; height: 160px; object-fit: cover; border-radius: calc(var(--radius) - 4px) calc(var(--radius) - 4px) 0 0; }
  table { width: 100%; border-collapse: collapse; font-size: .85rem; }
  thead tr { background: var(--surface); border-bottom: 1px solid var(--border); }
  th, td { padding: .65rem 1rem; text-align: left; }
  th { font-family: var(--mono); font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
  tbody tr { border-bottom: 1px solid var(--border); }
  tbody tr:hover { background: var(--surface); }
  td.amount { text-align: right; font-weight: 700; font-family: var(--mono); }
  .todo-list { list-style: none; border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .todo-item { display: flex; flex-direction: column; gap: .4rem; padding: .75rem 1rem; border-bottom: 1px solid var(--border); }
  .todo-item:last-child { border-bottom: none; }
  .todo-item:hover { background: var(--surface); }
  .todo-row { display: flex; align-items: center; gap: .6rem; }
  .todo-title { flex: 1; font-size: .9rem; font-weight: 500; }
  .todo-title.done { text-decoration: line-through; color: var(--muted); }
  .comment-list { display: flex; flex-direction: column; gap: .75rem; }
  .comment { display: flex; gap: .75rem; }
  .comment-body { flex: 1; border: 1px solid var(--border); border-radius: var(--radius); padding: .75rem; }
  .comment-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: .35rem; }
  .comment-author { font-weight: 600; font-size: .9rem; }
  .comment-date { font-size: .75rem; color: var(--muted); }
  .comment-text { font-size: .85rem; color: var(--muted); line-height: 1.55; }
  .product-img { width: 100%; height: 176px; object-fit: cover; border-radius: calc(var(--radius) - 4px) calc(var(--radius) - 4px) 0 0; }
  .product-img-placeholder { width: 100%; height: 96px; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: var(--surface); border-radius: calc(var(--radius) - 4px) calc(var(--radius) - 4px) 0 0; }
  .product-body { padding: .85rem; display: flex; flex-direction: column; gap: .4rem; }
  .product-footer { padding: .65rem .85rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .price { font-size: 1.1rem; font-weight: 700; }
  .article { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .article-body { padding: 1rem; }
  .article-title { font-weight: 600; font-size: 1rem; margin-bottom: .35rem; }
  .article-excerpt { font-size: .82rem; color: var(--muted); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .article-footer { margin-top: .65rem; display: flex; justify-content: space-between; font-size: .75rem; color: var(--muted); }`;
}

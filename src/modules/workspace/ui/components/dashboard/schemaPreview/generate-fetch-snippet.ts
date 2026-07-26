import type { HttpMethod } from "../../sidebar/types";

type FetchTab = "curl" | "js" | "tsx" | "python" | "go" | "rust" | "php";

export function generateFetchSnippet(
    tab: FetchTab,
    url: string,
    method: HttpMethod,
    requiresAuth: boolean,
    token?: string | null,
): string {
    const tokenVal = token || "YOUR_TOKEN_HERE";

    switch (tab) {
        case "curl": {
            const parts = [`curl -X ${method} "${url}"`];
            parts.push('-H "Accept: application/json"');
            if (requiresAuth) {
                parts.push(`-H "Authorization: Bearer ${tokenVal}"`);
            }
            return parts.join(" \\\n  ");
        }
        case "js": {
            const authHeaderJs = requiresAuth
                ? `,\n    headers: {\n      "Authorization": "Bearer ${tokenVal}"\n    }`
                : "";
            return `fetch("${url}", {\n  method: "${method}"${authHeaderJs}\n})\n  .then((res) => res.json())\n  .then((data) => console.log(data))\n  .catch((err) => console.error(err));`;
        }
        case "tsx": {
            const authHeaderTs = requiresAuth
                ? `,\n      headers: {\n        "Authorization": "Bearer ${tokenVal}"\n      }`
                : "";
            return `async function fetchData<T = unknown>(): Promise<T> {\n  const response = await fetch("${url}", {\n    method: "${method}"${authHeaderTs}\n  });\n\n  if (!response.ok) {\n    throw new Error(\`HTTP error! status: \${response.status}\`);\n  }\n\n  return response.json() as Promise<T>;}`;
        }
        case "python": {
            const headersObj = requiresAuth
                ? `,\n    headers={\n        "Authorization": "Bearer ${tokenVal}"\n    }`
                : "";
            return `import requests\n\nresponse = requests.${method.toLowerCase()}(\n    "${url}"${headersObj}\n)\n\nprint(response.json())`;
        }
        case "go": {
            const authGo = requiresAuth
                ? `\n\treq.Header.Add("Authorization", "Bearer ${tokenVal}")`
                : "";
            return `package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n)\n\nfunc main() {\n\tclient := &http.Client{}\n\treq, err := http.NewRequest("${method}", "${url}", nil)${authGo}\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;
        }
        case "rust": {
            const authCall = requiresAuth ? `\n        .bearer_auth("${tokenVal}")` : "";
            return `use reqwest::Error;\n\n#[tokio::main]\nasync fn main() -> Result<(), Error> {\n    let client = reqwest::Client::new();\n    let response = client\n        .${method.toLowerCase()}("${url}")${authCall}\n        .header("Accept", "application/json")\n        .send()\n        .await?;\n\n    let body = response.text().await?;\n    println!("{}", body);\n    Ok(())\n}`;
        }
        case "php": {
            const authPhp = requiresAuth
                ? `\n  "header" => "Authorization: Bearer ${tokenVal}\\r\\n"`
                : "";
            return `<?php\n$opts = [\n  "http" => [\n    "method" => "${method}"${authPhp}\n  ]\n];\n$context = stream_context_create($opts);\n$result = file_get_contents("${url}", false, $context);\necho $result;\n?>`;
        }
    }
}

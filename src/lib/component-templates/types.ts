import type { SchemaField } from "~/lib/faker-options";

export interface TemplateOptions {
    requiresAuth?: boolean;
    bearerToken?: string | null;
    method?: string;
}

export interface ComponentTemplate {
    id: string;
    name: string;
    description: string;
    /** fieldName candidates that strongly indicate this template (case/underscore-insensitive) */
    requiredFields: string[];
    /** fieldName candidates that boost match confidence but aren't essential */
    optionalFields: string[];
    /** generates the full .tsx source as a string, using the user's actual field names */
    code: (fields: SchemaField[], endpointUrl: string, options?: TemplateOptions) => string;
    /** generates a standalone .html file (inline <style> + <script>) from the user's actual field names */
    htmlCode?: (fields: SchemaField[], endpointUrl: string, options?: TemplateOptions) => string;
}

export interface TemplateMatch {
    template: ComponentTemplate;
    score: number;
    matchedFields: string[];
}

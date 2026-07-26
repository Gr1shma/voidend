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
    requiredFields: string[];
    optionalFields: string[];
    code: (fields: SchemaField[], endpointUrl: string, options?: TemplateOptions) => string;
    htmlCode?: (fields: SchemaField[], endpointUrl: string, options?: TemplateOptions) => string;
}

export interface TemplateMatch {
    template: ComponentTemplate;
    score: number;
    matchedFields: string[];
}

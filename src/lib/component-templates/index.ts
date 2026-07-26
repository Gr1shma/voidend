import type { SchemaField } from "~/lib/faker-options";
import type { ComponentTemplate, TemplateMatch } from "./types";
import { dynamicGridTemplate } from "./dynamic-grid";
import { userCardTemplate } from "./user-card";
import { postCardTemplate } from "./post-card";
import { productCardTemplate } from "./product-card";
import { todoListTemplate } from "./todo-list";
import { transactionRowTemplate } from "./transaction-row";
import { commentItemTemplate } from "./comment-item";

export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
    dynamicGridTemplate,
    userCardTemplate,
    postCardTemplate,
    productCardTemplate,
    todoListTemplate,
    transactionRowTemplate,
    commentItemTemplate,
];

function normalize(name: string): string {
    return name.toLowerCase().replace(/[_\s-]/g, "");
}

function fieldMatches(fieldNameNormalized: string, candidateNormalized: string): boolean {
    return (
        fieldNameNormalized === candidateNormalized ||
        fieldNameNormalized.includes(candidateNormalized) ||
        candidateNormalized.includes(fieldNameNormalized)
    );
}

/**
 * Scores every template against the given schema fields and endpoint URL path.
 * Matches against field $faker dataTypes (and fieldNames as fallback).
 * requiredFields matches are weighted heavily (10x);
 * path segment matches add a strong boost (8x);
 * optionalFields matches add a smaller boost.
 */
export function matchTemplates(fields: SchemaField[], endpointPath: string = ""): TemplateMatch[] {
    const normalizedFieldNames = fields.map((f) => normalize(f.fieldName));
    const normalizedDataTypes = fields.map((f) => normalize(f.dataType));
    const normalizedPath = normalize(endpointPath);

    const results: TemplateMatch[] = COMPONENT_TEMPLATES.map((template) => {
        const matchedFields: string[] = [];

        // Endpoint path keyword bonus
        let pathScoreBoost = 0;
        const templateKeywords = [
            template.id,
            ...template.id.split("-"),
            ...template.requiredFields,
        ];
        if (normalizedPath) {
            for (const kw of templateKeywords) {
                const normKw = normalize(kw);
                if (normKw.length > 2 && normalizedPath.includes(normKw)) {
                    pathScoreBoost += 8;
                    break;
                }
            }
        }

        for (const required of template.requiredFields) {
            const normalizedRequired = normalize(required);
            if (
                normalizedDataTypes.some((dt) => fieldMatches(dt, normalizedRequired)) ||
                normalizedFieldNames.some((fn) => fieldMatches(fn, normalizedRequired))
            ) {
                matchedFields.push(required);
            }
        }
        for (const optional of template.optionalFields) {
            const normalizedOptional = normalize(optional);
            if (
                normalizedDataTypes.some((dt) => fieldMatches(dt, normalizedOptional)) ||
                normalizedFieldNames.some((fn) => fieldMatches(fn, normalizedOptional))
            ) {
                matchedFields.push(optional);
            }
        }

        const requiredMatchCount = template.requiredFields.filter((r) =>
            matchedFields.includes(r),
        ).length;
        const requiredRatio =
            template.requiredFields.length > 0
                ? requiredMatchCount / template.requiredFields.length
                : 0;
        const optionalMatchCount = matchedFields.length - requiredMatchCount;

        const score = requiredRatio * 10 + optionalMatchCount + pathScoreBoost;

        return { template, score, matchedFields };
    });

    // If template has 0 score or only path match without any fields, ensure dynamic-grid is fallback
    const matched = results
        .filter((r) => r.score > 0)
        .toSorted((a: TemplateMatch, b: TemplateMatch) => b.score - a.score);

    // If dynamicGrid is not present or score is low, guarantee dynamicGrid is included at the end
    const dynamicMatch = results.find((r) => r.template.id === "dynamic-grid");
    if (dynamicMatch && !matched.some((m: TemplateMatch) => m.template.id === "dynamic-grid")) {
        matched.push(dynamicMatch);
    }

    return matched;
}

export function getTopMatches(
    fields: SchemaField[],
    endpointPath: string = "",
    limit = 4,
): TemplateMatch[] {
    return matchTemplates(fields, endpointPath).slice(0, limit);
}

export function getTemplateById(id: string): ComponentTemplate | undefined {
    return COMPONENT_TEMPLATES.find((t) => t.id === id);
}

import type { TemplateOptions } from "./types";

export function generateCode(
    template: ComponentTemplate,
    fields: SchemaField[],
    endpointUrl: string,
    options?: TemplateOptions,
): string {
    return template.code(fields, endpointUrl, options);
}

export function generateHtmlCode(
    template: ComponentTemplate,
    fields: SchemaField[],
    endpointUrl: string,
    options?: TemplateOptions,
): string {
    return template.htmlCode ? template.htmlCode(fields, endpointUrl, options) : "";
}

export * from "./types";

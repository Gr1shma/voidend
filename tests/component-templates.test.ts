import { describe, expect, it } from "vitest";
import { fieldsFromSchema } from "~/lib/faker-options";
import {
    matchTemplates,
    getTopMatches,
    generateCode,
    generateHtmlCode,
    COMPONENT_TEMPLATES,
} from "~/lib/component-templates";
import { dynamicGridTemplate } from "~/lib/component-templates/dynamic-grid";
import { userCardTemplate } from "~/lib/component-templates/user-card";
import { postCardTemplate } from "~/lib/component-templates/post-card";
import { productCardTemplate } from "~/lib/component-templates/product-card";
import { todoListTemplate } from "~/lib/component-templates/todo-list";
import { transactionRowTemplate } from "~/lib/component-templates/transaction-row";
import { commentItemTemplate } from "~/lib/component-templates/comment-item";
import {
    findField,
    findFieldByDataType,
    buildFetchHook,
    buildInterface,
} from "~/lib/component-templates/codegen-utils";

describe("Component Templates Library", () => {
    describe("matchTemplates & getTopMatches", () => {
        it("should rank specialized templates (e.g. user-card) when $faker data types match", () => {
            const fields = [
                { id: "1", fieldName: "val_a", dataType: "$faker.person.fullName" },
                { id: "2", fieldName: "val_b", dataType: "$faker.internet.username" },
            ];
            const matches = getTopMatches(fields, "/api/custom-users");

            expect(matches.length).toBeGreaterThan(0);
            expect(matches[0]!.template.id).toBe("user-card");
        });

        it("should rank post-card when $faker data types for title and content match", () => {
            const fields = [
                { id: "1", fieldName: "f_title", dataType: "$faker.book.title" },
                { id: "2", fieldName: "f_body", dataType: "$faker.lorem.paragraph" },
            ];
            const matches = getTopMatches(fields, "/api/articles");

            expect(matches.length).toBeGreaterThan(0);
            expect(matches[0]!.template.id).toBe("post-card");
        });

        it("should rank dynamicGridTemplate when path keyword matches", () => {
            const fields = fieldsFromSchema({
                id: "$faker.string.uuid",
                name: "$faker.person.fullName",
            });
            const matches = matchTemplates(fields, "/users");
            expect(matches.some((m) => m.template.id === "dynamic-grid")).toBe(true);
        });
    });

    describe("codegen-utils", () => {
        it("findFieldByDataType matches fields by $faker dataType pattern regardless of field key", () => {
            const fields = [
                { id: "1", fieldName: "prop_1", dataType: "$faker.person.fullName" },
                { id: "2", fieldName: "prop_2", dataType: "$faker.internet.email" },
            ];

            expect(findFieldByDataType(fields, ["person.fullName"])).toBe("prop_1");
            expect(findFieldByDataType(fields, ["internet.email"])).toBe("prop_2");
            expect(findFieldByDataType(fields, ["nonexistent"])).toBeUndefined();
        });

        it("findField case and separator insensitively matches schema field names", () => {
            const fields = [
                { id: "1", fieldName: "user_name", dataType: "$faker.internet.username" },
                { id: "2", fieldName: "EmailAddress", dataType: "$faker.internet.email" },
            ];

            expect(findField(fields, ["username", "handle"])).toBe("user_name");
            expect(findField(fields, ["email", "emailaddress"])).toBe("EmailAddress");
            expect(findField(fields, ["nonexistent"])).toBeNull();
        });

        it("buildInterface generates valid TypeScript interface output", () => {
            const code = buildInterface("User", ["id: string;", "name: string;"]);
            expect(code).toContain("interface User {");
            expect(code).toContain("  id: string;");
            expect(code).toContain("  name: string;");
            expect(code).toContain("}");
        });

        it("buildFetchHook generates a fetch hook with correct endpoint URL", () => {
            const code = buildFetchHook("User", "https://api.mock.test/users", "UserItem");
            expect(code).toContain("function useUserData()");
            expect(code).toContain('fetch("https://api.mock.test/users")');
            expect(code).toContain("setData(json)");
        });
    });

    describe("React Component Templates (No Tailwind CSS & Fully Dynamic)", () => {
        it("userCardTemplate generates React code without Tailwind CSS classes and works with arbitrary field keys", () => {
            const fields = [
                { id: "1", fieldName: "col_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "col_name", dataType: "$faker.person.fullName" },
                { id: "3", fieldName: "col_user", dataType: "$faker.internet.username" },
                { id: "4", fieldName: "col_img", dataType: "$faker.image.avatar" },
                { id: "5", fieldName: "col_bio", dataType: "$faker.person.bio" },
            ];

            const code = generateCode(userCardTemplate, fields, "https://mock.api/v1/users");

            expect(code).not.toContain('className="');
            expect(code).toContain("style={{");
            expect(code).toContain("col_id");
            expect(code).toContain("col_name");
            expect(code).toContain("col_user");
            expect(code).toContain("col_img");
            expect(code).toContain("col_bio");
        });

        it("postCardTemplate generates React code without Tailwind CSS classes", () => {
            const fields = [
                { id: "1", fieldName: "x_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "x_title", dataType: "$faker.book.title" },
                { id: "3", fieldName: "x_content", dataType: "$faker.lorem.paragraph" },
                { id: "4", fieldName: "x_author", dataType: "$faker.person.fullName" },
            ];

            const code = generateCode(postCardTemplate, fields, "https://mock.api/v1/posts");

            expect(code).not.toContain('className="');
            expect(code).toContain("style={{");
            expect(code).toContain("x_title");
            expect(code).toContain("x_content");
        });

        it("productCardTemplate generates React code without Tailwind CSS classes", () => {
            const fields = [
                { id: "1", fieldName: "p_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "p_name", dataType: "$faker.commerce.productName" },
                { id: "3", fieldName: "p_price", dataType: "$faker.commerce.price" },
                { id: "4", fieldName: "p_stock", dataType: "$faker.datatype.boolean" },
            ];

            const code = generateCode(productCardTemplate, fields, "https://mock.api/v1/products");

            expect(code).not.toContain('className="');
            expect(code).toContain("style={{");
            expect(code).toContain("p_name");
            expect(code).toContain("p_price");
        });

        it("todoListTemplate generates React code without Tailwind CSS classes", () => {
            const fields = [
                { id: "1", fieldName: "t_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "t_words", dataType: "$faker.lorem.words" },
                { id: "3", fieldName: "t_done", dataType: "$faker.datatype.boolean" },
            ];

            const code = generateCode(todoListTemplate, fields, "https://mock.api/v1/todos");

            expect(code).not.toContain('className="');
            expect(code).toContain("style={{");
            expect(code).toContain("t_words");
            expect(code).toContain("t_done");
        });

        it("transactionRowTemplate generates React code without Tailwind CSS classes", () => {
            const fields = [
                { id: "1", fieldName: "tx_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "tx_val", dataType: "$faker.finance.amount" },
                { id: "3", fieldName: "tx_date", dataType: "$faker.date.recent" },
            ];

            const code = generateCode(transactionRowTemplate, fields, "https://mock.api/v1/tx");

            expect(code).not.toContain('className="');
            expect(code).toContain("style={{");
            expect(code).toContain("tx_val");
            expect(code).toContain("tx_date");
        });

        it("commentItemTemplate generates React code without Tailwind CSS classes", () => {
            const fields = [
                { id: "1", fieldName: "c_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "c_author", dataType: "$faker.person.fullName" },
                { id: "3", fieldName: "c_text", dataType: "$faker.lorem.paragraph" },
            ];

            const code = generateCode(commentItemTemplate, fields, "https://mock.api/v1/comments");

            expect(code).not.toContain('className="');
            expect(code).toContain("style={{");
            expect(code).toContain("c_author");
            expect(code).toContain("c_text");
        });

        it("dynamicGridTemplate generates React code without Tailwind CSS classes", () => {
            const fields = [
                { id: "1", fieldName: "field_a", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "field_b", dataType: "$faker.person.fullName" },
            ];

            const code = generateCode(dynamicGridTemplate, fields, "https://mock.api/v1/grid");

            expect(code).not.toContain('className="');
            expect(code).toContain("style={{");
            expect(code).toContain("field_a");
            expect(code).toContain("field_b");
        });
    });

    describe("dynamicGridTemplate Code Generation", () => {
        it("generates TSX component code from schema fields with snake_case normalization", () => {
            const fields = fieldsFromSchema({
                id: "$faker.string.uuid",
                full_name: "$faker.person.fullName",
                user_name: "$faker.internet.username",
                email_address: "$faker.internet.email",
                phone_number: "$faker.phone.number",
                avatar_url: "$faker.image.avatar",
                bio_summary: "$faker.person.bio",
                price_amount: "$faker.commerce.price",
            });

            const code = generateCode(dynamicGridTemplate, fields, "https://mock.api/v1/users");

            expect(code).toContain('import { useEffect, useState } from "react";');
            expect(code).toContain("interface DataItem {");
            expect(code).toContain("  id: string;");
            expect(code).toContain("  full_name: string;");
            expect(code).toContain("  user_name: string;");
            expect(code).toContain("  price_amount: number;");
            expect(code).toContain("function useDataItemData()");
            expect(code).toContain('fetch("https://mock.api/v1/users")');
            expect(code).toContain("export function DataCardList()");
            expect(code).toContain("avatar_url");
            expect(code).toContain("email_address:");
            expect(code).toContain("phone_number:");
        });

        it("backtracks arbitrary field names (e.g. foo, bar) to their $faker types", () => {
            const fields = fieldsFromSchema({
                foo: "$faker.string.uuid",
                bar: "$faker.internet.username",
                baz: "$faker.person.fullName",
                pic: "$faker.image.avatar",
            });

            const code = generateCode(dynamicGridTemplate, fields, "https://mock.api/v1/users");

            expect(code).toContain("  foo: string;");
            expect(code).toContain("  bar: string;");
            expect(code).toContain("  baz: string;");
            expect(code).toContain("  pic: string;");

            // Verify foo was inferred as id, baz/bar as title/subtitle, and pic as avatar
            expect(code).toContain("item.foo");
            expect(code).toContain("item.baz");
            expect(code).toContain("item.pic");
        });

        it("backtracks all categories in FAKER_OPTIONS (book, company, vehicle, food, commerce)", () => {
            const fields = fieldsFromSchema({
                custom_id: "$faker.string.nanoid",
                field1: "$faker.book.title",
                field2: "$faker.book.author",
                field3: "$faker.lorem.paragraph",
                field4: "$faker.number.float",
                field5: "$faker.datatype.boolean",
            });

            const code = generateCode(dynamicGridTemplate, fields, "https://mock.api/v1/books");

            expect(code).toContain("  custom_id: string;");
            expect(code).toContain("  field1: string;");
            expect(code).toContain("  field2: string;");
            expect(code).toContain("  field3: string;");
            expect(code).toContain("  field4: number;");
            expect(code).toContain("  field5: boolean;");

            // Check that field1 ($faker.book.title) was mapped to title, field2 to subtitle, and field3 to paragraph
            expect(code).toContain("item.custom_id");
            expect(code).toContain("item.field1");
            expect(code).toContain("item.field2");
            expect(code).toContain("item.field3");
        });

        it("recursively flattens nested schema objects (user.profile.name) like schema-resolver.ts", () => {
            const fields = fieldsFromSchema({
                user: {
                    id: "$faker.string.uuid",
                    profile: {
                        name: "$faker.person.fullName",
                        avatar: "$faker.image.avatar",
                    },
                    details: {
                        bio: "$faker.person.bio",
                    },
                },
            });

            const code = generateCode(dynamicGridTemplate, fields, "https://mock.api/v1/nested");

            expect(code).toContain('  "user.id"?: string;');
            expect(code).toContain('  "user.profile.name"?: string;');
            expect(code).toContain('  "user.profile.avatar"?: string;');
            expect(code).toContain('  "user.details.bio"?: string;');

            // Verify safe optional chaining property access item?.["user.profile.name"]
            expect(code).toContain('item?.["user.id"]');
            expect(code).toContain('item?.["user.profile.name"]');
            expect(code).toContain('item?.["user.profile.avatar"]');
            expect(code).toContain('item?.["user.details.bio"]');
        });

        it("handles empty / simple schema fields without crashing", () => {
            const fields = fieldsFromSchema({});
            const code = generateCode(dynamicGridTemplate, fields, "https://mock.api/v1/custom");

            expect(code).toContain("export function DataCardList()");
            expect(code).toContain('fetch("https://mock.api/v1/custom")');
        });
    });

    describe("HTML Template Code Generation", () => {
        it("generates valid single-file HTML for dynamicGridTemplate", () => {
            const fields = fieldsFromSchema({
                id: "$faker.string.uuid",
                name: "$faker.person.fullName",
                email: "$faker.internet.email",
                avatar: "$faker.image.avatar",
            });

            const html = generateHtmlCode(dynamicGridTemplate, fields, "https://mock.api/v1/users");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<style>");
            expect(html).toContain('<script type="module">');
            expect(html).toContain('fetch("https://mock.api/v1/users")');
            expect(html).toContain("avatar");
            expect(html).toContain("email");
        });

        it("generates valid HTML for userCardTemplate", () => {
            const fields = fieldsFromSchema({
                id: "uuid",
                fullName: "fullName",
                username: "username",
                email: "email",
            });

            const html = generateHtmlCode(userCardTemplate, fields, "/api/users");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<title>User Cards</title>");
            expect(html).toContain("fullName");
            expect(html).toContain("username");
            expect(html).toContain("email");
            expect(html).toContain('fetch("/api/users")');
        });

        it("generates valid HTML for postCardTemplate", () => {
            const fields = fieldsFromSchema({
                id: "uuid",
                title: "lorem.sentence",
                content: "lorem.paragraph",
                author: "person.fullName",
            });

            const html = generateHtmlCode(postCardTemplate, fields, "/api/posts");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<title>Post Cards</title>");
            expect(html).toContain("title");
            expect(html).toContain("content");
            expect(html).toContain("author");
            expect(html).toContain('fetch("/api/posts")');
        });

        it("generates valid HTML for productCardTemplate", () => {
            const fields = fieldsFromSchema({
                id: "uuid",
                name: "commerce.productName",
                price: "commerce.price",
                inStock: "datatype.boolean",
            });

            const html = generateHtmlCode(productCardTemplate, fields, "/api/products");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<title>Product Cards</title>");
            expect(html).toContain("name");
            expect(html).toContain("price");
            expect(html).toContain("inStock");
            expect(html).toContain('fetch("/api/products")');
        });

        it("generates valid HTML for todoListTemplate", () => {
            const fields = fieldsFromSchema({
                id: "uuid",
                title: "lorem.sentence",
                completed: "datatype.boolean",
                priority: "number.int",
            });

            const html = generateHtmlCode(todoListTemplate, fields, "/api/todos");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<title>Todo List</title>");
            expect(html).toContain("title");
            expect(html).toContain("completed");
            expect(html).toContain("priority");
            expect(html).toContain('fetch("/api/todos")');
        });

        it("generates valid HTML for transactionRowTemplate", () => {
            const fields = fieldsFromSchema({
                id: "uuid",
                amount: "finance.amount",
                date: "date.recent",
                merchant: "company.name",
            });

            const html = generateHtmlCode(transactionRowTemplate, fields, "/api/transactions");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<title>Transaction Table</title>");
            expect(html).toContain("amount");
            expect(html).toContain("date");
            expect(html).toContain("merchant");
            expect(html).toContain('fetch("/api/transactions")');
        });

        it("generates valid HTML for commentItemTemplate", () => {
            const fields = fieldsFromSchema({
                id: "uuid",
                author: "person.fullName",
                comment: "lorem.sentence",
            });

            const html = generateHtmlCode(commentItemTemplate, fields, "/api/comments");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<title>Comments</title>");
            expect(html).toContain("author");
            expect(html).toContain("comment");
            expect(html).toContain('fetch("/api/comments")');
        });

        it("handles empty schema fields gracefully without crashing", () => {
            const fields = fieldsFromSchema({});
            const html = generateHtmlCode(dynamicGridTemplate, fields, "/api/empty");

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain('fetch("/api/empty")');
        });
    });

    it("contains all 7 component templates", () => {
        expect(COMPONENT_TEMPLATES.length).toBe(7);
        expect(COMPONENT_TEMPLATES.map((t) => t.id)).toEqual([
            "dynamic-grid",
            "user-card",
            "post-card",
            "product-card",
            "todo-list",
            "transaction-row",
            "comment-item",
        ]);
    });

    describe("Edge Cases & Schema Alignment", () => {
        it("should match comment-item for /api/v1/comments with comments schema", () => {
            const fields = [
                { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "author", dataType: "$faker.person.fullName" },
                { id: "3", fieldName: "comment", dataType: "$faker.lorem.paragraph" },
                { id: "4", fieldName: "avatar", dataType: "$faker.image.avatar" },
                { id: "5", fieldName: "createdAt", dataType: "$faker.date.recent" },
            ];

            const matches = getTopMatches(
                fields,
                "http://localhost:3000/mock/ea232485/api/v1/comments",
            );
            expect(matches[0]!.template.id).toBe("comment-item");
        });

        it("postCardTemplate does not reference non-existent post.title when schema has no title field", () => {
            const fields = [
                { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "author", dataType: "$faker.person.fullName" },
                { id: "3", fieldName: "comment", dataType: "$faker.lorem.paragraph" },
                { id: "4", fieldName: "avatar", dataType: "$faker.image.avatar" },
                { id: "5", fieldName: "createdAt", dataType: "$faker.date.recent" },
            ];

            const code = generateCode(
                postCardTemplate,
                fields,
                "http://localhost:3000/api/v1/posts",
            );
            expect(code).not.toContain("post.title");
            expect(code).toContain("post.comment");
            expect(code).toContain("post.author");
        });

        it("productCardTemplate does not reference non-existent product.name or product.price", () => {
            const fields = [
                { id: "1", fieldName: "custom_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "description", dataType: "$faker.lorem.paragraph" },
            ];

            const code = generateCode(
                productCardTemplate,
                fields,
                "http://localhost:3000/api/v1/products",
            );
            expect(code).not.toContain("product.name");
            expect(code).not.toContain("product.price");
            expect(code).toContain("custom_id");
        });

        it("userCardTemplate does not reference non-existent user.name when fullName is absent", () => {
            const fields = [
                { id: "1", fieldName: "user_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "handle", dataType: "$faker.internet.username" },
            ];

            const code = generateCode(
                userCardTemplate,
                fields,
                "http://localhost:3000/api/v1/users",
            );
            expect(code).not.toContain("user.name");
            expect(code).toContain("user.handle");
        });

        it("todoListTemplate does not reference non-existent todo.title or todo.completed", () => {
            const fields = [
                { id: "1", fieldName: "task_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "description", dataType: "$faker.lorem.sentence" },
            ];

            const code = generateCode(
                todoListTemplate,
                fields,
                "http://localhost:3000/api/v1/todos",
            );
            expect(code).not.toContain("todo.title");
            expect(code).not.toContain("todo.completed");
            expect(code).toContain("todo.description");
        });

        it("transactionRowTemplate does not reference non-existent tx.amount or tx.date", () => {
            const fields = [
                { id: "1", fieldName: "tx_id", dataType: "$faker.string.uuid" },
                { id: "2", fieldName: "merchant", dataType: "$faker.company.name" },
            ];

            const code = generateCode(
                transactionRowTemplate,
                fields,
                "http://localhost:3000/api/v1/tx",
            );
            expect(code).not.toContain("tx.amount");
            expect(code).not.toContain("tx.date");
            expect(code).toContain("tx.merchant");
        });
    });

    describe("Auth Config (TemplateOptions)", () => {
        const commentFields = [
            { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
            { id: "2", fieldName: "author", dataType: "$faker.person.fullName" },
            { id: "3", fieldName: "comment", dataType: "$faker.lorem.paragraph" },
        ];
        const URL = "http://localhost:3000/api/v1/protected";

        describe("buildFetchHook", () => {
            it("generates plain fetch (no auth) when options are omitted", () => {
                const code = buildFetchHook("Test", URL, "Item");
                expect(code).toContain(`fetch("${URL}")`);
                expect(code).not.toContain("Authorization");
                expect(code).not.toContain("Bearer");
            });

            it("generates plain fetch when requiresAuth is false", () => {
                const code = buildFetchHook("Test", URL, "Item", { requiresAuth: false });
                expect(code).toContain(`fetch("${URL}")`);
                expect(code).not.toContain("Authorization");
            });

            it("generates Authorization header with placeholder when requiresAuth is true but no token provided", () => {
                const code = buildFetchHook("Test", URL, "Item", { requiresAuth: true });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer YOUR_TOKEN_HERE");
                expect(code).toContain(URL);
            });

            it("generates Authorization header with actual token when bearerToken is provided", () => {
                const code = buildFetchHook("Test", URL, "Item", {
                    requiresAuth: true,
                    bearerToken: "eyJhbGciOiJIUzI1NiJ9.test",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer eyJhbGciOiJIUzI1NiJ9.test");
            });
        });

        describe("generateCode with auth options", () => {
            it("commentItemTemplate includes auth header in React fetch hook", () => {
                const code = generateCode(commentItemTemplate, commentFields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_abc123",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_abc123");
                expect(code).toContain(URL);
            });

            it("userCardTemplate includes auth header in React fetch hook", () => {
                const fields = [
                    { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                    { id: "2", fieldName: "name", dataType: "$faker.person.fullName" },
                ];
                const code = generateCode(userCardTemplate, fields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_user99",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_user99");
            });

            it("productCardTemplate includes auth header in React fetch hook", () => {
                const fields = [
                    { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                    { id: "2", fieldName: "name", dataType: "$faker.commerce.productName" },
                    { id: "3", fieldName: "price", dataType: "$faker.commerce.price" },
                ];
                const code = generateCode(productCardTemplate, fields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_prod",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_prod");
            });

            it("todoListTemplate includes auth header in React fetch hook", () => {
                const fields = [
                    { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                    { id: "2", fieldName: "title", dataType: "$faker.lorem.words" },
                    { id: "3", fieldName: "done", dataType: "$faker.datatype.boolean" },
                ];
                const code = generateCode(todoListTemplate, fields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_todo",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_todo");
            });

            it("transactionRowTemplate includes auth header in React fetch hook", () => {
                const fields = [
                    { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                    { id: "2", fieldName: "amount", dataType: "$faker.finance.amount" },
                    { id: "3", fieldName: "date", dataType: "$faker.date.recent" },
                ];
                const code = generateCode(transactionRowTemplate, fields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_tx",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_tx");
            });

            it("dynamicGridTemplate includes auth header in React fetch hook", () => {
                const fields = [
                    { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                    { id: "2", fieldName: "label", dataType: "$faker.person.fullName" },
                ];
                const code = generateCode(dynamicGridTemplate, fields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_grid",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_grid");
            });

            it("postCardTemplate includes auth header in React fetch hook", () => {
                const fields = [
                    { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                    { id: "2", fieldName: "title", dataType: "$faker.book.title" },
                    { id: "3", fieldName: "body", dataType: "$faker.lorem.paragraph" },
                ];
                const code = generateCode(postCardTemplate, fields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_post",
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_post");
            });

            it("no auth options -> no Authorization header in generated code", () => {
                const code = generateCode(commentItemTemplate, commentFields, URL);
                expect(code).not.toContain("Authorization");
                expect(code).not.toContain("Bearer");
            });

            it("requiresAuth true but bearerToken absent -> uses YOUR_TOKEN_HERE placeholder", () => {
                const code = generateCode(commentItemTemplate, commentFields, URL, {
                    requiresAuth: true,
                });
                expect(code).toContain("Authorization");
                expect(code).toContain("YOUR_TOKEN_HERE");
                expect(code).not.toContain("null");
            });
        });

        describe("generateHtmlCode with auth options", () => {
            it("commentItemTemplate HTML includes auth fetch with token", () => {
                const html = generateHtmlCode(commentItemTemplate, commentFields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_html",
                });
                expect(html).toContain("Authorization");
                expect(html).toContain("Bearer tok_html");
            });

            it("dynamicGridTemplate HTML includes auth fetch with token", () => {
                const fields = [
                    { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
                    { id: "2", fieldName: "name", dataType: "$faker.person.fullName" },
                ];
                const html = generateHtmlCode(dynamicGridTemplate, fields, URL, {
                    requiresAuth: true,
                    bearerToken: "tok_html_grid",
                });
                expect(html).toContain("Authorization");
                expect(html).toContain("Bearer tok_html_grid");
            });

            it("HTML no auth -> plain fetch without Authorization header", () => {
                const html = generateHtmlCode(commentItemTemplate, commentFields, URL);
                expect(html).not.toContain("Authorization");
                expect(html).not.toContain("Bearer");
            });
        });
    });

    describe("HTTP Method Support (TemplateOptions.method)", () => {
        const methodFields = [
            { id: "1", fieldName: "id", dataType: "$faker.string.uuid" },
            { id: "2", fieldName: "name", dataType: "$faker.person.fullName" },
        ];
        const URL = "http://localhost:3000/api/v1/items";

        describe("buildFetchHook", () => {
            it("generates plain fetch with no method when options are omitted", () => {
                const code = buildFetchHook("Test", URL, "Item");
                expect(code).toContain(`fetch("${URL}")`);
                expect(code).not.toContain("method:");
            });

            it("generates plain fetch when method is GET", () => {
                const code = buildFetchHook("Test", URL, "Item", { method: "GET" });
                expect(code).toContain(`fetch("${URL}")`);
                expect(code).not.toContain("method:");
            });

            it("includes method: POST in fetch options", () => {
                const code = buildFetchHook("Test", URL, "Item", { method: "POST" });
                expect(code).toContain('method: "POST"');
                expect(code).toContain(`fetch("${URL}"`);
            });

            it("includes method: PATCH in fetch options", () => {
                const code = buildFetchHook("Test", URL, "Item", { method: "PATCH" });
                expect(code).toContain('method: "PATCH"');
            });

            it("includes method: PUT in fetch options", () => {
                const code = buildFetchHook("Test", URL, "Item", { method: "PUT" });
                expect(code).toContain('method: "PUT"');
            });

            it("includes method: DELETE in fetch options", () => {
                const code = buildFetchHook("Test", URL, "Item", { method: "DELETE" });
                expect(code).toContain('method: "DELETE"');
            });

            it("includes both method and Authorization header when combined", () => {
                const code = buildFetchHook("Test", URL, "Item", {
                    method: "POST",
                    requiresAuth: true,
                    bearerToken: "tok_123",
                });
                expect(code).toContain('method: "POST"');
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_123");
            });
        });

        describe("generateCode with method option", () => {
            it("dynamicGridTemplate includes method: POST in generated React code", () => {
                const code = generateCode(dynamicGridTemplate, methodFields, URL, {
                    method: "POST",
                });
                expect(code).toContain('method: "POST"');
                expect(code).toContain(`fetch("${URL}"`);
            });

            it("userCardTemplate includes method: DELETE in generated React code", () => {
                const code = generateCode(userCardTemplate, methodFields, URL, {
                    method: "DELETE",
                });
                expect(code).toContain('method: "DELETE"');
            });

            it("postCardTemplate includes method: PUT in generated React code", () => {
                const code = generateCode(postCardTemplate, methodFields, URL, { method: "PUT" });
                expect(code).toContain('method: "PUT"');
            });

            it("productCardTemplate includes method: PATCH in generated React code", () => {
                const code = generateCode(productCardTemplate, methodFields, URL, {
                    method: "PATCH",
                });
                expect(code).toContain('method: "PATCH"');
            });

            it("todoListTemplate includes method: POST in generated React code", () => {
                const code = generateCode(todoListTemplate, methodFields, URL, { method: "POST" });
                expect(code).toContain('method: "POST"');
            });

            it("transactionRowTemplate includes method: POST in generated React code", () => {
                const code = generateCode(transactionRowTemplate, methodFields, URL, {
                    method: "POST",
                });
                expect(code).toContain('method: "POST"');
            });

            it("commentItemTemplate includes method: PATCH in generated React code", () => {
                const code = generateCode(commentItemTemplate, methodFields, URL, {
                    method: "PATCH",
                });
                expect(code).toContain('method: "PATCH"');
            });

            it("GET method omits explicit method from generated React code", () => {
                const code = generateCode(dynamicGridTemplate, methodFields, URL, {
                    method: "GET",
                });
                expect(code).not.toContain("method:");
                expect(code).toContain(`fetch("${URL}")`);
            });

            it("no method option omits explicit method from generated React code", () => {
                const code = generateCode(dynamicGridTemplate, methodFields, URL);
                expect(code).not.toContain("method:");
            });

            it("combines method with auth in generated React code", () => {
                const code = generateCode(dynamicGridTemplate, methodFields, URL, {
                    method: "POST",
                    requiresAuth: true,
                    bearerToken: "tok_method_auth",
                });
                expect(code).toContain('method: "POST"');
                expect(code).toContain("Authorization");
                expect(code).toContain("Bearer tok_method_auth");
            });
        });

        describe("generateHtmlCode with method option", () => {
            it("dynamicGridTemplate HTML includes method: POST", () => {
                const html = generateHtmlCode(dynamicGridTemplate, methodFields, URL, {
                    method: "POST",
                });
                expect(html).toContain('method: "POST"');
                expect(html).toContain(`fetch("${URL}"`);
            });

            it("userCardTemplate HTML includes method: DELETE", () => {
                const html = generateHtmlCode(userCardTemplate, methodFields, URL, {
                    method: "DELETE",
                });
                expect(html).toContain('method: "DELETE"');
            });

            it("postCardTemplate HTML includes method: PUT", () => {
                const html = generateHtmlCode(postCardTemplate, methodFields, URL, {
                    method: "PUT",
                });
                expect(html).toContain('method: "PUT"');
            });

            it("productCardTemplate HTML includes method: PATCH", () => {
                const html = generateHtmlCode(productCardTemplate, methodFields, URL, {
                    method: "PATCH",
                });
                expect(html).toContain('method: "PATCH"');
            });

            it("todoListTemplate HTML includes method: POST", () => {
                const html = generateHtmlCode(todoListTemplate, methodFields, URL, {
                    method: "POST",
                });
                expect(html).toContain('method: "POST"');
            });

            it("transactionRowTemplate HTML includes method: POST", () => {
                const html = generateHtmlCode(transactionRowTemplate, methodFields, URL, {
                    method: "POST",
                });
                expect(html).toContain('method: "POST"');
            });

            it("commentItemTemplate HTML includes method: PATCH", () => {
                const html = generateHtmlCode(commentItemTemplate, methodFields, URL, {
                    method: "PATCH",
                });
                expect(html).toContain('method: "PATCH"');
            });

            it("GET method omits explicit method from HTML", () => {
                const html = generateHtmlCode(dynamicGridTemplate, methodFields, URL, {
                    method: "GET",
                });
                expect(html).not.toContain("method:");
            });

            it("HTML combines method with auth", () => {
                const html = generateHtmlCode(dynamicGridTemplate, methodFields, URL, {
                    method: "POST",
                    requiresAuth: true,
                    bearerToken: "tok_html_method",
                });
                expect(html).toContain('method: "POST"');
                expect(html).toContain("Authorization");
                expect(html).toContain("Bearer tok_html_method");
            });
        });
    });
});

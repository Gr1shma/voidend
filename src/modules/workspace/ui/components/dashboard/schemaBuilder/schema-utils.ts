export const FAKER_OPTIONS = [
    { value: "$faker.string.uuid", label: "ID (UUID)" },
    { value: "$faker.person.fullName", label: "Full Name" },
    { value: "$faker.internet.email", label: "Email" },
    { value: "$faker.internet.userName", label: "Username" },
    { value: "$faker.phone.number", label: "Phone Number" },
    { value: "$faker.lorem.paragraph", label: "Paragraph" },
    { value: "$faker.date.anytime", label: "Date" },
    { value: "$faker.location.city", label: "City" },
    { value: "$faker.company.name", label: "Company" },
    { value: "$faker.commerce.productName", label: "Product Name" },
    { value: "$faker.commerce.price", label: "Price" },
    { value: "$faker.number.int", label: "Number" },
    { value: "$faker.datatype.boolean", label: "Boolean" },
];

export interface SchemaField {
    id: string;
    fieldName: string;
    dataType: string;
}

export function normalizeStoredFieldType(value: unknown): string {
    if (typeof value !== "string") return "$faker.string.uuid";
    if (value.startsWith("$faker.")) return value;

    const legacyTypeMap: Record<string, string> = {
        uuid: "$faker.string.uuid",
        fullName: "$faker.person.fullName",
        username: "$faker.internet.userName",
        paragraph: "$faker.lorem.paragraph",
        date: "$faker.date.anytime",
        email: "$faker.internet.email",
        phoneNumber: "$faker.phone.number",
        city: "$faker.location.city",
        companyName: "$faker.company.name",
        productName: "$faker.commerce.productName",
        price: "$faker.commerce.price",
        number: "$faker.number.int",
        boolean: "$faker.datatype.boolean",
    };

    return legacyTypeMap[value] ?? "$faker.string.uuid";
}

export function fieldsFromSchema(schema: unknown): SchemaField[] {
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
        return [
            {
                id: crypto.randomUUID(),
                fieldName: "",
                dataType: "$faker.string.uuid",
            },
        ];
    }

    const fields = Object.entries(schema).map(([fieldName, dataType]) => ({
        id: crypto.randomUUID(),
        fieldName,
        dataType: normalizeStoredFieldType(dataType),
    }));

    return fields.length > 0
        ? fields
        : [
              {
                  id: crypto.randomUUID(),
                  fieldName: "",
                  dataType: "$faker.string.uuid",
              },
          ];
}

export function buildSchema(schemaFields: SchemaField[]): Record<string, string> {
    const formattedSchema: Record<string, string> = {};
    schemaFields.forEach((field) => {
        if (field.fieldName.trim()) {
            formattedSchema[field.fieldName.trim()] = field.dataType;
        }
    });

    return formattedSchema;
}

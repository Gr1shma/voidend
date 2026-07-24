export const FAKER_OPTIONS = [
    {
        label: "String",
        options: [
            { value: "$faker.string.uuid", label: "UUID" },
            { value: "$faker.string.nanoid", label: "Nano ID" },
            { value: "$faker.string.alphanumeric", label: "Alphanumeric" },
            { value: "$faker.string.alpha", label: "Alphabetic" },
            { value: "$faker.string.numeric", label: "Numeric" },
            { value: "$faker.string.hexadecimal", label: "Hexadecimal" },
        ],
    },

    {
        label: "Person",
        options: [
            { value: "$faker.person.firstName", label: "First Name" },
            { value: "$faker.person.lastName", label: "Last Name" },
            { value: "$faker.person.fullName", label: "Full Name" },
            { value: "$faker.person.jobTitle", label: "Job Title" },
            { value: "$faker.person.bio", label: "Bio" },
            { value: "$faker.person.sex", label: "Sex" },
            { value: "$faker.person.gender", label: "Gender" },
        ],
    },

    {
        label: "Internet",
        options: [
            { value: "$faker.internet.email", label: "Email" },
            { value: "$faker.internet.username", label: "Username" },
            { value: "$faker.internet.password", label: "Password" },
            { value: "$faker.internet.url", label: "URL" },
            { value: "$faker.internet.domainName", label: "Domain" },
            { value: "$faker.internet.ip", label: "IP Address" },
            { value: "$faker.internet.ipv6", label: "IPv6" },
            { value: "$faker.internet.userAgent", label: "User Agent" },
            { value: "$faker.internet.mac", label: "MAC Address" },
        ],
    },

    {
        label: "Phone",
        options: [
            { value: "$faker.phone.number", label: "Phone Number" },
            { value: "$faker.phone.imei", label: "IMEI" },
        ],
    },

    {
        label: "Location",
        options: [
            { value: "$faker.location.city", label: "City" },
            { value: "$faker.location.state", label: "State" },
            { value: "$faker.location.country", label: "Country" },
            { value: "$faker.location.zipCode", label: "Zip Code" },
            { value: "$faker.location.streetAddress", label: "Street Address" },
            { value: "$faker.location.latitude", label: "Latitude" },
            { value: "$faker.location.longitude", label: "Longitude" },
            { value: "$faker.location.timeZone", label: "Time Zone" },
            { value: "$faker.location.countryCode", label: "Country Code" },
        ],
    },

    {
        label: "Company",
        options: [
            { value: "$faker.company.name", label: "Company Name" },
            { value: "$faker.company.catchPhrase", label: "Catch Phrase" },
            { value: "$faker.company.buzzPhrase", label: "Buzz Phrase" },
        ],
    },

    {
        label: "Commerce",
        options: [
            { value: "$faker.commerce.product", label: "Product" },
            { value: "$faker.commerce.productName", label: "Product Name" },
            { value: "$faker.commerce.productDescription", label: "Description" },
            { value: "$faker.commerce.department", label: "Department" },
            { value: "$faker.commerce.price", label: "Price" },
        ],
    },

    {
        label: "Finance",
        options: [
            { value: "$faker.finance.amount", label: "Amount" },
            { value: "$faker.finance.accountNumber", label: "Account Number" },
            { value: "$faker.finance.creditCardNumber", label: "Credit Card" },
            { value: "$faker.finance.currencyCode", label: "Currency Code" },
            { value: "$faker.finance.currencyName", label: "Currency Name" },
            { value: "$faker.finance.iban", label: "IBAN" },
            { value: "$faker.finance.currencySymbol", label: "Currency Symbol" },
            { value: "$faker.finance.bic", label: "BIC / SWIFT" },
        ],
    },

    {
        label: "Date",
        options: [
            { value: "$faker.date.anytime", label: "Any Date" },
            { value: "$faker.date.past", label: "Past Date" },
            { value: "$faker.date.future", label: "Future Date" },
            { value: "$faker.date.recent", label: "Recent Date" },
            { value: "$faker.date.soon", label: "Soon" },
            { value: "$faker.date.birthdate", label: "Birthdate" },
        ],
    },

    {
        label: "Number",
        options: [
            { value: "$faker.number.int", label: "Integer" },
            { value: "$faker.number.float", label: "Float" },
            { value: "$faker.number.bigInt", label: "BigInt" },
            { value: "$faker.number.hex", label: "Hex Number" },
        ],
    },

    {
        label: "Lorem",
        options: [
            { value: "$faker.lorem.word", label: "Word" },
            { value: "$faker.lorem.words", label: "Words" },
            { value: "$faker.lorem.sentence", label: "Sentence" },
            { value: "$faker.lorem.paragraph", label: "Paragraph" },
            { value: "$faker.lorem.paragraphs", label: "Paragraphs" },
        ],
    },

    {
        label: "Image",
        options: [
            { value: "$faker.image.avatar", label: "Avatar" },
            { value: "$faker.image.url", label: "Image URL" },
            { value: "$faker.image.dataUri", label: "Data URI" },
        ],
    },

    {
        label: "Food",
        options: [
            { value: "$faker.food.dish", label: "Dish" },
            { value: "$faker.food.fruit", label: "Fruit" },
            { value: "$faker.food.vegetable", label: "Vegetable" },
            { value: "$faker.food.meat", label: "Meat" },
        ],
    },

    {
        label: "Vehicle",
        options: [
            { value: "$faker.vehicle.vehicle", label: "Vehicle" },
            { value: "$faker.vehicle.model", label: "Model" },
            { value: "$faker.vehicle.manufacturer", label: "Manufacturer" },
            { value: "$faker.vehicle.vin", label: "VIN" },
        ],
    },

    {
        label: "Book",
        options: [
            { value: "$faker.book.title", label: "Title" },
            { value: "$faker.book.author", label: "Author" },
            { value: "$faker.book.genre", label: "Genre" },
        ],
    },

    {
        label: "Boolean",
        options: [{ value: "$faker.datatype.boolean", label: "Boolean" }],
    },

    {
        label: "System",
        options: [
            { value: "$faker.system.fileName", label: "File Name" },
            { value: "$faker.system.mimeType", label: "MIME Type" },
            { value: "$faker.system.filePath", label: "File Path" },
            { value: "$faker.system.semver", label: "Semver" },
        ],
    },

    {
        label: "Color",
        options: [
            { value: "$faker.color.human", label: "Color Name" },
            { value: "$faker.color.rgb", label: "RGB Hex" },
        ],
    },
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
        username: "$faker.internet.username",
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

import { type } from "arktype";
import path from "node:path";
// import type { storageType } from '@/server/api/routers/storage/type'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createStore } from "zustand-x";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const zus = {
	withPersist<T extends Record<string, any>>(name: string) {
		return (defaults: T) =>
			createStore(name)(defaults, {
				// immer: { enabledAutoFreeze: true, enableMapSet: true },
				persist: { enabled: true, name },
			});
	},
	noPersist<T extends Record<string, any>>(name: string) {
		return (defaults: T) =>
			createStore(name)(defaults, {
				// immer: { enabledAutoFreeze: true, enableMapSet: true },
			});
	},
};

export const storageTypeList = [
	"image",
	"video",
	"audio",
	"document",
	"other",
	"font",
	"vector",
	"file",
	"archive",
] as const;
export const storageType = type.enumerated(...storageTypeList);

export const getFileType = (file: string): typeof storageType.infer => {
	// const extension = file.split(".").pop()?.toLowerCase();
	const extension = path.extname(file).slice(1).toLowerCase();

	for (const [type, extensions] of Object.entries(fileExtensions)) {
		if (extension && extensions.includes(extension as never)) {
			return type as typeof storageType.infer;
		}
	}

	return "file";
};

export const fileExtensions = {
	image: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff", "ico"],
	vector: [
		"ai",
		"eps",
		"cdr",
		"dwg",
		"dxf",
		"svg",
		"affdesign",
		"sketch",
		"xd",
		"figma",
		"xcf",
		"xpm",
		"xwd",
		"dds",
		"dib",
	],
	video: [
		"mp4",
		"mov",
		"avi",
		"webm",
		"mkv",
		"flv",
		"wmv",
		"3gp",
		"3g2",
		"mpg",
		"mpeg",
	],
	audio: [
		"mp3",
		"wav",
		"flac",
		"aac",
		"m4a",
		"ogg",
		"opus",
		"wma",
		"m4b",
		"m4r",
		"m4v",
	],
	document: [
		"pdf",
		"doc",
		"docx",
		"xls",
		"xlsx",
		"ppt",
		"pptx",
		"txt",
		"rtf",
		"odt",
		"ods",
	],
	font: ["ttf", "otf", "woff", "woff2"],
	archive: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso"],
	file: [
		"dmg",
		"app",
		"pkg",
		"deb",
		"rpm",
		"msi",
		"exe",
		"dll",
		"so",
		"dylib",
		"jar",
	],
	other: [],
} as const satisfies Record<typeof storageType.infer, string[]>;

// Utility function to calculate file size starting from bytes
export const calculateFileSize = (sizeInBytes: number, decimals = 2) => {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let size = sizeInBytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(decimals)} ${units[unitIndex]}`;
};

// export const getDefaultByZodType = (zod: Type<any>): any => {
//   if (zod instanceof ZodOptional) {
//     return getDefaultByZodType(zod._def.innerType)
//   }
//   if (zod instanceof ZodArray) {
//     return []
//   }
//   if (zod instanceof ZodObject) {
//     return Object.entries(zod.shape).reduce(
//       (acc, [key, value]) => {
//         acc[key] = getDefaultByZodType(value as ZodType)
//         return acc
//       },
//       {} as Record<string, any>,
//     )
//   }
//   if (zod instanceof ZodString || zod instanceof ZodEnum) {
//     return ''
//   }
//   if (zod instanceof ZodNumber) {
//     return 0
//   }
//   if (zod instanceof ZodBoolean) {
//     return false
//   }
//   return undefined
// }

export const getS3Url = (file: string) => {
	return `${import.meta.env.VITE_S3_CLIENT_ENDPOINT}${file}`;
};

export const getIndex = (imageUrl: string) => {
	// the url will looks like this: https://storage.zingfont.com/products/images-1.jpg
	// we want to get the 1
	const index = imageUrl.split("-").at(-1)?.split(".")[0];
	return index ? Number.parseInt(index) : 0;
};

export function hexToRgb(hx: string): { r: number; g: number; b: number } {
	// Remove the hash at the start if it's there
	const hex = hx.replace(/^#/, "");

	// Parse the hex values
	const bigint = Number.parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return { r, g, b };
}

export type JsonSchemaField = {
	key: string;
	value: any;
};

export type JsonSchema = {
	required?: JsonSchemaField[];
	optional?: JsonSchemaField[];
	domain?: string;
	sequence?: any;
	proto?: string;
	maxLength?: number;
	minLength?: number;
	max?: number;
	min?: number;
};

export const getDefaultByJsonSchema = (schema: JsonSchema): any => {
	if (schema.domain === "object") {
		const result: Record<string, any> = {};

		// Handle required fields
		schema.required?.forEach(({ key, value }) => {
			result[key] = getDefaultBySchemaValue(value);
		});

		// Handle optional fields
		schema.optional?.forEach(({ key, value }) => {
			result[key] = getDefaultBySchemaValue(value);
		});

		return result;
	}

	return getDefaultBySchemaValue(schema);
};

const getDefaultBySchemaValue = (value: any): any => {
	if (value === null) {
		return null;
	}

	// Handle string primitives
	if (typeof value === "string") {
		return value === "string" ? "" : getDefaultByDomain(value);
	}

	// Handle arrays
	if (Array.isArray(value)) {
		if (value.length === 0) return [];
		// Handle unit arrays (enums)
		if (typeof value[0] === "object" && "unit" in value[0]) {
			// Return first non-null unit or null
			const firstValidUnit = value.find(
				(item) => item.unit !== null && item.unit !== "undefined",
			);
			return firstValidUnit?.unit ?? null;
		}
		// Handle branches (union types)
		if ("branches" in value[0]) {
			const firstBranch = value[0].branches[0];
			return typeof firstBranch === "string"
				? getDefaultByDomain(firstBranch)
				: null;
		}
		return getDefaultBySchemaValue(value[0]);
	}

	// Handle objects
	if (typeof value === "object") {
		// Handle domain objects
		if ("domain" in value) {
			return getDefaultByDomain(value.domain, value);
		}

		// Handle sequence/proto combinations
		if ("sequence" in value && "proto" in value) {
			if (value.proto === "Array") {
				// Return empty array for sequence arrays
				return [];
			}
			const defaultValue =
				typeof value.sequence === "string"
					? getDefaultByDomain(value.sequence)
					: getDefaultByJsonSchema(value.sequence);
			return defaultValue;
		}

		// Handle regular sequence without proto
		if ("sequence" in value) {
			return getDefaultByJsonSchema(value.sequence);
		}

		// Handle branches (union types)
		if ("branches" in value) {
			const firstBranch = value.branches[0];
			return typeof firstBranch === "string"
				? getDefaultByDomain(firstBranch)
				: null;
		}

		// Handle schema-like objects
		if ("required" in value || "optional" in value) {
			return getDefaultByJsonSchema(value);
		}

		// Handle any other object structures
		const result: Record<string, any> = {};
		for (const [key, val] of Object.entries(value)) {
			result[key] = getDefaultBySchemaValue(val);
		}
		return result;
	}

	return undefined;
};

const getDefaultByDomain = (domain: string, options: any = {}): any => {
	switch (domain) {
		case "number":
			return options.min ?? 0;
		case "string":
			return "";
		case "object":
			return {};
		case "boolean":
			return false;
		case "array":
			return [];
		default:
			return undefined;
	}
};

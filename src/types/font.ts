export type GlyphInfo = {
	name: string;
	unicode: string;
	index: number;
};

type GlyphGroup = {
	name: string;
	glyphs: GlyphInfo[];
};

export type FontInfo = {
	copyright: string;
	licenseUrl: string;
	designer: string;
	designerUrl: string;
	version: string;
	trademark: string;
	vendor: string;
	vendorUrl: string;
	glyphCount: number;
	features: string;
	supportedLanguages: string[];
	date: string;
};

export type Font = {
	id: number;
	price: number;
	name: string;
	description: string;
	companyAvatar?: string;
	companyPaypal?: string;
	companyWebsite?: string;
	companyDescription?: string;
	companyOrigin?: string;
	descriptionAI: string;
	support: string[];
	downloadable: string;
	images: string[];
	categories: string[];
	licenses: string[];
	tags: string[];
	createdAt: string;
	slug: string;
	author?: string;
	authorCompany?: string;
	fontName?: string;
};

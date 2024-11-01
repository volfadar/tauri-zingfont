import { zus } from "@/lib/utils";
import type { Font } from "@/types/font";

export type GlyphInfo = {
	name: string;
	unicode: string;
	index: number;
};

type GlyphGroup = {
	name: string;
	glyphs: GlyphInfo[];
};

export type Selected = {
	font: Font | null;
	imageMode: boolean;
	tab: { font: string; tab: string }[];
	dialogImage: boolean;
	image: string | null;
	originalFile: File | null;
	adjustedImage: string | null;
	imageBlur: number;
	imageOpacity: number;
	size: number;
	positionX: number;
	positionY: number;
	aspectRatio: "16:9" | "4:3" | "3:4" | "1:1" | "9:16";
	blur: number;
	opacity: number;
	textPosition: { x: number; y: number };
	textRotation: number;
	textScale: number;
	copyAction: { type: "svg" | "png" | "font"; selected: boolean }[];
	downloadAction: { type: "svg" | "png" | "font"; selected: boolean }[];
	glyphs: GlyphGroup[];
	fontLoaded: boolean;
};

export const selected = zus
	.noPersist<Selected>("selected")({
		font: null,
		imageMode: false,
		tab: [],
		dialogImage: false,
		image: null,
		originalFile: null,
		adjustedImage: null,
		imageBlur: 0,
		imageOpacity: 100,
		size: 100,
		positionX: 50,
		positionY: 50,
		aspectRatio: "16:9",
		blur: 0,
		opacity: 100,
		textPosition: { x: 0, y: 0 },
		textRotation: 0,
		textScale: 1,
		copyAction: [
			{ type: "svg", selected: true },
			{ type: "png", selected: false },
		],
		downloadAction: [
			{ type: "font", selected: true },
			{ type: "svg", selected: false },
			{ type: "png", selected: false },
		],
		glyphs: [],
		fontLoaded: false,
	})
	.extendActions((set, get) => ({
		getImage: () => {
			return get.font()?.images[0];
		},
		setTab: (font: string, tab: string) => {
			set.tab([...get.tab().filter((t) => t.font !== font), { font, tab }]);
		},
	}))
	.extendSelectors((state, get) => ({
		getTab: (font: string) => {
			return get.tab().find((t) => t.font === font);
		},
	}));

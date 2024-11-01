// import type { FontInfo } from "@/app/(public)/font/[productSlug]/_tabs/glyph-list";
// import type { Font } from '@/components/product/search/main'
import { zus } from "@/lib/utils";
import type { Font, FontInfo } from "@/types/font";
import type { Hit } from "meilisearch";
import { setX } from ".";

export type Data = {
	fonts: Font[];
	color: string;
	size: number;
	sizeSingle: number;
	text: string;
	pinned: Hit<Font>[];
	maxPinned: number;
	fontInfo: FontInfo | null;
	isInImageMode: boolean;
	gridColumns: number;
	extractedColors: string[];
	selectedColor: string | null;
};

const dataDefault: Data = {
	fonts: [],
	color: "#000",
	text: "",
	size: 64,
	sizeSingle: 72,
	pinned: [],
	maxPinned: 0,
	fontInfo: null,
	isInImageMode: false,
	gridColumns: 2,
	extractedColors: [],
	selectedColor: null,
};

export const data = zus
	.noPersist<Data>("data")(dataDefault)
	.extendSelectors((state, get) => ({
		getFont: (id: number) => {
			return get.fonts().find((font) => font.id === id);
		},
		getIndex: (id: number) => {
			return get.fonts().findIndex((font) => font.id === id);
		},
		nextFont: (id: number) => {
			const index = get.fonts().findIndex((font) => font.id === id);
			return get.fonts()?.[index + 1] ?? null;
		},
		prevFont: (id: number) => {
			const index = get.fonts().findIndex((font) => font.id === id);
			return get.fonts()?.[index - 1] ?? null;
		},
	}))
	.extendActions((set, get) => ({
		reset: (key: keyof Data) => {
			set[key](dataDefault[key] as never);
		},
		next: (id: number | undefined) => {
			if (!id) return;
			const index = get.getIndex(id);
			const nextData = get.fonts()?.[index + 1] ?? null;
			setX.selected.font(nextData ?? null);
			return nextData?.slug;
		},
		prev: (id: number | undefined) => {
			if (!id) return;
			const index = get.getIndex(id);
			const prevData = get.fonts()?.[index - 1] ?? null;
			setX.selected.font(prevData ?? null);
			return prevData?.slug;
		},
	}));

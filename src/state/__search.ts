import { zus } from "@/lib/utils";
import { Meilisearch } from "meilisearch";

export type Search = {
	page: number;
	query: string;
	meili: Meilisearch;
	index: string;
	perPage: number;
	imageQuery: string;
};

// export type Font = {
//   id: number
//   price: number
//   name: string
//   description: string
//   support: string[]
//   downloadable: string
//   images: string[]
//   categories: string[]
//   licenses: string[]
//   tags: string[]
//   createdAt: string
//   slug: string
//   author: string
//   authorCompany: string
// }

function getParam<T extends string>(name: T, defaultValue: T) {
	if (typeof window === "undefined") return defaultValue;

	return new URLSearchParams(window.location.search).get(name)
		? (new URLSearchParams(window.location.search).get(name) as T)
		: defaultValue;
}

export const search = zus
	.noPersist<Search>("search")({
		page: Number(getParam("page", "1")),
		perPage: 16,
		query: getParam("q", ""),
		meili: new Meilisearch({
			host: import.meta.env.VITE_MEILISEARCH_URL!,
			apiKey: import.meta.env.VITE_MEILISEARCH_API_KEY!,
		}),
		index: import.meta.env.VITE_MEILISEARCH_INDEX!,
		imageQuery: "",
	})
	.extendSelectors((state, get, api) => ({
		client: () => state.meili.getIndex(state.index),
		results: async (query: string, page: string) => {
			const res = await get.meili().multiSearch({
				queries: [
					{
						indexUid: get.index(),
						q: query,
						limit: get.perPage(),
						page: Number(page),
					},
				],
			});
			return res;
		},
	}));

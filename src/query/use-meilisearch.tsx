"use client";
import { setX, useStore } from "@/state";
import type { Font } from "@/types/font";
import { useThrottleCallback } from "@react-hook/throttle";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { MultiSearchQuery } from "meilisearch";
import { useEffect, useState } from "react";

export function useMeilisearch() {
	const query = useStore().search.query();
	const imageQuery = useStore().search.imageQuery();
	const page = useStore().search.page();
	const meili = useStore().search.meili();
	const indexUid = useStore().search.index();
	const ratio = useStore().selected.aspectRatio();
	const adjustedImage = useStore().selected.adjustedImage();
	const pinned = useStore().data.pinned();
	const maxPinned = useStore().data.maxPinned();

	const throttledSearch = useThrottleCallback((value: string) => {
		if (!value) return;
		setX.search.query(value);
		setX.search.page(1);
	}, 1.3);

	const [imgQueryOpt, setImgQueryOpt] = useState<MultiSearchQuery>({
		indexUid,
		q: imageQuery ? `${query} ${imageQuery}` : query,
		hitsPerPage: 16,
		page,
		hybrid: {
			embedder: "default",
			semanticRatio: 0.7,
		},
	});

	useEffect(() => {
		// if (adjustedImage) {
		switch (ratio) {
			case "1:1":
				setX.data.maxPinned(6);
				setImgQueryOpt({
					...imgQueryOpt,
					page,
					q: imageQuery ? `${query} ${imageQuery}` : query,
					hitsPerPage: adjustedImage ? 6 - (pinned.length % 3) : 16,
					...(pinned.length
						? { filter: `id NOT IN [${pinned.map((p) => p.id).join(",")}]` }
						: {}),
				});
				break;
			case "3:4":
			case "9:16":
				setX.data.maxPinned(8);
				setImgQueryOpt({
					...imgQueryOpt,
					page,
					q: imageQuery ? `${query} ${imageQuery}` : query,
					hitsPerPage: adjustedImage ? 8 - (pinned.length % 4) : 16,
					...(pinned.length
						? { filter: `id NOT IN [${pinned.map((p) => p.id).join(",")}]` }
						: {}),
				});
				break;
			case "16:9":
			case "4:3":
				setX.data.maxPinned(8);
				setImgQueryOpt({
					...imgQueryOpt,
					page,
					q: imageQuery ? `${query} ${imageQuery}` : query,
					hitsPerPage: adjustedImage ? 8 - (pinned.length % 2) : 16,
					...(pinned.length
						? { filter: `id NOT IN [${pinned.map((p) => p.id).join(",")}]` }
						: {}),
				});
				break;
		}
		// }
	}, [
		adjustedImage,
		ratio,
		page,
		query,
		imageQuery,
		pinned.length,
		imgQueryOpt,
		pinned.map,
	]);

	const results = useQuery({
		queryKey: ["search", query, page, imageQuery, imgQueryOpt],
		queryFn: async () =>
			await meili.multiSearch<Font>({
				queries: [imgQueryOpt],
			}),
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
	});

	// const changePage = useCallback(
	//   (page: number) => {
	//     router.push(
	//       `${pathname}?${createQueryString([{ name: 'page', value: page.toString() }])}`,
	//       { scroll: false },
	//     )
	//   },
	//   [pathname, createQueryString, router],
	// )

	const totalHits = results?.data?.results
		.map((result) => result.totalHits || result.estimatedTotalHits || 0)
		.reduce((a, b) => a + b, 0);

	return {
		search: throttledSearch,
		query,
		page,
		results: results?.data?.results.flatMap((e) => e.hits),
		total: totalHits ? Math.ceil(totalHits / 16) : 0,
		...results,
	};
}

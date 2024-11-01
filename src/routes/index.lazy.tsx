import { Hit } from "@/components/search/hit";
import { useCursorEvents } from "@/hooks/use-cursor-events";
import { useMeilisearch } from "@/query/use-meilisearch";
import { createLazyFileRoute } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useRef, useState } from "react";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const [display, setDisplay] = useState(true);
	const search = useMeilisearch();
	const overlayRef = useRef<HTMLDivElement>(null);

	// Use the cursor events hook
	useCursorEvents(overlayRef, { enabled: display });

	useEffect(() => {
		const unlisten = listen("shortcut", (event) => {
			console.log("Shortcut triggered:", event);
			setDisplay((prev) => !prev);
		});

		return () => {
			unlisten.then((unlistenFn) => unlistenFn());
		};
	}, []);

	return (
		<div
			className="relative w-dvw"
			style={{ height: window.screen.availHeight }}
		>
			{display && (
				<div
					ref={overlayRef}
					className="bottom-4 right-4 left-4 absolute bg-white/90 p-2 shadow-lg backdrop-blur-lg"
				>
					<div className="flex flex-nowrap overflow-x-scroll [&::-webkit-scrollbar]:hidden">
						{search.results?.map((result) => (
							<Hit key={result.id} hit={result} />
						))}
						{search.isLoading && <div>Loading...</div>}
					</div>
				</div>
			)}
		</div>
	);
}

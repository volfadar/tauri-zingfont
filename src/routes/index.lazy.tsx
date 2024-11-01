import { useMeilisearch } from "@/query/use-meilisearch";
import { createLazyFileRoute } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/")({
	component: Index,
});

function Index() {
	const [display, setDisplay] = useState(true);
	const search = useMeilisearch();

	useEffect(() => {
		// Listen for the shortcut event from Rust
		const unlisten = listen("shortcut", (event) => {
			console.log("Shortcut triggered:", event);
			setDisplay((prev) => !prev);
		});

		// Cleanup listener on component unmount
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
				<div className="bottom-4 right-4 absolute bg-slate-500">
					{search.results?.map((result) => (
						<div key={result.id}>{result.name}</div>
					))}
					{search.isLoading && <div>Loading...</div>}
				</div>
			)}
		</div>
	);
}

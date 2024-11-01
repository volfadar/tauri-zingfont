import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { useEffect, useRef } from "react";

type Options = {
	enabled?: boolean;
	interval?: number;
};

export function useCursorEvents(
	ref: React.RefObject<HTMLElement>,
	options: Options = {},
) {
	const { enabled = true, interval = 50 } = options;
	const intervalRef = useRef<number>();

	useEffect(() => {
		if (!enabled) return;

		const checkMousePosition = async () => {
			try {
				const pos: any = await invoke("get_mouse_position");
				if (!pos || !ref.current) return;

				const rect = ref.current.getBoundingClientRect();
				const isOverElement =
					pos.clientX >= rect.left &&
					pos.clientX <= rect.right &&
					pos.clientY >= rect.top &&
					pos.clientY <= rect.bottom;

				await appWindow.setIgnoreCursorEvents(!isOverElement);
			} catch (error) {
				console.error("Error checking mouse position:", error);
			}
		};

		// Start interval
		intervalRef.current = window.setInterval(checkMousePosition, interval);

		// Cleanup
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			// Reset to ignore cursor events when unmounting
			appWindow.setIgnoreCursorEvents(true).catch(console.error);
		};
	}, [enabled, interval, ref]);
}

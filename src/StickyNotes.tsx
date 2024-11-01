import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import {
	AnimatePresence,
	motion,
	useMotionValue,
	useSpring,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Position = {
	x: number;
	y: number;
};

export default function StickyNote() {
	const [isDragging, setIsDragging] = useState(false);
	const [targetPosition, setTargetPosition] = useState<Position>({
		x: 100,
		y: 100,
	});
	const [hasSnapped, setHasSnapped] = useState(false);
	const noteRef = useRef<HTMLDivElement>(null);

	// Base motion values
	const mouseX = useMotionValue(targetPosition.x);
	const mouseY = useMotionValue(targetPosition.y);

	// Transform with interpolation for smooth movement
	const x = useSpring(mouseX, { damping: 50, stiffness: 400, duration: 0.05 });
	const y = useSpring(mouseY, { damping: 50, stiffness: 400, duration: 0.05 });

	// Update motion values when target position changes
	useEffect(() => {
		mouseX.set(targetPosition.x);
		mouseY.set(targetPosition.y);
	}, [targetPosition, mouseX, mouseY]);

	useEffect(() => {
		const checkMousePosition = async () => {
			try {
				const pos: any = await invoke("get_mouse_position");
				if (!pos) return;

				const noteRect = noteRef.current?.getBoundingClientRect();
				if (!noteRect) return;

				const isOverNote =
					pos.clientX >= noteRect.left &&
					pos.clientX <= noteRect.right &&
					pos.clientY >= noteRect.top &&
					pos.clientY <= noteRect.bottom;

				await appWindow.setIgnoreCursorEvents(!isOverNote);
			} catch (error) {
				console.error("Error checking mouse position:", error);
			}
		};

		const interval = setInterval(checkMousePosition, 50);
		return () => clearInterval(interval);
	}, []);

	const handleMouseDown = async () => {
		if (!hasSnapped) {
			setHasSnapped(true);
		}
		setIsDragging(true);
	};

	const handleMouseMove = useCallback(async () => {
		if (!isDragging) return;

		const pos: any = await invoke("get_mouse_position");
		if (!pos) return;

		setTargetPosition({
			x: pos.clientX,
			y: pos.clientY,
		});
	}, [isDragging]);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	useEffect(() => {
		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleMouseMove, handleMouseUp]);

	return (
		<AnimatePresence>
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				className="w-0.5 h-0.5 bg-transparent flex justify-center items-center"
				style={{
					position: "absolute",
					left: x,
					top: y,
					cursor: isDragging ? "grabbing" : "grab",
					userSelect: "none",
				}}
			>
				<div
					ref={noteRef}
					style={{
						padding: "1rem",
						background: "yellow",
					}}
					onMouseDown={handleMouseDown}
				>
					<p
						style={{
							border: "none",
							background: "transparent",
							resize: "both",
							minWidth: "200px",
							minHeight: "100px",
						}}
					>
						Hello
					</p>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}

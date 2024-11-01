import { cn } from "@/lib/utils";
import { useStore } from "@/state";
// import { Image } from '@nextui-org/react'
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

export function FontTextInImage({
	slug,
	name,
	align,
	defaultText = "",
	className,
	shadowSize,
}: {
	slug: string;
	name: string;
	align: "start" | "center";
	defaultText?: string;
	className?: string;
	shadowSize?: number;
}) {
	const colorValue = useStore().data.color();
	const textValue = useStore().data.text();
	const size = useStore().data.size();
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

	const [text] = useDebounce(textValue || defaultText, 1000);
	const [fontSize] = useDebounce(size, 600);
	const [color] = useDebounce(colorValue, 600);

	const style = useMemo(() => {
		return {
			width: `${Math.floor((width / (fontSize || 80)) * size)}px`,
			height: `${Math.floor((height / (fontSize || 80)) * size)}px`,
			maxWidth: "100%",
			maxHeight: "100%",
		};
	}, [size, width, height, fontSize]);

	const fontTextInImageUrl = useMemo(() => {
		const baseUrl = `${import.meta.env.VITE_MAIN_URL}/api/generate-image`;
		const params = new URLSearchParams();

		params.append("fontSlug", slug);
		params.append("fontSize", fontSize.toString());
		if (color) params.append("color", color);

		if (text) params.append("text", text.slice(0, 60));

		return `${baseUrl}?${params.toString()}`;
	}, [slug, color, text, fontSize]);
	return (
		// <ScrollShadow
		//   orientation="horizontal"
		//   className={cn(
		//     ' [&::-webkit-scrollbar]:h-0  md:[&::-webkit-scrollbar]:h-1.5 md:[&::-webkit-scrollbar-track]:bg-slate-200 md:[&::-webkit-scrollbar-thumb]:bg-slate-300 md:[&::-webkit-scrollbar-thumb:hover]:bg-slate-400',
		//     className,

		//   )}
		//   size={size || 30}
		// >
		<div
			style={style}
			className={cn("flex w-full items-center justify-center", {
				"justify-start": align === "start",
				"justify-center": align === "center",
			})}
		>
			<img
				// as={NextImage}
				src={fontTextInImageUrl}
				alt={name}
				width={1850}
				height={150}
				className="object-contain max-h-[150px]"
				sizes={"100vw"}
				draggable={false}
				onLoad={(e) => {
					setWidth((e.target as HTMLImageElement)?.naturalWidth || 0);
					setHeight((e.target as HTMLImageElement)?.naturalHeight || 0);
				}}
			/>
		</div>
		// </ScrollShadow>
	);
}

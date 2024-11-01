"use client";
import { cn } from "@/lib/utils";
import { Tooltip } from "@nextui-org/react";
import { Loader2 } from "lucide-react";

import { getS3Url } from "@/lib/utils";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import { useDownload } from "@/hooks/use-download";
import { setX, useStore } from "@/state";
import type { Font } from "@/types/font";
import { Copy } from "lucide-react";
import type { Hit as MeilisearchHit } from "meilisearch";
import { useState } from "react";
// import type { Font } from "./main";

type DownloadButtonProps = {
	onClick?: () => void;
	isLoading?: boolean;
	tooltip: string | React.ReactNode;
	icon: React.ReactNode;
	placement?:
		| "top"
		| "bottom"
		| "right"
		| "left"
		| "top-start"
		| "top-end"
		| "bottom-start"
		| "bottom-end"
		| "left-start"
		| "left-end"
		| "right-start"
		| "right-end";
	fadeTo?: "top" | "bottom" | "left" | "right";
	text?: string;
	hoverAnimation?: boolean;
} & (
	| ({ as: "button" } & React.ComponentPropsWithoutRef<"button">)
	| ({ as: "a" } & React.ComponentPropsWithoutRef<"a">)
);

export function DownloadButton({
	onClick,
	isLoading,
	tooltip,
	icon,
	as,
	placement = "bottom",
	className,
	text,
	hoverAnimation = true,
	fadeTo = "top",
	...props
}: DownloadButtonProps) {
	const [open, setOpen] = useState(false);
	const Component = as;
	return (
		<Tooltip
			offset={10}
			content={tooltip}
			placement={placement}
			delay={400}
			closeDelay={200}
			className="!m-0 !p-0"
			onOpenChange={setOpen}
		>
			{/* @ts-ignore */}
			<Component
				onClick={onClick}
				className={cn(
					"group/download h-[2.2rem] rounded-md flex items-center justify-center py-2 px-3 bg-white/80 hover:bg-white/90 shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out ",
					{
						"opacity-0 group-hover/hit:opacity-100": !open && !isLoading,
						"group-hover/hit:-translate-y-2":
							fadeTo === "top" && !open && !isLoading && hoverAnimation,
						"group-hover/hit:translate-y-2":
							fadeTo === "bottom" && !open && !isLoading && hoverAnimation,
						"group-hover/hit:-translate-x-2":
							fadeTo === "left" && !open && !isLoading && hoverAnimation,
						"group-hover/hit:translate-x-2":
							fadeTo === "right" && !open && !isLoading && hoverAnimation,
						"-translate-y-2":
							fadeTo === "top" && (open || isLoading) && hoverAnimation,
						"translate-y-2":
							fadeTo === "bottom" && (open || isLoading) && hoverAnimation,
						"-translate-x-2":
							fadeTo === "left" && (open || isLoading) && hoverAnimation,
						"translate-x-2":
							fadeTo === "right" && (open || isLoading) && hoverAnimation,
					},
					className,
				)}
				{...props}
			>
				<span className="text-slate-600 group-hover/download:text-blue-600 transition-all duration-300 ease-in-out flex items-center justify-center gap-1.5 text-sm">
					{isLoading ? (
						<Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
					) : (
						icon
					)}
					{!!text && <span className="mb-0.5">{text}</span>}
				</span>
			</Component>
		</Tooltip>
	);
}

export function ActionButtons({ hit }: { hit: MeilisearchHit<Font> }) {
	const copyAction = useStore().selected.copyAction();
	const selectedCopyAction = copyAction.find((a) => a.selected) ?? {
		type: "svg",
		selected: true,
	};
	const downloadAction = useStore().selected.downloadAction();
	const selectedDownloadAction = downloadAction.find((a) => a.selected) ?? {
		type: "font",
		selected: true,
	};
	const download = useDownload({ slug: hit.slug, name: hit.name, id: hit.id });
	return (
		<div className="flex items-center justify-end space-x-2 absolute right-4  transition-all duration-300 ease-in-out bottom-2">
			<DownloadButton
				as="button"
				onClick={() => {
					if (!selectedCopyAction?.type) return;
					switch (selectedCopyAction.type) {
						case "svg":
							download.svg.copy.mutate();
							break;
						case "png":
							download.png.copy.mutate();
							break;
					}
				}}
				isLoading={
					selectedCopyAction.type === "svg"
						? download.svg.copy.isPending
						: download.png.copy.isPending
				}
				text={selectedCopyAction?.type}
				tooltip={
					<ActionList
						action="copy"
						list={copyAction}
						onClick={(type) => {
							setX.selected.copyAction(
								copyAction.map((a) => ({
									...a,
									selected: a.type === type,
								})),
							);

							switch (type) {
								case "svg":
									download.svg.copy.mutate();
									break;
								case "png":
									download.png.copy.mutate();
									break;
							}
						}}
					/>
				}
				icon={<Copy className="h-4 w-4" />}
			/>
			<DownloadButton
				as="button"
				onClick={() => {
					if (!selectedDownloadAction?.type) return;
					switch (selectedDownloadAction.type) {
						case "svg":
							download.svg.download.mutate();
							break;
						case "png":
							download.png.download.mutate();
							break;
						case "font":
							download.zip.mutate(getS3Url(hit.downloadable));
							break;
					}
				}}
				isLoading={
					selectedDownloadAction.type === "svg"
						? download.svg.download.isPending
						: selectedDownloadAction.type === "png"
							? download.png.download.isPending
							: download.zip.isPending
				}
				text={selectedDownloadAction?.type}
				tooltip={
					<ActionList
						action="download"
						list={downloadAction}
						onClick={(type) => {
							setX.selected.downloadAction(
								downloadAction.map((a) => ({
									...a,
									selected: a.type === type,
								})),
							);

							switch (type) {
								case "svg":
									download.svg.download.mutate();
									break;
								case "png":
									download.png.download.mutate();
									break;
								case "font":
									download.zip.mutate(getS3Url(hit.downloadable));
									break;
							}
						}}
					/>
				}
				icon={<Download className="h-4 w-4" />}
			/>
			<DownloadButton
				as="button"
				// className="transition-all duration-300 ease-in-out bg-white/80 shadow-md backdrop-blur-sm group/share"
				onClick={() => {
					navigator.clipboard.writeText(
						`${window.location.origin}/font/${hit.slug}`,
					);
					toast.success("Product URL copied");
				}}
				placement="top"
				tooltip={<span className="m-1 mx-2">Share product URL</span>}
				icon={<Share2 className="w-4 h-4 " />}
			/>
		</div>
	);
}

function ActionList({
	list,
	onClick,
	action,
}: {
	list: { type: "svg" | "png" | "font"; selected: boolean }[];
	action: "copy" | "download";
	onClick: (value: string) => void;
}) {
	return (
		<div className="flex flex-col items-center justify-end w-full p-1">
			{list.map((item) => (
				<div
					key={item.type}
					onKeyUp={() => onClick(item.type)}
					className={cn(
						"flex w-full items-center border-l-2 px-3 cursor-pointer hover:bg-slate-100 duration-300 ease-in-out py-1 text-base border-transparent",
						item.selected && "border-blue-500",
					)}
				>
					<div className="flex items-center gap-1 text-left">
						<span className="text-slate-500 text-sm font-normal">{`${action} `}</span>
						<span className="font-medium">{item.type}</span>
					</div>
				</div>
			))}
		</div>
	);
}

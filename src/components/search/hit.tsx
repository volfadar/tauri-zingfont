"use client";
// import { FontTextInImage } from "@/components/product/single/font-text-in-image";
import { cn } from "@/lib/utils";
import { setX, useStore } from "@/state";
import type { Font } from "@/types/font";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/react";
import { CheckCircle2, Pin } from "lucide-react";
import type { Hit as MeilisearchHit } from "meilisearch";
import { FontTextInImage } from "../font-text-in-image";
import { ActionButtons } from "./download-button";

export function Hit({ hit }: { hit: MeilisearchHit<Font> }) {
	const pinned = useStore().data.pinned();

	const isFreeCommercial = /personal/gi.test(hit.licenses.join(","));
	const isPinned = pinned.some((pinned) => pinned.id === hit.id);

	return (
		<div
			className="group/hit relative h-[12rem] min-w-[22rem] border border-slate-200 hover:border-white hover:shadow-xl hover:shadow-slate-200/70flex flex-col justify-center items-center"
			key={hit.id}
		>
			<div className="absolute top-3 left-3 z-10">
				<Button
					className={cn(
						" md:opacity-0 transition-all duration-300 ease-in-out group-hover/hit:opacity-100 bg-white group/button ",
						{
							"bg-red-100 !opacity-100": isPinned,
							"hover:bg-slate-100": !isPinned,
						},
					)}
					isIconOnly
					onClick={() => {
						if (isPinned) {
							setX.data.pinned(pinned.filter((pinned) => pinned.id !== hit.id));
						} else {
							setX.data.pinned([...pinned, hit]);
						}
					}}
					size="sm"
				>
					<Pin
						className={cn(
							"w-5 h-5 text-slate-400   transition-all duration-300 ease-in-out",
							{
								"text-red-500 group-hover/button:text-red-700": isPinned,
								"group-hover/button:text-slate-400": !isPinned,
							},
						)}
					/>
				</Button>
			</div>
			<div
				// href={`https://zingfont.com/font/${hit.slug}`}
				key={hit.id}
				className={cn(
					"is !m-0 flex flex-col gap-1 h-full w-full cursor-pointer items-center justify-center duration-200 ease-in-out py-4 px-12 relative",
				)}
			>
				<div className="relative z-10 w-full overflow-hidden">
					<div className="flex items-center justify-center">
						{!isFreeCommercial ? (
							<Tooltip
								offset={10}
								delay={200}
								content={
									<div className="flex gap-1 justify-center items-center">
										Commercial use allowed until{" "}
										<span className="font-semibold">
											{new Date(
												Date.now() + 7 * 24 * 60 * 60 * 1000,
											).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</span>
										<div
											// href={`${import.meta.env.VITE_MAIN_URL}/license`}
											className="text-blue-500 font-semibold text-xs"
										>
											Learn More
										</div>
									</div>
								}
								placement="top"
							>
								<div className="bg-green-100 text-green-500 py-1 px-1.5 pr-2 rounded-[999px] flex items-center font-semibold text-xs">
									<CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />1 Week
									Commercial Use
								</div>
							</Tooltip>
						) : (
							<div className="bg-slate-100 text-slate-500 py-1 px-1.5 pr-2 rounded-[999px] flex items-center font-semibold text-xs">
								<CheckCircle2 className="w-4 h-4 mr-1 text-slate-500" />{" "}
								Personal Use Only
							</div>
						)}
					</div>
					<div className="py-2 flex flex-col items-center justify-center px-5 w-full overflow-hidden">
						<FontTextInImage
							slug={hit.slug}
							name={hit.name}
							align="center"
							className="max-w-full"
						/>
					</div>
				</div>
			</div>
			{/* share button */}
			{/* <div className="absolute top-3 right-3 z-10">
        <Button
          isIconOnly
          className="group/share opacity-0 group-hover/hit:opacity-100 rounded-[999px] bg-transparent hover:bg-slate-100 transition-all duration-300 ease-in-out"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/font/${hit.slug}`,
            )
            toast.success('Product URL copied')
          }}
        >
          <Share2 className="w-5 h-5 text-slate-400 group-hover/share:text-slate-700 transition-all duration-300 ease-in-out" />
        </Button>
      </div> */}
			{/* Placeholder for font name and creators name or studio name */}
			<div className="absolute bottom-3 left-3 flex-col opacity-0 group-hover/hit:opacity-100 flex justify-center gap-1 transition-all duration-300 ease-in-out">
				<div className="text-base font-medium text-slate-500 group-hover/hit:text-slate-800 transition-all duration-300 ease-in-out">
					{/* also remove "serif", "sans-serif", "monospace","script","display","unique","elegant","beatifull", "vintage" */}
					<span className="font-medium">
						{(hit.fontName || hit.name).replace(
							/[^\w\s]|serif|font|medieval|elegant|elegance|sans|handbrush|brush|modern|regular|monoline|beautiful|vintage|script|display|unique|elegant/gi,
							"",
						)}
					</span>
				</div>
				<span className="text-xs font-semibold text-slate-500">
					by <span>{hit.authorCompany || hit.author}</span>
				</span>
			</div>
			{/* Icons for download PNG, SVG, ZIP */}
			<ActionButtons hit={hit} />
			{/* <div className="absolute bottom-0 right-2 flex items-center justify-end">
        <div
          onClick={() => {
            download.svg.mutate()
          }}
          className="group/copy rounded-md cursor-pointer py-5 px-[10px] md:opacity-0 transition-all duration-300 ease-in-out group-hover/hit:bottom-0 group-hover/hit:opacity-100"
        >
          <Tooltip
            offset={10}
            content="SVG Download"
            placement="bottom"
            delay={200}
          >
            {download.svg.isPending ? (
              <Loader2 className="h-5 w-5 text-slate-200 animate-spin" />
            ) : (
              <PenTool className="h-5 w-5 text-slate-400 duration-300 ease-in-out group-hover/copy:text-slate-700" />
            )}
          </Tooltip>
        </div>
        <div
          onClick={() => {
            download.png.mutate()
          }}
          className="group/copy rounded-md cursor-pointer py-5 px-[10px] md:opacity-0 transition-all duration-300 ease-in-out group-hover/hit:bottom-0 group-hover/hit:opacity-100"
        >
          <Tooltip
            offset={10}
            content="PNG Download"
            placement="bottom"
            delay={200}
          >
            {download.png.isPending ? (
              <Loader2 className="h-5 w-5 text-slate-200 animate-spin" />
            ) : (
              <ImageDown className="h-5 w-5 text-slate-400 duration-300 ease-in-out group-hover/copy:text-slate-700" />
            )}
          </Tooltip>
        </div>
        <a
          download
          href={getS3Url(hit.downloadable)}
          onClick={() => download.zip.mutate()}
          className="group/download rounded-md py-5 px-[10px] md:opacity-0 transition-all duration-300 ease-in-out group-hover/hit:bottom-0 group-hover/hit:opacity-100"
        >
          <Tooltip
            offset={10}
            content="ZIP Download"
            placement="bottom"
            delay={200}
          >
            <Download className="h-5 w-5 text-slate-400 duration-300 ease-in-out group-hover/download:text-slate-700" />
          </Tooltip>
        </a>
      </div> */}
		</div>
	);
}

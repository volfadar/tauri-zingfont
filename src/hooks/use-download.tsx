import { useTrackDownload } from "@/query/use-track-download";
import { useStore } from "@/state";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";
import { useDeviceDetection } from "./use-device-detection";

export function useDownload({
	slug,
	name,
	id,
}: { slug: string; name: string; id: number }) {
	const colorValue = useStore().data.color();
	const textValue = useStore().data.text();
	const size = useStore().data.size();
	const download = useTrackDownload();
	const dv = useDeviceDetection();
	const { width: w, height: h } = dv;
	const isPc = !(dv.isMobile || dv.isIpad || dv.isIphone);

	const ip = useStore().dataPersist.ip();

	const [text] = useDebounce(textValue, 1000);
	const [fontSize] = useDebounce(size, 600);

	const fontTextInImageUrl = useMemo(() => {
		const baseUrl = `${import.meta.env.VITE_MAIN_URL}/api/generate-image`;
		const params = new URLSearchParams();

		params.append("fontSlug", slug);
		params.append("fontSize", fontSize.toString());
		if (colorValue) params.append("color", colorValue);

		if (text) params.append("text", text);

		return `${baseUrl}?${params.toString()}`;
	}, [slug, colorValue, text, fontSize]);

	const svgDownload = useMutation({
		mutationKey: ["svgDownload", fontTextInImageUrl, text],
		mutationFn: async () => {
			return await fetch(
				`${fontTextInImageUrl}&scale=5&type=svg&action=download`,
			).then(async (res) => await res.text());
		},
		onSuccess: async (svgString) => {
			const blob = new Blob([svgString], { type: "image/svg+xml" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${name} ${text ? `- ${text}` : ""}.svg`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			download.mutate({
				id: id,
				type: "svg",
				ip,
				isPc,
				w,
				h,
				action: "download",
			});
			toast.success(`SVG downloaded`);
		},
		onError: (error) => {
			toast.error(`Error downloading SVG: ${error.message}`);
		},
	});

	const svgCopy = useMutation({
		mutationKey: ["svgCopy", fontTextInImageUrl, text],
		mutationFn: async () => {
			toast.info(`${fontTextInImageUrl}&scale=5&type=svg&action=copy`);
			return await fetch(
				`${fontTextInImageUrl}&scale=5&type=svg&action=copy`,
			).then(async (res) => await res.text());
		},
		onSuccess: async (svgString) => {
			await navigator.clipboard.writeText(svgString);
			download.mutate({ id: id, type: "svg", ip, isPc, w, h, action: "copy" });
			toast.success(`SVG copied`);
		},
		onError: (error) => {
			toast.error(`Error copying SVG: ${error.message}`);
		},
	});

	const pngDownload = useMutation({
		mutationKey: ["pngDownload", fontTextInImageUrl, text],
		mutationFn: async () => {
			return await fetch(
				`${fontTextInImageUrl}&scale=5&type=png&action=download`,
			).then(async (res) => await res.blob());
		},
		onSuccess: async (blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${name} ${text ? `- ${text}` : ""}.png`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			download.mutate({
				id: id,
				type: "png",
				ip,
				isPc,
				w,
				h,
				action: "download",
			});
			toast.success(`PNG downloaded`);
		},
		onError: (error) => {
			toast.error(`Error downloading PNG: ${error.message}`);
		},
	});

	const pngCopy = useMutation({
		mutationKey: ["pngCopy", fontTextInImageUrl, text],
		mutationFn: async () => {
			return await fetch(
				`${fontTextInImageUrl}&scale=5&type=png&action=copy`,
			).then(async (res) => await res.blob());
		},
		onSuccess: async (blob) => {
			await navigator.clipboard.write([
				new ClipboardItem({ [blob.type]: blob }),
			]);
			download.mutate({ id: id, type: "png", ip, isPc, w, h, action: "copy" });
			toast.success(`PNG copied`);
		},
		onError: (error) => {
			toast.error(`Error copying PNG: ${error.message}`);
		},
	});

	return {
		svg: {
			copy: svgCopy,
			download: svgDownload,
		},
		png: {
			copy: pngCopy,
			download: pngDownload,
		},
		zip: {
			mutate: (url: string) => {
				const aTag = document.createElement("a");
				aTag.href = url;
				document.body.appendChild(aTag);
				aTag.click();
				document.body.removeChild(aTag);
				download.mutate({
					id: id,
					type: "zip",
					ip,
					isPc,
					w,
					h,
					action: "download",
				});
			},
			isPending: false,
		},
	};
}

import { useMutation } from "@tanstack/react-query";
import { type } from "arktype";

const downloadTypeList = ["svg", "png", "zip"] as const;

export const trackDownloadKey = type({
	id: "number",
	type: type.enumerated(...downloadTypeList),
	ip: "string",
	isPc: "boolean",
	w: "number",
	h: "number",
	action: "string",
});

export function useTrackDownload() {
	const trackDownload = useMutation({
		mutationKey: ["trackDownload"],
		mutationFn: async (props: typeof trackDownloadKey.infer) => {
			return await fetch(
				`${import.meta.env.VITE_MAIN_URL}/api/trpc/product.download`,
			);
		},
	});

	return trackDownload;
}

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/settings")({
	validateSearch: z.object({
		tab: z.number().optional(),
	}),
	component: () => <div>Hello Settings!</div>,
});

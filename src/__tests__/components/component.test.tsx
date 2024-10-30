import { cleanup, render, screen } from "@testing-library/react";
import { afterEach } from "node:test";
import { describe, expect, it } from "vitest";
import SettingWindow from "../../SettingWindow";

afterEach(() => {
	cleanup();
});

describe("SettingWindow", () => {
	it("should be defined", () => {
		render(<SettingWindow />);

		expect(screen).toBeDefined();
	});
});

// it("Should render font card", async () => {
//     const font: ISpriteConfig = defaultFont[0];

//     const petCardProps = {
//         btnLabel: "test",
//         font: font,
//         btnFunction: () => {
//             console.log("output from test");
//         },
//         type: FontCardType.Add,
//     }
//     render(<FontCard {...petCardProps} />);
//     expect(screen.getByText(font.name)).toBeDefined();
// });

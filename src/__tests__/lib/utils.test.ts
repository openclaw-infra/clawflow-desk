import { describe, test, expect } from "bun:test";
import { cn } from "../../mainview/lib/utils";

describe("cn utility", () => {
	test("merges class names", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	test("handles conditional classes", () => {
		expect(cn("base", true && "active", false && "hidden")).toBe("base active");
	});

	test("merges tailwind conflicts", () => {
		expect(cn("px-4", "px-6")).toBe("px-6");
		expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
	});

	test("handles empty inputs", () => {
		expect(cn()).toBe("");
		expect(cn("", "", "")).toBe("");
	});

	test("handles undefined and null", () => {
		expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
	});

	test("handles arrays", () => {
		expect(cn(["foo", "bar"])).toBe("foo bar");
	});
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	root: "src/mainview",
	base: "./",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src/mainview"),
		},
	},
	build: {
		outDir: "../../dist",
		emptyOutDir: true,
	},
});

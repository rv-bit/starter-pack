import type { NextConfig } from "next";

import "./src/utils/environment/env.client";
import "./src/utils/environment/env.server";

const nextConfig: NextConfig = {
	turbopack: {
		resolveAlias: {
			html2canvas: "html2canvas-pro",
		},
	},

	// Allows directives such as "use cache" etc and caching of components
	cacheComponents: true,
	// This highlights any issues within the application, lifecycles etc
	reactStrictMode: true,
	// https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files
	output: "standalone",
};

export default nextConfig;

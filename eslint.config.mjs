import antfu from "@antfu/eslint-config";

export default antfu(
	{
		gitignore: true,
		stylistic: {
			indent: "tab",
			quotes: "double",
			braceStyle: "1tbs",
			semi: true,
		},

		formatters: {
			// If specifically says "true" it uses Prettier as default, otherwise, uses named formatter
			css: true,
			html: true,
			markdown: "prettier",
		},

		ignores: [
			"build/**",
			"drizzle/**", // Migrations
			".next/**",
			"out/**",
			"next-env.d.ts",
		],

		typescript: true,
		react: true,
		nextjs: true,

		yaml: false,
	},

	{
		ignores: [
			".next/**",
			"build/**",
			"out/**",
			"next-env.d.ts",
		],
	},

	{
		files: ["**/*.{ts,js,tsx,jsx}"],
		rules: {
			"no-unused-vars": "off",
			"unused-imports/no-unused-vars": ["warn", {
				vars: "all",
				args: "all",
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				caughtErrors: "all",
				caughtErrorsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
			}],
			"no-cond-assign": ["error", "except-parens"], // allows while ((x = y))
			"prefer-const": ["error"],

			// React / Frameworks
			"react/jsx-no-children-prop": ["off"],
			"react-refresh/only-export-components": ["off"],

			// Styling - It's preference tbf
			"style/max-statements-per-line": ["error", {
				max: 2,
			}],
			"style/semi": ["error"],
			// "style/nonblock-statement-body-position": ["error", "beside", {
			// 	overrides: { while: "below", do: "below", for: "below" },
			// }],
			"semi-style": ["error", "last"],

			// Sorting
			"perfectionist/sort-imports": ["error", {
				type: "natural",
				order: "asc",
				ignoreCase: true,
				newlinesBetween: 1,

				internalPattern: ["^~/.+"],

				groups: [
					"type",
					"react",
					"external",
					"utils",
					"lib",
					"hooks",
					"context",
					"ui",
					"icons",
					"internal",
					["parent", "sibling", "index"],
					"unknown",
				],

				customGroups: [
					{
						groupName: "react",
						elementNamePattern: ["^react$", "^react-.+"],
					},
					{
						groupName: "utils",
						elementNamePattern: ["^~/utils/math", "^~/utils/helpers", "^~/utils/logger", "^~/utils/date"],
					},
					{
						groupName: "lib",
						elementNamePattern: "^~/lib/.+",
					},
					{
						groupName: "hooks",
						elementNamePattern: "^~/hooks/.+",
					},
					{
						groupName: "context",
						elementNamePattern: "^~/context/.+",
					},
					{
						groupName: "ui",
						elementNamePattern: ["^~/components/ui/.+", "^~/components/fonts"],
					},
					{
						groupName: "icons",
						elementNamePattern: ["^~/icons"],
					},
				],
			}],
		},
	},
);

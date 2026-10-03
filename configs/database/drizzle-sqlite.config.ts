import { defineConfig } from "drizzle-kit";
import process from "node:process";
import "dotenv/config";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/lib/database/sqlite/schema/*.ts",
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.DATABASE_FILENAME!,
	},

	verbose: process.env.NODE_ENV === "development",
	strict: process.env.NODE_ENV === "development",
});

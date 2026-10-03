const path = require("node:path");

const process = require("node:process");
const { AuthTypes, Connector, IpAddressTypes } = require("@google-cloud/cloud-sql-connector");
const { drizzle } = require("drizzle-orm/mysql2");
const { migrate } = require("drizzle-orm/mysql2/migrator");

const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

async function runMigration() {
	const connector = new Connector();

	const clientOpts = await connector.getOptions({
		instanceConnectionName: process.env.DATABASE_INSTANCE_CONNECTION_NAME,
		authType: AuthTypes.PASSWORD,
		ipType: process.env.NODE_ENV === "production"
			? IpAddressTypes.PRIVATE
			: IpAddressTypes.PUBLIC,
	});

	const pool = mysql.createPool({
		...clientOpts,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		database: process.env.DATABASE_NAME,
		connectionLimit: 5,
	});

	const db = drizzle({ client: pool.pool });

	await migrate(db, {
		migrationsFolder: "./drizzle/gcp",
	});

	await pool.end();
	connector.close();
}

runMigration().catch((error) => {
	console.error(error);
	process.exit(1);
});

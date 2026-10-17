import { createClient } from "@libsql/client";
import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "~/utils/environment/env.server";

import * as schema from "./schema";

type Database = ReturnType<typeof drizzle> | null

const relations = defineRelations({ ...schema }, r => ({
	user: {
		sessions: r.many.session(),
		accounts: r.many.account(),
		twoFactors: r.many.twoFactor(),
	},
	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id,
		}),
	},
	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id,
		}),
	},
	twoFactor: {
		user: r.one.user({
			from: r.twoFactor.userId,
			to: r.user.id,
		}),
	},
}));

let dbInstance: Database = null;

function getDb() {
	if (!dbInstance) {
		const client = createClient({ url: env.DATABASE_FILENAME! });
		dbInstance = drizzle({ client, relations });
	}

	return dbInstance;
}

export type { Database };

export default getDb;

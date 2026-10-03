import { createClient } from "@libsql/client";
import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "~/utils/environment/env.server";

import * as schema from "./schema";

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

const client = createClient({ url: env.DATABASE_FILENAME! });
const db = drizzle({ client, relations });

export default db;
export type Database = typeof db;

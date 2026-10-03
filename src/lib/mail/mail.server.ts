/* eslint-disable node/prefer-global/process */
import nodemailer from "nodemailer";

import { logger } from "~/utils/logger";

import { env as clientEnv } from "~/utils/environment/env.client";
import { env } from "~/utils/environment/env.server";

interface EmailProps {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

const transport = nodemailer.createTransport({
	host: env.EMAIL_SMPT_HOST,
	port: parseInt(env.EMAIL_SMPT_PORT),
	auth: {
		user: env.EMAIL_SMPT_USER,
		pass: env.EMAIL_SMPT_PASSWORD,
	},
	secure: false,
});

if (process.env.NODE_ENV !== "test") {
	transport
		.verify()
		.then(() => logger.info("Connected to email server"))
		.catch(err => logger.warn("Unable to connect to email server. Make sure you have configured the SMTP options in .env", err));
}

/**
 * Send an email
 * @param {EmailProps} options - The email options
 * @param {string} options.to - The email address to send the email to
 * @param {string} options.subject - The subject of the email
 * @param {string} [options.text] - The text version of the email
 * @param {string} [options.html] - The HTML version of the email
 *
 * @returns {Promise} Promise
 */
export async function sendEmail(options: EmailProps): Promise<any> {
	try {
		await transport.sendMail({
			from: clientEnv.NEXT_PUBLIC_DEFAULT_EMAIL,
			...options,
		});
		logger.info("MAILER: Mail has been successful -> %s", options.to);
	} catch (error) {
		logger.error("MAILER: Error while sending email -> %s", error);
	}
}

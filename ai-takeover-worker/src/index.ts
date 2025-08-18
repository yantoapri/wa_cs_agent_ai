/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// Add Env type for Worker environment variables
interface Env {
	AI_TAKEOVER_CRON_URL: string;
}

export default {
	async scheduled(event, env: Env, ctx) {
		const url = env.AI_TAKEOVER_CRON_URL;
		if (!url) {
			console.error('AI_TAKEOVER_CRON_URL env variable is not set');
			return;
		}
		try {
			const res = await fetch(url, { method: 'POST' });
			const data = await res.text();
		} catch (err) {
			console.error('Error running AI takeover cron:', err);
		}
	},
	async fetch(request, env: Env, ctx): Promise<Response> {
		return new Response('AI Takeover Worker is running!');
	},
} satisfies ExportedHandler<Env>;
/**
 * Webhook configuration - shared secret for Laravel cache invalidation
 */
export const webhookConfig = {
  secret: process.env.WEBHOOK_SECRET || 'change-me-in-production',
}

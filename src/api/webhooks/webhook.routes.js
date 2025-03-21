import express from 'express';
import { handleSendGridWebhook, getWebhookEventsByGameCode } from './webhook.controller.js';

const webhookRoutes = express.Router();

webhookRoutes.post('/sendgrid-webhook', handleSendGridWebhook);
webhookRoutes.get('/events/:gameCode', getWebhookEventsByGameCode);

export default webhookRoutes;
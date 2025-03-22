import WebhookEvent from "./webhook.model.js";

export const handleSendGridWebhook = async (req, res) => {
  const events = req.body;
  try {
    for (const event of events) {
      const uniqueArgs = event.unique_args || {};
      const webhookEvent = new WebhookEvent({
        event: event.event,
        email: event.email,
        timestamp: new Date(event.timestamp * 1000),
        reason: event.reason,
        gameCode: uniqueArgs.gameCode,
        playerCode: uniqueArgs.playerCode,
      });
      await webhookEvent.save();
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error al procesar el webhook:", error);
    res.status(500).send("Error al procesar el webhook");
  }
};

export const getWebhookEventsByGameCode = async (req, res) => {
  const { gameCode } = req.params;
  try {
    const events = await WebhookEvent.find({ gameCode: gameCode });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error al consultar los eventos:", error);
    res.status(500).send("Error al consultar los eventos");
  }
};

// messaging/azureAdapter.js
const { QueueServiceClient } = require("@azure/storage-queue");
const MessageBus = require("./messageBus");

class AzureAdapter extends MessageBus {
  constructor(connectionString) {
    super();
    this.client = QueueServiceClient.fromConnectionString(connectionString);
  }

  async publish(queueName, message) {
    const queueClient = this.client.getQueueClient(queueName);
    await queueClient.sendMessage(
      Buffer.from(JSON.stringify(message)).toString("base64")
    );
  }

  async consume(queueName, handler) {
    const queueClient = this.client.getQueueClient(queueName);
    setInterval(async () => {
      const resp = await queueClient.receiveMessages({ maxMessages: 10 });
      for (const msg of resp.receivedMessageItems) {
        await handler(
          JSON.parse(Buffer.from(msg.messageText, "base64").toString())
        );
        await queueClient.deleteMessage(msg.messageId, msg.popReceipt);
      }
    }, 1000);
  }
}

module.exports = AzureAdapter;

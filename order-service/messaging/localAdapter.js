// messaging/localAdapter.js
const Queue = require("bull"); // Redis Queue
const MessageBus = require("./messageBus");

class LocalAdapter extends MessageBus {
  constructor() {
    super();
    this.queues = {};
  }

  async publish(queueName, message) {
    if (!this.queues[queueName]) this.queues[queueName] = new Queue(queueName);
    await this.queues[queueName].add(message);
  }

  async consume(queueName, handler) {
    if (!this.queues[queueName]) this.queues[queueName] = new Queue(queueName);
    this.queues[queueName].process(async (job) => handler(job.data));
  }
}

module.exports = new LocalAdapter();

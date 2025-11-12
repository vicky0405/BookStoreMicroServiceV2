class MessageBus {
  async publish(queueName, message) {
    throw new Error("Not implemented");
  }
  async consume(queueName, handler) {
    throw new Error("Not implemented");
  }
}
module.exports = MessageBus;

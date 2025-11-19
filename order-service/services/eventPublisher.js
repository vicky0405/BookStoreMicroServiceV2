// order-service/eventPublisher.js

const { ServiceBusClient } = require("@azure/service-bus");

// Biến môi trường này cần được thiết lập trong Azure App Service Configuration
const CONNECTION_STRING = process.env.SERVICEBUS_CONNECTION_STRING;
const TOPIC_NAME = "order-created-topic";

const sbClient = new ServiceBusClient(CONNECTION_STRING);
const sender = sbClient.createSender(TOPIC_NAME);

/**
 * Gửi sự kiện đơn hàng mới lên Service Bus Topic
 * @param {object} orderDetails - Chi tiết đơn hàng
 */
async function publishOrderCreatedEvent(orderDetails) {
  try {
    const message = {
      body: orderDetails,
      contentType: "application/json",
      // Thêm các thuộc tính khác như correlationId nếu cần
    };

    // Gửi sự kiện đến Topic
    await sender.sendMessages(message);
    console.log(
      `[ServiceBus] Event published for Order ID: ${orderDetails.orderId}`
    );
  } catch (error) {
    console.error("Error publishing order created event:", error);
    // Xử lý lỗi (ví dụ: ghi vào log hoặc thử lại)
  }
}

// Hàm này sẽ được gọi sau khi database tạo đơn hàng thành công
module.exports = { publishOrderCreatedEvent };

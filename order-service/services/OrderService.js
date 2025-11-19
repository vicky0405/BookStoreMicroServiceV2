const {
  sequelize,
  Order,
  OrderDetail,
  OrderAssignment,
  ShippingMethod,
} = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
require("dotenv").config();
const { publishOrderCreatedEvent } = require("./eventPublisher");

const MONOLITH_URL = process.env.MONOLITH_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const getOrdersByUserID = async (userID, page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;

  const { count, rows: orders } = await Order.findAndCountAll({
    where: { user_id: userID },
    include: [
      { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
      { model: OrderDetail, as: "details" },
    ],
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  // 👉 gom tất cả book_id từ OrderDetails
  const bookIds = [
    ...new Set(orders.flatMap((order) => order.details.map((d) => d.book_id))),
  ];

  // 👉 gọi Book Service
  let bookMap = {};
  if (bookIds.length > 0) {
    const { data: books } = await axios.post(
      MONOLITH_URL + "/api/books/batch",
      {
        ids: bookIds,
      }
    );
    bookMap = books.reduce((map, book) => {
      map[book.id] = book;
      return map;
    }, {});
  }

  // 👉 merge thông tin book vào từng detail
  const ordersWithBook = orders.map((order) => ({
    ...order.toJSON(),
    details: order.details.map((d) => ({
      ...d.toJSON(),
      book: bookMap[d.book_id] || null,
    })),
  }));
  return { orders: ordersWithBook, total: count };
};

const getAllOrdersByStatus = async (status, page = 1, pageSize = 10) => {
  const dbStatus = status === "processing" ? "pending" : status;
  const offset = (page - 1) * pageSize;

  // 1️⃣ Lấy order + details + shippingMethod + assignment
  const include = [
    { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
    { model: OrderDetail, as: "details" },
  ];

  if (dbStatus === "delivering") {
    include.push({ model: OrderAssignment, as: "assignment" });
  }

  const { count, rows } = await Order.findAndCountAll({
    where: { status: dbStatus },
    include,
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  const orders = rows.map((r) => r.toJSON());

  // 2️⃣ Gọi User Service batch để lấy thông tin user + shipper
  const userIds = orders.map((o) => o.user_id);
  const shipperIds = orders
    .filter((o) => o.assignment)
    .map((o) => o.assignment.shipper_id)
    .filter(Boolean);

  const uniqueUserIds = [...new Set([...userIds, ...shipperIds])];
  let userMap = {};

  if (uniqueUserIds.length > 0) {
    try {
      const { data: users } = await axios.post(
        `${USER_SERVICE_URL}/api/users/batch`,
        { ids: uniqueUserIds }
      );
      userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    } catch (err) {
      console.error("⚠️ Không thể lấy thông tin user/shipper:", err.message);
    }
  }

  // 3️⃣ Gọi Book Service để lấy thông tin sách
  const bookIds = orders
    .flatMap((o) => o.details.map((d) => d.book_id))
    .filter(Boolean);

  const uniqueBookIds = [...new Set(bookIds)];
  let bookMap = {};

  if (uniqueBookIds.length > 0) {
    try {
      const { data: books } = await axios.post(
        `${MONOLITH_URL}/api/books/batch`,
        { ids: uniqueBookIds }
      );
      bookMap = Object.fromEntries(books.map((b) => [b.id, b]));
    } catch (err) {
      console.error("⚠️ Không thể lấy thông tin sách:", err.message);
    }
  }

  // 4️⃣ Gắn thông tin user, shipper, book vào orders
  orders.forEach((o) => {
    o.user = userMap[o.user_id] || null;

    if (o.assignment && o.assignment.shipper_id) {
      o.assignment.shipper = userMap[o.assignment.shipper_id] || null;
    }

    if (o.details?.length) {
      o.details = o.details.map((d) => ({
        ...d,
        book: bookMap[d.book_id] || null,
      }));
    }
  });

  return { orders, total: count };
};

const getOrdersByStatusAndUser = async (
  status,
  userID,
  page = 1,
  pageSize = 10
) => {
  const offset = (page - 1) * pageSize;

  // 1️⃣ Lấy danh sách orders + order details
  const { count, rows: orders } = await Order.findAndCountAll({
    where: { status, user_id: userID },
    include: [
      { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
      { model: OrderDetail, as: "details" },
    ],
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  // 2️⃣ Gom toàn bộ book_id để gọi Book Service 1 lần
  const bookIds = [
    ...new Set(orders.flatMap((order) => order.details.map((d) => d.book_id))),
  ];

  let bookMap = {};
  if (bookIds.length > 0) {
    try {
      const { data: books } = await axios.post(
        MONOLITH_URL + "/api/books/batch",
        {
          ids: bookIds,
        }
      );
      bookMap = books.reduce((map, book) => {
        map[book.id] = book;
        return map;
      }, {});
    } catch (err) {
      console.error("❌ Lỗi gọi Book Service:", err.message);
    }
  }

  // 3️⃣ Merge dữ liệu book vào từng order detail
  const ordersWithBooks = orders.map((order) => ({
    ...order.toJSON(),
    details: order.details.map((d) => ({
      ...d.toJSON(),
      book: bookMap[d.book_id] || null,
    })),
  }));

  return { orders: ordersWithBooks, total: count };
};

const getOrdersByShipperID = async (
  shipperID,
  status,
  page = 1,
  pageSize = 10
) => {
  const offset = (page - 1) * pageSize;

  // 1️⃣ Lấy danh sách đơn hàng + chi tiết đơn + assignment
  const { count, rows } = await Order.findAndCountAll({
    where: { status },
    include: [
      { model: ShippingMethod, as: "shippingMethod", attributes: ["name"] },
      { model: OrderDetail, as: "details" },
      {
        model: OrderAssignment,
        as: "assignment",
        where: { shipper_id: shipperID },
        attributes: ["completion_date"],
      },
    ],
    order: [["order_date", "DESC"]],
    limit: pageSize,
    offset,
  });

  const orders = rows.map((o) => o.toJSON());

  // 2️⃣ Thu thập danh sách user_id và book_id để gọi batch API
  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const bookIds = [
    ...new Set(orders.flatMap((o) => o.details.map((d) => d.book_id))),
  ];

  let userMap = {};
  let bookMap = {};

  // 3️⃣ Gọi User Service để lấy thông tin người dùng
  if (userIds.length > 0) {
    try {
      const { data: users } = await axios.post(USER_SERVICE_URL, {
        ids: userIds,
      });
      userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    } catch (err) {
      console.error("⚠️ Lỗi gọi User Service:", err.message);
    }
  }

  // 4️⃣ Gọi Book Service để lấy thông tin sách
  if (bookIds.length > 0) {
    try {
      const { data: books } = await axios.post(MONOLITH_URL, {
        ids: bookIds,
      });
      bookMap = Object.fromEntries(books.map((b) => [b.id, b]));
    } catch (err) {
      console.error("⚠️ Lỗi gọi Book Service:", err.message);
    }
  }

  // 5️⃣ Gắn dữ liệu user và book vào orders
  const ordersWithDetails = orders.map((order) => ({
    ...order,
    user: userMap[order.user_id] || null,
    details: order.details.map((d) => ({
      ...d,
      book: bookMap[d.book_id] || null,
    })),
  }));

  return { orders: ordersWithDetails, total: count };
};

const createOrder = async (orderData) => {
  const {
    userID,
    shipping_method_id,
    shipping_address,
    promotion_code,
    total_amount,
    shipping_fee,
    discount_amount,
    final_amount,
    payment_method,
    orderDetails,
  } = orderData;

  let orderResult;
  let eventMessage;

  try {
    // 1. Chạy Giao dịch Database: đảm bảo toàn vẹn dữ liệu
    orderResult = await sequelize.transaction(async (t) => {
      // Tạo đơn hàng
      const order = await Order.create(
        {
          user_id: userID,
          order_date: new Date(),
          shipping_method_id,
          shipping_address,
          promotion_code: promotion_code || null,
          total_amount,
          shipping_fee,
          discount_amount,
          final_amount,
          payment_method,
          status: "pending",
        },
        { transaction: t }
      );

      // Lưu chi tiết đơn
      for (const detail of orderDetails) {
        await OrderDetail.create(
          {
            order_id: order.id,
            book_id: detail.book_id,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
          },
          { transaction: t }
        );
      }

      // 2. Chuẩn bị sự kiện sau khi DB thành công
      eventMessage = {
        orderId: order.id,
        orderDetails: orderDetails.map((d) => ({
          book_id: d.book_id,
          quantity: d.quantity,
        })),
        // Thêm các dữ liệu cần thiết cho Order Processing/Inventory Update
      };

      // Trả về đối tượng order sau khi giao dịch thành công
      return order;
    });

    // 3. Phát Sự kiện (Chỉ chạy khi Giao dịch đã COMMIT)
    if (orderResult && eventMessage) {
      // Sử dụng hàm Service Bus Publisher đã tích hợp
      // Đây là nơi gửi sự kiện lên Azure Service Bus Topic
      await publishOrderCreatedEvent(eventMessage);
    }

    return orderResult;
  } catch (error) {
    console.error("Lỗi trong quá trình tạo đơn hàng:", error);
    // Nếu có lỗi, giao dịch sẽ tự động rollback.
    throw error;
  }
};

const confirmOrder = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");
  order.status = "confirmed";
  await order.save();
  return order;
};

const completeOrder = async (orderId) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");
  order.status = "delivered";
  await order.save();

  const assignment = await OrderAssignment.findOne({
    where: { order_id: orderId },
  });
  if (assignment) {
    assignment.completion_date = new Date();
    await assignment.save();
  }

  return { order, assignment };
};

const cancelOrder = async (orderId) => {
  return await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) throw new Error("Order not found");

    // Nếu đã hủy rồi thì không cộng tồn kho lần nữa (idempotent)
    if (order.status === "cancelled") {
      return { success: true, message: "Đơn hàng đã ở trạng thái hủy" };
    }

    // Chỉ khôi phục tồn kho nếu đơn chưa giao/hoàn tất
    if (["delivered", "completed"].includes(order.status)) {
      order.status = "cancelled";
      await order.save({ transaction: t });
      return {
        success: true,
        message: "Đơn đã hoàn tất, chuyển trạng thái hủy (không hoàn kho)",
      };
    }

    // Lấy chi tiết đơn để hoàn kho
    const details = await OrderDetail.findAll({
      where: { order_id: orderId },
      transaction: t,
    });
    for (const d of details) {
      const book = await Book.findByPk(d.book_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (book) {
        const currentStock = Number(book.quantity_in_stock) || 0;
        const qty = Number(d.quantity) || 0;
        book.quantity_in_stock = currentStock + qty;
        await book.save({ transaction: t });
      }
    }

    order.status = "cancelled";
    await order.save({ transaction: t });
    return {
      success: true,
      message: "Đơn hàng đã được hủy và tồn kho đã được khôi phục",
    };
  });
};

const assignOrderToShipper = async (orderId, shipperId, assignedBy) => {
  if (!orderId || !shipperId || !assignedBy) {
    throw new Error("Thiếu thông tin orderId, shipperId hoặc assignedBy");
  }

  const order = await Order.findByPk(orderId);
  if (!order) throw new Error("Order not found");

  order.status = "delivering";
  await order.save();

  await OrderAssignment.create({
    order_id: orderId,
    assigned_by: assignedBy,
    shipper_id: shipperId,
    assigned_at: new Date(),
    completion_date: null,
  });

  return order;
};

module.exports = {
  getOrdersByUserID,
  getAllOrdersByStatus,
  getOrdersByStatusAndUser,
  getOrdersByShipperID,
  createOrder,
  confirmOrder,
  completeOrder,
  cancelOrder,
  assignOrderToShipper,
};

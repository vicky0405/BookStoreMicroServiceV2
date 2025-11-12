const { BookImport, ImportDetail, Supplier, sequelize } = require("../models");
const { Op } = require("sequelize");
const cacheHelper = require("../utils/cacheHelper");
const axios = require("axios");

const CACHE_KEYS = {
  ALL_IMPORTS: "imports:all",
};

const CACHE_TTL = {
  IMPORTS_LIST: 900, // 15 minutes
};

require("dotenv").config();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

const getAllImports = async () => {
  // console.log("BookImport:", BookImport);
  // console.log("ImportDetail:", ImportDetail);
  // console.log("sequelize:", sequelize);
  try {
    const imports = await cacheHelper.getOrSet(
      CACHE_KEYS.ALL_IMPORTS,
      async () => {
        const results = await BookImport.findAll({
          include: ["supplier", { association: "details", include: ["book"] }],
          order: [["import_date", "DESC"]],
        });
        return results.map((r) => r.toJSON());
      },
      CACHE_TTL.IMPORTS_LIST
    );

    const userIds = imports.map((i) => i.imported_by).filter(Boolean);
    const { data: users } = await axios.post(
      USER_SERVICE_URL + "/api/users/batch",
      { ids: userIds }
    );

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    imports.forEach((imp) => {
      imp.employee = userMap[imp.imported_by] || null;
    });

    return imports;
  } catch (e) {
    console.error("❌ Lỗi trong getAllImports:", e);
    throw new Error("Không thể lấy danh sách nhập sách");
  }
};

const createImport = async (importData) => {
  const { supplierId, bookDetails, importedBy, total } = importData;
  // Dùng transaction để rollback nếu có lỗi
  const t = await sequelize.transaction();

  try {
    // 1️⃣ Tạo BookImport
    const bookImport = await BookImport.create(
      {
        supplier_id: supplierId,
        imported_by: importedBy,
        total_price: total,
      },
      { transaction: t }
    );
    // 2️⃣ Tạo ImportDetail nếu có
    if (Array.isArray(bookDetails) && bookDetails.length > 0) {
      for (const item of bookDetails) {
        await ImportDetail.create(
          {
            import_id: bookImport.id,
            book_id: item.bookId,
            quantity: item.quantity,
            unit_price: item.price,
          },
          { transaction: t }
        );
      }
    }

    // 3️⃣ Commit transaction
    await t.commit();

    // 4️⃣ Lấy lại import vừa tạo (plain object)
    let result = await BookImport.findByPk(bookImport.id, {
      include: ["supplier", { association: "details", include: ["book"] }],
    });

    result = result.toJSON(); // convert instance → plain object

    // 5️⃣ Gọi User Service để gắn employee
    if (importedBy) {
      try {
        const { data: users } = await axios.post(
          USER_SERVICE_URL + "/api/users/batch",
          { ids: [importedBy] },
          { timeout: 5000 }
        );
        result.employee = users[0] || null;
      } catch (err) {
        console.error(
          "⚠️ Không thể lấy thông tin employee từ User Service:",
          err.message
        );
        result.employee = null;
      }
    }

    // 6️⃣ Xoá cache
    await cacheHelper.del(CACHE_KEYS.ALL_IMPORTS);

    return result;
  } catch (error) {
    // Rollback nếu có lỗi
    await t.rollback();
    console.error("❌ Lỗi khi tạo import:", error);
    throw new Error("Không thể tạo nhập sách");
  }
};

const deleteImport = async (id) => {
  const bookImport = await BookImport.findByPk(id);
  if (!bookImport) throw new Error("Import not found");
  await ImportDetail.destroy({ where: { import_id: id } });
  await bookImport.destroy();
  await cacheHelper.del(CACHE_KEYS.ALL_IMPORTS);
  return { success: true };
};

const getImportsByYear = async (year) => {
  if (!year) throw new Error("Year parameter is required");
  return await BookImport.findAll({
    where: {
      import_date: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lte]: new Date(`${year}-12-31`),
      },
    },
    include: [
      "supplier",
      "employee",
      {
        association: "details",
        include: ["book"],
      },
    ],
    order: [["import_date", "DESC"]],
  });
};

const getImportDataByMonth = async (year, month) => {
  const start = new Date(`${year}-${month}-01`);
  const end = new Date(`${year}-${month}-31`);
  return await BookImport.findAll({
    where: {
      import_date: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    },
    include: ["details"],
    order: [["import_date", "ASC"]],
  });
};

const getImportDataByYear = async (year) => {
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);
  return await BookImport.findAll({
    where: {
      import_date: {
        [Op.gte]: start,
        [Op.lte]: end,
      },
    },
    include: ["details"],
    order: [["import_date", "ASC"]],
  });
};

// Thêm hàm để lấy dữ liệu biểu đồ nhập kho theo tháng
const getImportChartDataByYear = async (year) => {
  const { sequelize } = require("../models");
  const { QueryTypes } = require("sequelize");

  const results = await sequelize.query(
    `SELECT MONTH(bi.import_date) AS month,
      SUM(id.quantity) AS totalBooks,
      SUM(id.quantity * id.unit_price) AS totalCost
   FROM book_imports bi
   JOIN book_import_details id ON bi.id = id.import_id
   WHERE YEAR(bi.import_date) = ?
   GROUP BY MONTH(bi.import_date)
   ORDER BY MONTH(bi.import_date)`,
    {
      replacements: [year],
      type: QueryTypes.SELECT,
    }
  );
  return results;
};

// Thêm hàm để lấy dữ liệu biểu đồ nhập kho theo ngày trong tháng
const getImportChartDataByMonth = async (year, month) => {
  const { sequelize } = require("../models");
  const { QueryTypes } = require("sequelize");

  const results = await sequelize.query(
    `SELECT DAY(bi.import_date) AS day,
      SUM(id.quantity) AS totalBooks,
      SUM(id.quantity * id.unit_price) AS totalCost
   FROM book_imports bi
   JOIN book_import_details id ON bi.id = id.import_id
   WHERE YEAR(bi.import_date) = ? AND MONTH(bi.import_date) = ?
   GROUP BY DAY(bi.import_date)
   ORDER BY DAY(bi.import_date)`,
    {
      replacements: [year, month],
      type: QueryTypes.SELECT,
    }
  );
  return results;
};

// Thêm hàm để lấy dữ liệu biểu đồ tồn kho
const getStockChartData = async () => {
  const { Book, Category } = require("../models");

  const books = await Book.findAll({
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name"],
      },
    ],
    attributes: ["id", "title", "price", "quantity_in_stock"],
    order: [["quantity_in_stock", "DESC"]],
    raw: false,
  });

  // Map dữ liệu: đổi quantity_in_stock thành stock
  return books.map((book) => ({
    ...book.dataValues,
    stock: book.quantity_in_stock,
    category: book.category,
  }));
};

module.exports = {
  getAllImports,
  createImport,
  deleteImport,
  getImportsByYear,
  getImportDataByMonth,
  getImportDataByYear,
  getImportChartDataByYear,
  getImportChartDataByMonth,
  getStockChartData,
};

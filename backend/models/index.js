// Import tất cả models
const sequelize = require("../db");

// Basic models
const Category = require("./CategoryModel");
const Publisher = require("./PublisherModel");
const Book = require("./BookModel");
const BookImages = require("./BookImagesModel");
const Address = require("./AddressModel");
const Supplier = require("./SupplierModel");
const Promotion = require("./PromotionModel");
const { PromotionDetail } = require("./PromotionDetailModel");
const Rule = require("./RuleModel");

// Import models
const { BookImport } = require("./ImportModel");
const { ImportDetail } = require("./ImportDetailModel");

// Rating model
const { Rating } = require("./RatingModel");

// Damage Report models
const { DamageReport } = require("./DamageReportModel");
const { DamageReportItem } = require("./DamageReportItemsModel");
// Cart models
const { Cart } = require("./CartModel");
const { CartDetail } = require("./CartDetailModel");

// =================
// DEFINE ASSOCIATIONS
// =================

// Book associations
Book.belongsTo(Category, { foreignKey: "category_id", as: "category" });
Book.belongsTo(Publisher, { foreignKey: "publisher_id", as: "publisher" });
Book.hasMany(BookImages, { foreignKey: "book_id", as: "images" });
Category.hasMany(Book, { foreignKey: "category_id", as: "books" });
Publisher.hasMany(Book, { foreignKey: "publisher_id", as: "books" });
BookImages.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// Import associations
BookImport.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
BookImport.hasMany(ImportDetail, {
  foreignKey: "import_id",
  as: "details",
  onDelete: "CASCADE",
});
ImportDetail.belongsTo(Book, { foreignKey: "book_id", as: "book" });

// Note: Previous association via promotion_code removed due to schema change

// Rating associations
Rating.belongsTo(Book, { foreignKey: "book_id", onDelete: "CASCADE" });

Book.hasMany(Rating, { foreignKey: "book_id", onDelete: "CASCADE" });

// Damage Report associations
DamageReport.hasMany(DamageReportItem, {
  foreignKey: "report_id",
  as: "items",
  onDelete: "CASCADE",
});

// Damage Report Item associations
DamageReportItem.belongsTo(DamageReport, {
  foreignKey: "report_id",
  onDelete: "CASCADE",
});
DamageReportItem.belongsTo(Book, { foreignKey: "book_id", as: "book" });
Book.hasMany(DamageReportItem, {
  foreignKey: "book_id",
  as: "damageReportItems",
});

// Cart associations

Cart.hasMany(CartDetail, {
  foreignKey: "cart_id",
  as: "items",
  onDelete: "CASCADE",
});
CartDetail.belongsTo(Cart, {
  foreignKey: "cart_id",
  as: "cart",
  onDelete: "CASCADE",
});

CartDetail.belongsTo(Book, {
  foreignKey: "book_id",
  as: "Book",
  onDelete: "CASCADE",
});
Book.hasMany(CartDetail, { foreignKey: "book_id", as: "cartItems" });

// Promotion associations (many-to-many with Book via promotion_details)
Promotion.belongsToMany(Book, {
  through: PromotionDetail,
  foreignKey: "promotion_id",
  otherKey: "book_id",
  as: "books",
});
Book.belongsToMany(Promotion, {
  through: PromotionDetail,
  foreignKey: "book_id",
  otherKey: "promotion_id",
  as: "promotions",
});

// =================
// EXPORT ALL MODELS
// =================
module.exports = {
  sequelize,
  Category,
  Publisher,
  Book,
  BookImages,
  Address,
  Supplier,
  Promotion,
  Rule,
  PromotionDetail,
  BookImport,
  Rating,
  DamageReport,
  DamageReportItem,
  Cart,
  CartDetail,
  ImportDetail,
};

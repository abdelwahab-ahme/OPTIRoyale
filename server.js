// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;

// إعداد السيرفر
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// 🧠 إعداد بيانات البريد الإلكتروني
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "abdelwahabhagag3@gmail.com", // ← ضع إيميلك هنا
    pass: "inng ycko dlhi ivtg",    // ← ضع كلمة مرور التطبيق هنا
  },
});


// 🏠 الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 📩 استقبال نموذج التواصل
app.post("/api/contact", async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: "جميع الحقول مطلوبة" });
  }

  const contactData = { firstName, lastName, email, message, date: new Date() };
  fs.appendFileSync("contacts.json", JSON.stringify(contactData) + "\n");

  // ✉️ إرسال بريد إلكتروني لصاحب الموقع
  try {
    await transporter.sendMail({
      from: `"OptiRoyaleBackend" <${email}>`,
      to: "abdelwahabhagag3@gmail.com", // ← نفس الإيميل أو أي بريد تستقبل عليه التنبيهات
      subject: `رسالة جديدة من ${firstName} ${lastName}`,
      text: `المرسل: ${firstName} ${lastName}\nالبريد: ${email}\n\n${message}`,
    });
  } catch (err) {
    console.error("Email error:", err);
  }

  res.json({ success: true, message: "تم إرسال الرسالة بنجاح ✅" });
});

// 🧭 لوحة التحكم لعرض جميع الرسائل
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.get("/api/messages", (req, res) => {
  if (!fs.existsSync("contacts.json")) return res.json([]);
  const lines = fs.readFileSync("contacts.json", "utf8").trim().split("\n");
  const messages = lines.map(line => JSON.parse(line));
  res.json(messages);
});

// 📦 إضافة endpoint لمعالجة الطلبات
app.post("/api/order", (req, res) => {
    const { cart } = req.body; // يجب أن يرسل الكلاينت السلة باسم cart
    if (!cart || !cart.length) {
      return res.status(400).json({ success: false, message: "السلة فارغة!" });
    }
  
    // قراءة الطلبات القديمة
    let orders = [];
    try {
      orders = JSON.parse(fs.readFileSync("orders.json", "utf8"));
    } catch (err) {
      console.log("ملف orders.json غير موجود، سيتم إنشاؤه تلقائياً");
    }
  
    // إضافة الطلب الجديد
    const newOrder = { items: cart, date: new Date() };
    orders.push(newOrder);
  
    // حفظ الطلبات في الملف
    fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
  
    res.json({ success: true, message: "تم تأكيد الطلب ✅" });
  });
  

// 🚀 تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ السيرفر يعمل على: http://localhost:${PORT}`);
});

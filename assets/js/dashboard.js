const productForm = document.getElementById("productForm");
const productsList = document.getElementById("productsList");

let editingId = null; // لتخزين ID المنتج الجاري تعديله

// ✅ Toast إشعارات عصرية
function showToast(message, type="success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.background = type === "success"
    ? "linear-gradient(90deg, #4caf50, #2e7d32)"   // أخضر للنجاح
    : "linear-gradient(90deg, #f44336, #b71c1c)"; // أحمر للفشل
  toast.className = "toast show";
  setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// ✅ Modal تأكيد أنيق
function showConfirm(message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const msg = document.getElementById("confirmMessage");
  msg.textContent = message;
  modal.style.display = "flex";

  document.getElementById("confirmYes").onclick = () => {
    modal.style.display = "none";
    onConfirm();
  };
  document.getElementById("confirmNo").onclick = () => {
    modal.style.display = "none";
  };
}

// دالة الإضافة الأصلية
async function addProductHandler(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim();
  const price = document.getElementById("price").value.trim();
  const imageFileName = document.getElementById("imageFileName").value.trim();

  if (!name || !description || !price || !imageFileName) {
    showToast("⚠️ يرجى ملء جميع الحقول", "error");
    return;
  }

  try {
    const imageUrl = "assets/products-img/" + imageFileName;

    await db.collection("products").add({
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast("✅ تمت إضافة المنتج بنجاح!", "success");
    productForm.reset();
    loadProducts();
  } catch (error) {
    console.error("❌ خطأ:", error);
    showToast("حدث خطأ: " + error.message, "error");
  }
}

// ربط النموذج بدالة الإضافة عند البداية
productForm.addEventListener("submit", addProductHandler);

// تحميل المنتجات
async function loadProducts() {
  productsList.innerHTML = "";
  try {
    const snapshot = await db.collection("products").orderBy("createdAt", "desc").get();
    snapshot.forEach(doc => {
      const product = doc.data();
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" width="150">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <strong>dh${product.price}</strong>
        <button onclick="editProduct('${doc.id}', '${product.name}', '${product.description}', '${product.price}', '${product.imageUrl}')">✏️ تعديل</button>
        <button onclick="deleteProduct('${doc.id}')">🗑️ حذف</button>
      `;
      productsList.appendChild(div);
    });
  } catch (error) {
    console.error("❌ خطأ في تحميل المنتجات:", error);
    showToast("خطأ في تحميل المنتجات", "error");
  }
}

// حذف منتج
async function deleteProduct(id) {
  showConfirm("هل تريد حذف هذا المنتج؟", async () => {
    try {
      await db.collection("products").doc(id).delete();
      showToast("✅ تم حذف المنتج", "success");
      loadProducts();
    } catch (error) {
      console.error("❌ خطأ في حذف المنتج:", error);
      showToast("خطأ في حذف المنتج", "error");
    }
  });
}

// تعديل منتج
function editProduct(id, name, description, price, imageUrl) {
  document.getElementById("name").value = name;
  document.getElementById("description").value = description;
  document.getElementById("price").value = price;
  document.getElementById("imageFileName").value = imageUrl.replace("assets/products-img/", "");

  const submitBtn = productForm.querySelector("button[type='submit']");
  submitBtn.textContent = "تحديث المنتج";

  editingId = id;

  productForm.removeEventListener("submit", addProductHandler);
  productForm.addEventListener("submit", updateHandler);
}

// دالة التحديث
async function updateHandler(e) {
  e.preventDefault();

  const newName = document.getElementById("name").value.trim();
  const newDescription = document.getElementById("description").value.trim();
  const newPrice = document.getElementById("price").value.trim();
  const newImageFileName = document.getElementById("imageFileName").value.trim();
  const newImageUrl = "assets/products-img/" + newImageFileName;

  try {
    await db.collection("products").doc(editingId).update({
      name: newName,
      description: newDescription,
      price: parseFloat(newPrice),
      imageUrl: newImageUrl
    });

    showToast("✅ تم تحديث المنتج بنجاح!", "success");
    productForm.reset();

    const submitBtn = productForm.querySelector("button[type='submit']");
    submitBtn.textContent = "إضافة المنتج";

    productForm.removeEventListener("submit", updateHandler);
    productForm.addEventListener("submit", addProductHandler);

    loadProducts();
  } catch (error) {
    console.error("❌ خطأ في تحديث المنتج:", error);
    showToast("حدث خطأ: " + error.message, "error");
  }
}

// تحميل المنتجات عند فتح الصفحة
loadProducts();
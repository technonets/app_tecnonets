/**
 * 🚀 TECNONETS API BACKEND (Google Sheets + Drive)
 * Versión: PROFESIONAL (Soporte SaaS Pricing + Carpetas por Producto + Fecha de Creación + Tutorial)
 */

// --- CONFIGURACIÓN ---
const API_KEY = "tnk_9F3aQxP7mL2R8DkWcH5ZJYV4BNe6U0sE";
const DRIVE_FOLDER_ID = "1fec39C6cxp_ooNuv3xCV74mPBtRNkmMb";
const SHEET_ID = "1dftbP8Uk9MjDpqbrNceVjovMBlgfz1Mxc8OOTwLGi1o";

// Nombres de las pestañas
const TAB_PRODUCTS = "Productos";
const TAB_USERS = "Usuarios";
const TAB_BLOG = "Blog";

// ----------------------------------------------------

function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    let params = e.parameter;

    if (e.postData && e.postData.contents) {
      const body = JSON.parse(e.postData.contents);
      params = { ...params, ...body };
    }

    const action = params.action;
    const key = params.key;

    if (key !== API_KEY) {
      return responseJSON({ error: "API Key inválida." }, 401);
    }

    // --- PRODUCTOS ---
    if (action === "getProducts") {
      return getProducts();
    }
    if (action === "createProduct") {
      return createProduct(params);
    }

    // --- BLOG ---
    if (action === "getPosts") {
      return getPosts();
    }
    if (action === "createPost") {
      return createPost(params);
    }

    // --- USUARIOS ---
    if (action === "login") {
      return loginUser(params.usuario, params.password);
    }

    return responseJSON({ error: "Acción no reconocida" }, 400);
  } catch (error) {
    return responseJSON({ error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

// --- FUNCIONES CORE ---

function getProducts() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TAB_PRODUCTS);
  const data = sheet.getDataRange().getValues();
  data.shift();

  const products = data
    .map((row) => {
      // Columnas: A:Title, B:Price(Setup), C:Category, D:Tags, E:Images, F:Description, G:CheckoutUrl, H:DemoUrl, I:VariantId, J:MonthlyPrice, K:CreatedDate, L:Tutorial
      return {
        title: row[0],
        price: row[1],
        category: row[2],
        tags: row[3]
          ? String(row[3])
              .split(",")
              .map((t) => t.trim())
          : [],
        images: row[4]
          ? String(row[4])
              .split(",")
              .map((img) => img.trim())
          : [],
        description: row[5],
        checkoutUrl: row[6],
        demoUrl: row[7] || "",
        variantId: row[8] || "",
        monthlyPrice: row[9] || 0,
        createdDate: row[10] || "", // COLUMNA K
        tutorialUrl: row[11] || "", // COLUMNA L: Tutorial
      };
    })
    .filter((p) => p.title !== "");

  return responseJSON(products);
}

function loginUser(username, password) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TAB_USERS);
  const data = sheet.getDataRange().getValues();
  data.shift();

  const user = data.find((row) => {
    const sheetUser = String(row[1]).trim().toLowerCase();
    const inputUser = String(username).trim().toLowerCase();
    const sheetPass = String(row[2]).trim();
    const inputPass = String(password).trim();

    return sheetUser === inputUser && sheetPass === inputPass;
  });

  if (!user) {
    return responseJSON(
      { success: false, message: "Credenciales incorrectas" },
      401
    );
  }

  if (user[4] !== "Activo") {
    return responseJSON({ success: false, message: "Usuario inactivo" }, 403);
  }

  return responseJSON({
    success: true,
    user: { nombre: user[0], usuario: user[1], rol: user[3] },
  });
}

function createProduct(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TAB_PRODUCTS);
  const mainFolder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  let imageUrls = [];

  // Crear carpeta específica para este producto
  const productFolderName = data.title || "Sin Nombre";
  let productFolder;

  const existingFolders = mainFolder.getFoldersByName(productFolderName);
  if (existingFolders.hasNext()) {
    productFolder = existingFolders.next();
  } else {
    productFolder = mainFolder.createFolder(productFolderName);
  }

  if (data.images && Array.isArray(data.images)) {
    data.images.forEach((img, index) => {
      try {
        if (img.base64) {
          const blob = Utilities.newBlob(
            Utilities.base64Decode(img.base64),
            img.type || "image/jpeg",
            img.name || "foto_" + index + ".jpg"
          );
          const file = productFolder.createFile(blob);
          file.setSharing(
            DriveApp.Access.ANYONE_WITH_LINK,
            DriveApp.Permission.VIEW
          );
          imageUrls.push("https://lh3.googleusercontent.com/d/" + file.getId());
        }
      } catch (err) {}
    });
  }

  if (imageUrls.length === 0)
    imageUrls.push("/images/products/placeholder.svg");

  // Generar fecha actual en formato M/D/YYYY
  const now = new Date();
  const createdDate =
    now.getMonth() + 1 + "/" + now.getDate() + "/" + now.getFullYear();

  sheet.appendRow([
    data.title,
    data.price,
    data.category,
    data.tags.join(", "),
    imageUrls.join(", "),
    data.description,
    data.checkoutUrl,
    data.demoUrl || "",
    data.variantId || "",
    data.monthlyPrice || 0,
    createdDate, // COLUMNA K: Fecha de Creación
    data.tutorialUrl || "", // COLUMNA L: Tutorial
  ]);

  return responseJSON({
    success: true,
    message: "Producto guardado con carpeta dedicada: " + productFolderName,
    imageUrls: imageUrls,
    folderName: productFolderName,
    createdDate: createdDate,
  });
}

// --- FUNCIONES BLOG ---

function getPosts() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TAB_BLOG);
  if (!sheet) return responseJSON([]);

  const data = sheet.getDataRange().getValues();
  data.shift();

  const posts = data
    .map((row) => {
      return {
        slug: row[0],
        title: row[1],
        excerpt: row[2],
        content: row[3],
        date: row[4],
        author: row[5],
        category: row[6],
        image: row[7] || "",
      };
    })
    .filter((p) => p.slug && p.slug !== "");

  return responseJSON(posts);
}

function createPost(data) {
  let sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TAB_BLOG);

  if (!sheet) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    sheet = ss.insertSheet(TAB_BLOG);
    sheet.appendRow([
      "Slug",
      "Title",
      "Excerpt",
      "Content",
      "Date",
      "Author",
      "Category",
      "Image",
    ]);
  }

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  let imageUrl = "";

  if (data.image && data.image.base64) {
    try {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(data.image.base64),
        data.image.type || "image/jpeg",
        data.image.name || `blog_${data.slug}.jpg`
      );
      const file = folder.createFile(blob);
      file.setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW
      );
      imageUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
    } catch (err) {}
  } else if (data.image && typeof data.image === "string") {
    imageUrl = data.image;
  }

  sheet.appendRow([
    data.slug,
    data.title,
    data.excerpt,
    data.content,
    data.date,
    data.author,
    data.category,
    imageUrl,
  ]);

  return responseJSON({
    success: true,
    message: "Artículo publicado correctamente",
    slug: data.slug,
  });
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}

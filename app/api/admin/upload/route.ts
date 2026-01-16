import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// ⚠️ THIS ONLY WORKS IN LOCAL NODE.JS ENVIRONMENTS OR VPS
// IT WILL NOT PERSIST IN SERVERLESS (VERCEL) PRODUCTION AFTER REDEPLOY
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const productStr = formData.get("product") as string;
    const imageFile = formData.get("image") as File;
    
    if (!productStr || !imageFile) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const newProduct = JSON.parse(productStr);

    // 1. Save Image
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const imageName = `${newProduct.id}-${Date.now()}.jpg`; // Unique name
    const imagePath = path.join(process.cwd(), "public", "images", "products", imageName);
    
    // Ensure dir exists
    await fs.mkdir(path.dirname(imagePath), { recursive: true });
    await fs.writeFile(imagePath, buffer);

    // 2. Update JSON Data
    const jsonPath = path.join(process.cwd(), "data", "products.json");
    const fileData = await fs.readFile(jsonPath, "utf8");
    const products = JSON.parse(fileData);

    // Add image path to product object
    newProduct.image = `/images/products/${imageName}`;
    newProduct.price = Number(newProduct.price); // Ensure number

    // Append to beginning or end
    products.unshift(newProduct);

    // Write back
    await fs.writeFile(jsonPath, JSON.stringify(products, null, 2));

    return NextResponse.json({ success: true, product: newProduct });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

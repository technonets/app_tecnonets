import { getProducts } from "@/lib/products";

export default async function TestPage() {
  const products = await getProducts();
  
  return (
    <div className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug: Productos con Fechas</h1>
      <pre className="bg-gray-900 p-4 rounded overflow-auto">
        {JSON.stringify(products, null, 2)}
      </pre>
    </div>
  );
}

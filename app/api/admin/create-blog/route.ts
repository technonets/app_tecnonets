import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const API_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY;

    if (!API_URL || !API_KEY) {
        return NextResponse.json({ success: false, message: "Configuration Error" }, { status: 500 });
    }
    
    // Inject API Key and Action into URL
    const url = `${API_URL}?action=createPost&key=${API_KEY}`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(body)
    });

    const data = await res.json();
    
    if (!res.ok) {
        return NextResponse.json({ 
            success: false, 
            error: data.error || "Error en el servidor de Google",
            debug: data 
        }, { status: res.status });
    }

    // Limpiar el cache del blog
    try {
        revalidatePath('/blog');
        // revalidatePath('/blog/[slug]', 'page');
        // revalidateTag('blog');
    } catch (e) {
        console.error("Revalidation error:", e);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Create Blog Proxy Error:", error);
    return NextResponse.json({ 
        success: false, 
        error: "Error interno de servidor creando el post" 
    }, { status: 500 });
  }
}

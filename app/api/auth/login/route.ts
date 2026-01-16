import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usuario, password } = body;

    const API_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL;
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY;

    if (!API_URL || !API_KEY) {
      return NextResponse.json({ success: false, message: "Configuration Error" }, { status: 500 });
    }

    // Call Google Script Server-to-Server
    // Action and Key must be in URL because of the way GAS handles e.parameter vs e.postData
    const url = `${API_URL}?action=login&key=${API_KEY}`;
    
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
            usuario, 
            password
        })
    });

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Login Proxy Error:", error);
    return NextResponse.json({ success: false, message: "Error interno de servidor" }, { status: 500 });
  }
}

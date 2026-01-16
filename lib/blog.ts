


const API_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL!;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_KEY!;

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML o Markdown
  date: string;
  author: string;
  category: string;
  image: string;
}

// Helper para corregir URLs de Google Drive (REMOVED - Using next/image instead)

export async function getPosts(): Promise<BlogPost[]> {
    try {
        if (!API_URL || !API_KEY) {
            console.error("API Configuration missing for Blog");
            return [];
        }

        const url = `${API_URL}?action=getPosts&key=${API_KEY}`;
        
        const res = await fetch(url, { 
            next: { 
                revalidate: 60, // Cache de 1 minuto 
                tags: ['blog'] 
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch posts: ${res.status}`);
        }

        const data = await res.json();
        
        if (Array.isArray(data)) {
            return data;
        }

        return [];

    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
}

export async function createPost(postData: any) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "createPost",
                key: API_KEY,
                ...postData
            }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating post:", error);
        return { success: false, message: error instanceof Error ? error.message : "Error desconocido" };
    }
}

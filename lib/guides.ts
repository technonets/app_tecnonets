import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const guidesDirectory = path.join(process.cwd(), 'data/guides');

export interface GuideData {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  image: string;
  contentHtml: string;
}

export async function getAllGuides() {
  const fileNames = fs.readdirSync(guidesDirectory);
  const allGuidesData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(guidesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      ...(matterResult.data as { 
        title: string; 
        description: string; 
        date: string; 
        author: string; 
        category: string; 
        image: string 
      }),
    };
  });

  return allGuidesData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getGuideData(slug: string): Promise<GuideData> {
  const fullPath = path.join(guidesDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  
  let contentHtml = processedContent.toString();

  // Reemplazo robusto para botones profesionales usando marcadores personalizados
  // [[BTN_PRIMARY:texto:url]] -> Botón de alta visibilidad
  // [[BTN_SECONDARY:texto:url]] -> Botón de acompañamiento
  // Manejamos también posibles tags <p> que el parser de markdown añada automáticamente
  contentHtml = contentHtml
    .replace(/(?:<p>)?\[\[BTN_PRIMARY:([^:]+):([^\]]+)\]\](?:<\/p>)?/g, (match, text, url) => {
      return `<div class="guide-btn-container"><a href="${url}" class="guide-btn guide-btn-primary" target="_blank" rel="noopener noreferrer">${text}</a></div>`;
    })
    .replace(/(?:<p>)?\[\[BTN_SECONDARY:([^:]+):([^\]]+)\]\](?:<\/p>)?/g, (match, text, url) => {
      return `<div class="guide-btn-container"><a href="${url}" class="guide-btn guide-btn-secondary" target="_blank" rel="noopener noreferrer">${text}</a></div>`;
    });

  // Limpieza opcional: Si hay múltiples contenedores seguidos, los agrupamos (aunque individualmente funcionan bien)
  contentHtml = contentHtml.replace(/<\/div><div class="guide-btn-container">/g, '');

  return {
    slug,
    contentHtml,
    ...(matterResult.data as { 
      title: string; 
      description: string; 
      date: string; 
      author: string; 
      category: string; 
      image: string 
    }),
  };
}

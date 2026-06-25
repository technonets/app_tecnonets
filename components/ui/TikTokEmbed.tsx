import React from 'react';

interface TikTokEmbedProps {
  postUrl: string;
}

export function TikTokEmbed({ postUrl }: TikTokEmbedProps) {
  const isYouTube = postUrl.includes('youtube.com') || postUrl.includes('youtu.be') || postUrl.includes('youtube-nocookie.com');

  if (isYouTube) {
    // Extraer el ID del video de YouTube Shorts o video estándar
    const match = postUrl.match(/(?:shorts\/|v=|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match ? match[1] : '';

    if (!videoId) {
      return (
        <div className="w-full h-[580px] rounded-2xl bg-foreground/5 flex items-center justify-center border border-foreground/10 text-foreground/40 text-sm font-medium">
          Video no disponible
        </div>
      );
    }

    return (
      <div className="w-full max-w-[325px] h-[580px] rounded-2xl overflow-hidden bg-black border border-border/50 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 relative">
        {/* Usamos el embed optimizado de YouTube */}
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&mute=0`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; gyroscope; accelerometer"
          allowFullScreen
          loading="lazy"
          title={`YouTube video ${videoId}`}
        />
      </div>
    );
  }

  // Lógica para TikTok
  const match = postUrl.match(/\/video\/(\d+)/);
  const videoId = match ? match[1] : '';

  if (!videoId) {
    return (
      <div className="w-full h-[580px] rounded-2xl bg-foreground/5 flex items-center justify-center border border-foreground/10 text-foreground/40 text-sm font-medium">
        Video no disponible
      </div>
    );
  }

  return (
    <div className="w-full max-w-[325px] h-[580px] rounded-2xl overflow-hidden bg-black border border-border/50 shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20 relative">
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        className="absolute top-0 left-0 w-full h-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; gyroscope; accelerometer"
        allowFullScreen
        loading="lazy"
        title={`TikTok video ${videoId}`}
      />
    </div>
  );
}

export default TikTokEmbed;

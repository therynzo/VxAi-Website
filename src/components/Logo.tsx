import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  customLogoUrl?: string | null;
}

export default function Logo({ className = '', size = 'md', interactive = true, customLogoUrl = null }: LogoProps) {
  // Determine pixel sizes
  const dims = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-40 h-40',
  }[size];

  const actualLogoUrl = customLogoUrl || "https://cdn.discordapp.com/attachments/1409167460145434747/1514193012954239087/a587b42c797f6a86face45073eb13359.jpg?ex=6a2fbfa2&is=6a2e6e22&hm=6656e3e42a586e4f45a0a424b72f8fa8f7fb2b62da258b8ab6c3bccc001b7aca&";

  return (
    <div
      className={`relative inline-block overflow-hidden rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 p-0.5 shadow-md flex-shrink-0 ${
        interactive ? 'transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/20 hover:brightness-110' : ''
      } ${dims} ${className}`}
    >
      <div className="relative flex h-full w-full items-center justify-center rounded-lg bg-zinc-950 overflow-hidden">
        <img 
          src={actualLogoUrl} 
          alt="CODING AI Brand Logo" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

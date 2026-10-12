import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type React from "react";

interface SlideArrowButtonProps {
  text?: string;
  primaryColor?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export default function SlideArrowButton({
  text = "Get Started",
  primaryColor = "#005A36",
  className = "",
  href,
  onClick,
}: SlideArrowButtonProps) {
  const content = (
    <>
      {/* Background slide element */}
      <div
        className="absolute left-0 top-0 flex h-full w-11 items-center justify-end rounded-full transition-all duration-300 ease-in-out group-hover/slide:w-full group-hover/slide:shadow-[0_0_25px_rgba(16,185,129,0.7)] pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      >
        <span className="mr-3 text-white transition-all duration-300 ease-in-out">
          <ArrowRight size={20} />
        </span>
      </div>

      {/* Button text */}
      <span
        className="relative left-4 z-10 whitespace-nowrap px-8 font-medium text-black transition-all duration-300 ease-in-out group-hover/slide:-left-3 group-hover/slide:text-white pointer-events-none select-none"
        style={{ fontFamily: 'Inter, "Plus Jakarta Sans", "Geist", system-ui, -apple-system, sans-serif' }}
      >
        {text}
      </span>
    </>
  );

  const baseClasses = `group/slide relative inline-flex items-center overflow-hidden rounded-full border-2 bg-white p-2 text-base transition-all duration-300 cursor-pointer ${className}`;
  const style = { borderColor: "#10b981" };

  if (href) {
    return (
      <Link href={href} className={baseClasses} style={style} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={baseClasses} style={style} onClick={onClick}>
      {content}
    </button>
  );
}

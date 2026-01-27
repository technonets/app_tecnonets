import Link from "next/link";

export function WhatsAppButton() {
  // TODO: CHANGE THIS NUMBER
  const phoneNumber = "573244916040";
  const message = "Hola, me interesa saber más sobre sus servicios.";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 relative"
      >
        {/* Tooltip */}
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
          ¡Contáctanos!
          {/* Tooltip Arrow */}
          <span className="absolute top-1/2 -right-1 -mt-1 border-4 border-transparent border-l-gray-900"></span>
        </span>

        {/* WhatsApp Icon */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382C17.112 14.197 15.337 13.315 15.006 13.193C14.673 13.072 14.432 13.011 14.189 13.376C13.945 13.743 13.253 14.568 13.041 14.812C12.83 15.056 12.618 15.086 12.256 14.903C11.666 14.606 10.871 14.321 9.948 13.488C9.205 12.825 8.702 12.007 8.522 11.699C8.341 11.393 8.502 11.229 8.683 11.047C8.845 10.884 9.043 10.623 9.224 10.408C9.406 10.198 9.466 9.983 9.587 9.739C9.707 9.495 9.646 9.282 9.555 9.098C9.467 8.914 8.771 7.18 8.484 6.475C8.203 5.792 7.923 5.887 7.712 5.887H7.139C6.927 5.887 6.596 5.979 6.324 6.284C6.052 6.589 5.27 7.329 5.27 8.84C5.27 10.352 6.353 11.815 6.502 12.03C6.654 12.245 8.356 14.909 10.983 16.035C12.802 16.814 13.568 16.797 14.542 16.65C15.617 16.488 17.112 15.683 17.472 14.654C17.834 13.623 17.834 12.738 17.744 12.583C17.653 12.433 17.411 12.343 17.051 12.162V12.162ZM12.009 21.928L12.001 21.928C10.224 21.928 8.572 21.464 7.122 20.648L6.776 20.442L2.996 21.442L4.095 17.798L3.864 17.432C2.949 15.978 2.464 14.28 2.464 12.518C2.464 7.319 6.745 3.09 12.012 3.09C14.566 3.09 16.953 4.09 18.756 5.897C20.559 7.705 21.554 10.106 21.551 12.658C21.547 17.859 17.265 22.091 12.009 21.928V21.928ZM12.007 0.957C5.679 0.957 0.527 6.138 0.527 12.515C0.527 14.604 1.096 16.551 2.096 18.25L1.874 18.667L0.518 23.619L5.592 22.285L6.046 22.517C7.689 23.407 9.711 23.951 11.996 23.951H12.005C18.324 23.951 23.475 18.89 24.529 12.525C23.475 6.147 18.324 0.963 12.005 0.963L12.007 0.957Z" />
        </svg>

        {/* Ping Animation for Engagement */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-20 animate-ping"></span>
      </Link>
    </div>
  );
}

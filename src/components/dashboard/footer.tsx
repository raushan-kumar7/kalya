// import Link from "next/link";
// import { Icon } from "@/components/shared";

// const links = [
//   { label: "Help", href: "/dashboard/help" },
//   { label: "Privacy", href: "/privacy" },
//   { label: "Terms", href: "/terms" },
// ];

// export const Footer = () => {
//   const year = new Date().getFullYear();

//   return (
//     <footer className="border-border text-text-muted flex flex-col gap-3 border-t px-4 py-5 text-xs md:flex-row md:items-center md:justify-between md:px-8">
//       <div className="flex items-center gap-2">
//         <Icon width={16} height={16} className="opacity-80" />
//         <span>
//           © {year} Kalya. <span className="hidden sm:inline">Ready for tomorrow.</span>
//         </span>
//       </div>

//       <nav aria-label="Footer" className="flex items-center gap-5">
//         {links.map((link) => (
//           <Link
//             key={link.href}
//             href={link.href}
//             className="hover:text-text-primary transition-colors"
//           >
//             {link.label}
//           </Link>
//         ))}
//         <span className="font-numeric text-text-muted/70">v1.0.0</span>
//       </nav>
//     </footer>
//   );
// };

import Link from "next/link";
import { Icon } from "@/components/shared";

const links = [
  { label: "Help", href: "/dashboard/help" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-border bg-surface text-text-muted fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 border-t px-4 py-4 text-xs transition-[left] duration-300 md:left-(--sidebar-w,220px) md:flex-row md:items-center md:justify-between md:px-8">
      <div className="flex items-center gap-2">
        <Icon width={16} height={16} className="opacity-80" />
        <span>
          © {year} Kalya. <span className="hidden sm:inline">Ready for tomorrow.</span>
        </span>
      </div>

      <nav aria-label="Footer" className="flex items-center gap-5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <span className="font-numeric text-text-muted/70">v1.0.0</span>
      </nav>
    </footer>
  );
};

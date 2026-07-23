// import { Camera } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui";
// import { ChangeEvent, useRef } from "react";

// interface UserAvatarProps {
//   url: string;
//   alt: string;
//   fallback: string;
// }

// export function UserAvatar({ url, alt, fallback }: UserAvatarProps) {
//   const avatarInputRef = useRef<HTMLInputElement>(null);

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     console.log("File URL: ", file);
//     e.target.value = "";
//   };

//   return (
//     <div className="relative w-fit">
//       <Avatar size="lg">
//         <AvatarImage src={url} alt={alt} />
//         <AvatarFallback>{fallback}</AvatarFallback>
//       </Avatar>
//       <button
//         type="button"
//         onClick={() => avatarInputRef.current?.click()}
//         aria-label="Change profile photo"
//         className="border-bg bg-primary absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
//       >
//         <Camera size={14} />
//       </button>
//       <input
//         ref={avatarInputRef}
//         type="file"
//         accept="image/*"
//         className="hidden"
//         onChange={handleFileChange}
//       />
//     </div>
//   );
// }

// "use client";

// import { Camera, Loader2, Trash2 } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui";
// import { ChangeEvent, useRef, useState } from "react";
// import { useUser } from "@/hooks/users";
// import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/constants";
// import { appEvents } from "@/utils/events";

// interface UserAvatarProps {
//   url: string;
//   alt: string;
//   fallback: string;
// }

// export function UserAvatar({ url, alt, fallback }: UserAvatarProps) {
//   const avatarInputRef = useRef<HTMLInputElement>(null);
//   const [localPreview, setLocalPreview] = useState<string | null>(null);
//   const { updateAvatar, isUpdatingAvatar, removeAvatar, isRemovingAvatar } = useUser();

//   const busy = isUpdatingAvatar || isRemovingAvatar;

//   // const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
//   //   const file = e.target.files?.[0];
//   //   // Reset immediately so picking the same file again still fires onChange.
//   //   e.target.value = "";
//   //   if (!file) return;

//   //   if (file.size > MAX_AVATAR_BYTES) {
//   //     appEvents.emit("toast:show", {
//   //       variant: "danger",
//   //       title: "Image too large",
//   //       description: "Please choose an image under 5MB.",
//   //     });
//   //     return;
//   //   }
//   //   if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
//   //     appEvents.emit("toast:show", {
//   //       variant: "danger",
//   //       title: "Unsupported file type",
//   //       description: "Only JPEG, PNG, or WebP images are allowed.",
//   //     });
//   //     return;
//   //   }

//   //   // Optimistic preview while the upload is in flight and while
//   //   // SessionSync catches up with the real image URL from the server.
//   //   const objectUrl = URL.createObjectURL(file);
//   //   setLocalPreview(objectUrl);

//   //   try {
//   //     await updateAvatar(file);
//   //     appEvents.emit("toast:show", {
//   //       variant: "success",
//   //       title: "Profile photo updated",
//   //     });
//   //   } catch (err) {
//   //     appEvents.emit("toast:show", {
//   //       variant: "danger",
//   //       title: "Could not update photo",
//   //       description: err instanceof Error ? err.message : "Please try again.",
//   //     });
//   //   } finally {
//   //     URL.revokeObjectURL(objectUrl);
//   //     setLocalPreview(null);
//   //   }
//   // };

//   // const handleRemove = async () => {
//   //   try {
//   //     await removeAvatar();
//   //     appEvents.emit("toast:show", {
//   //       variant: "success",
//   //       title: "Profile photo removed",
//   //     });
//   //   } catch (err) {
//   //     appEvents.emit("toast:show", {
//   //       variant: "danger",
//   //       title: "Could not remove photo",
//   //       description: err instanceof Error ? err.message : "Please try again.",
//   //     });
//   //   }
//   // };

//   const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     // Reset immediately so picking the same file again still fires onChange.
//     e.target.value = "";
//     if (!file) return;

//     if (file.size > MAX_AVATAR_BYTES) {
//       appEvents.emit("toast:show", {
//         variant: "error", // changed from "danger"
//         title: "Image too large",
//         description: "Please choose an image under 5MB.",
//       });
//       return;
//     }
//     if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
//       appEvents.emit("toast:show", {
//         variant: "error", // changed from "danger"
//         title: "Unsupported file type",
//         description: "Only JPEG, PNG, or WebP images are allowed.",
//       });
//       return;
//     }

//     // Optimistic preview while the upload is in flight and while
//     // SessionSync catches up with the real image URL from the server.
//     const objectUrl = URL.createObjectURL(file);
//     setLocalPreview(objectUrl);

//     try {
//       await updateAvatar(file);
//       appEvents.emit("toast:show", {
//         variant: "success",
//         title: "Profile photo updated",
//       });
//     } catch (err) {
//       appEvents.emit("toast:show", {
//         variant: "error", // changed from "danger"
//         title: "Could not update photo",
//         description: err instanceof Error ? err.message : "Please try again.",
//       });
//     } finally {
//       URL.revokeObjectURL(objectUrl);
//       setLocalPreview(null);
//     }
//   };

//   const handleRemove = async () => {
//     try {
//       await removeAvatar();
//       appEvents.emit("toast:show", {
//         variant: "success",
//         title: "Profile photo removed",
//       });
//     } catch (err) {
//       appEvents.emit("toast:show", {
//         variant: "error", // changed from "danger"
//         title: "Could not remove photo",
//         description: err instanceof Error ? err.message : "Please try again.",
//       });
//     }
//   };

//   return (
//     <div className="relative w-fit">
//       <Avatar size="lg" className={busy ? "opacity-60" : undefined}>
//         <AvatarImage src={localPreview ?? url} alt={alt} />
//         <AvatarFallback>{fallback}</AvatarFallback>
//       </Avatar>

//       {busy && (
//         <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
//           <Loader2 size={18} className="animate-spin text-white" />
//         </div>
//       )}

//       <button
//         type="button"
//         onClick={() => avatarInputRef.current?.click()}
//         disabled={busy}
//         aria-label="Change profile photo"
//         className="border-bg bg-primary absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-white shadow-sm transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
//       >
//         <Camera size={14} />
//       </button>

//       {url && !busy && (
//         <button
//           type="button"
//           onClick={handleRemove}
//           aria-label="Remove profile photo"
//           className="border-bg bg-danger absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
//         >
//           <Trash2 size={12} />
//         </button>
//       )}

//       <input
//         ref={avatarInputRef}
//         type="file"
//         accept={ALLOWED_AVATAR_TYPES.join(",")}
//         className="hidden"
//         onChange={handleFileChange}
//       />
//     </div>
//   );
// }

// "use client";

// import { Camera, ImageUp, Loader2, Trash2 } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui";
// import { ChangeEvent, useEffect, useRef, useState } from "react";
// import { useUser } from "@/hooks/users";
// import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/constants";
// import { appEvents } from "@/utils/events";

// interface UserAvatarProps {
//   url: string;
//   alt: string;
//   fallback: string;
// }

// export function UserAvatar({ url, alt, fallback }: UserAvatarProps) {
//   const avatarInputRef = useRef<HTMLInputElement>(null);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const [localPreview, setLocalPreview] = useState<string | null>(null);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const { updateAvatar, isUpdatingAvatar, removeAvatar, isRemovingAvatar } = useUser();

//   const busy = isUpdatingAvatar || isRemovingAvatar;

//   // Close the menu on outside click / Escape.
//   useEffect(() => {
//     if (!menuOpen) return;

//     const handleClickAway = (e: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         setMenuOpen(false);
//       }
//     };
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setMenuOpen(false);
//     };

//     document.addEventListener("mousedown", handleClickAway);
//     document.addEventListener("keydown", handleEscape);
//     return () => {
//       document.removeEventListener("mousedown", handleClickAway);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [menuOpen]);

//   const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     // Reset immediately so picking the same file again still fires onChange.
//     e.target.value = "";
//     if (!file) return;

//     if (file.size > MAX_AVATAR_BYTES) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Image too large",
//         description: "Please choose an image under 5MB.",
//       });
//       return;
//     }
//     if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Unsupported file type",
//         description: "Only JPEG, PNG, or WebP images are allowed.",
//       });
//       return;
//     }

//     // Optimistic preview while the upload is in flight and while
//     // SessionSync catches up with the real image URL from the server.
//     const objectUrl = URL.createObjectURL(file);
//     setLocalPreview(objectUrl);

//     try {
//       await updateAvatar(file);
//       appEvents.emit("toast:show", {
//         variant: "success",
//         title: "Profile photo updated",
//       });
//     } catch (err) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Could not update photo",
//         description: err instanceof Error ? err.message : "Please try again.",
//       });
//     } finally {
//       URL.revokeObjectURL(objectUrl);
//       setLocalPreview(null);
//     }
//   };

//   const handleRemove = async () => {
//     setMenuOpen(false);
//     try {
//       await removeAvatar();
//       appEvents.emit("toast:show", {
//         variant: "success",
//         title: "Profile photo removed",
//       });
//     } catch (err) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Could not remove photo",
//         description: err instanceof Error ? err.message : "Please try again.",
//       });
//     }
//   };

//   const openFilePicker = () => {
//     setMenuOpen(false);
//     avatarInputRef.current?.click();
//   };

//   return (
//     <div className="relative w-fit">
//       <Avatar size="lg" className={busy ? "opacity-60" : undefined}>
//         <AvatarImage src={localPreview ?? url} alt={alt} />
//         <AvatarFallback>{fallback}</AvatarFallback>
//       </Avatar>

//       {busy && (
//         <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
//           <Loader2 size={18} className="animate-spin text-white" />
//         </div>
//       )}

//       {/* Single entry point for all avatar actions — replaces the previous
//           two overlapping corner buttons (camera + trash), which competed
//           for the same small footprint and looked cluttered / accidentally
//           tappable on mobile. */}
//       {!busy && (
//         <div ref={menuRef} className="absolute -right-1 -bottom-1">
//           <button
//             type="button"
//             onClick={() => (url ? setMenuOpen((v) => !v) : openFilePicker())}
//             aria-label={url ? "Edit profile photo" : "Add profile photo"}
//             aria-haspopup={url ? "menu" : undefined}
//             aria-expanded={url ? menuOpen : undefined}
//             className="border-bg bg-primary flex h-7 w-7 items-center justify-center rounded-full border-2 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
//           >
//             <Camera size={14} />
//           </button>

//           {menuOpen && (
//             <div
//               role="menu"
//               className="border-border bg-surface absolute right-0 bottom-9 z-10 ml-32 w-44 overflow-hidden rounded-lg border py-1 shadow-lg"
//             >
//               <button
//                 type="button"
//                 role="menuitem"
//                 onClick={openFilePicker}
//                 className="text-text-primary hover:bg-surface-raised text-body-sm flex w-full items-center gap-2 px-3 py-2 text-left"
//               >
//                 <ImageUp size={14} className="text-text-secondary" />
//                 Upload new photo
//               </button>
//               <button
//                 type="button"
//                 role="menuitem"
//                 onClick={handleRemove}
//                 className="text-danger hover:bg-danger-subtle text-body-sm flex w-full items-center gap-2 px-3 py-2 text-left"
//               >
//                 <Trash2 size={14} />
//                 Remove photo
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       <input
//         ref={avatarInputRef}
//         type="file"
//         accept={ALLOWED_AVATAR_TYPES.join(",")}
//         className="hidden"
//         onChange={handleFileChange}
//       />
//     </div>
//   );
// }



// "use client";

// import { Camera, ImageUp, Loader2, Trash2 } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui";
// import { ChangeEvent, useEffect, useRef, useState } from "react";
// import { useUser } from "@/hooks/users";
// import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/constants";
// import { appEvents } from "@/utils/events";

// interface UserAvatarProps {
//   url: string;
//   alt: string;
//   fallback: string;
// }

// export function UserAvatar({ url, alt, fallback }: UserAvatarProps) {
//   const avatarInputRef = useRef<HTMLInputElement>(null);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const [localPreview, setLocalPreview] = useState<string | null>(null);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const { updateAvatar, isUpdatingAvatar, removeAvatar, isRemovingAvatar } = useUser();

//   const busy = isUpdatingAvatar || isRemovingAvatar;

//   // Close the menu on outside click / Escape.
//   useEffect(() => {
//     if (!menuOpen) return;

//     const handleClickAway = (e: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//         setMenuOpen(false);
//       }
//     };
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape") setMenuOpen(false);
//     };

//     document.addEventListener("mousedown", handleClickAway);
//     document.addEventListener("keydown", handleEscape);
//     return () => {
//       document.removeEventListener("mousedown", handleClickAway);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [menuOpen]);

//   const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     // Reset immediately so picking the same file again still fires onChange.
//     e.target.value = "";
//     if (!file) return;

//     if (file.size > MAX_AVATAR_BYTES) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Image too large",
//         description: "Please choose an image under 5MB.",
//       });
//       return;
//     }
//     if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Unsupported file type",
//         description: "Only JPEG, PNG, or WebP images are allowed.",
//       });
//       return;
//     }

//     // Optimistic preview while the upload is in flight and while
//     // SessionSync catches up with the real image URL from the server.
//     const objectUrl = URL.createObjectURL(file);
//     setLocalPreview(objectUrl);

//     try {
//       await updateAvatar(file);
//       appEvents.emit("toast:show", {
//         variant: "success",
//         title: "Profile photo updated",
//       });
//     } catch (err) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Could not update photo",
//         description: err instanceof Error ? err.message : "Please try again.",
//       });
//     } finally {
//       URL.revokeObjectURL(objectUrl);
//       setLocalPreview(null);
//     }
//   };

//   const handleRemove = async () => {
//     setMenuOpen(false);
//     try {
//       await removeAvatar();
//       appEvents.emit("toast:show", {
//         variant: "success",
//         title: "Profile photo removed",
//       });
//     } catch (err) {
//       appEvents.emit("toast:show", {
//         variant: "error",
//         title: "Could not remove photo",
//         description: err instanceof Error ? err.message : "Please try again.",
//       });
//     }
//   };

//   const openFilePicker = () => {
//     setMenuOpen(false);
//     avatarInputRef.current?.click();
//   };

//   return (
//     <div className="relative w-fit">
//       <Avatar size="lg" className={busy ? "opacity-60" : undefined}>
//         <AvatarImage src={localPreview ?? url} alt={alt} />
//         <AvatarFallback>{fallback}</AvatarFallback>
//       </Avatar>

//       {busy && (
//         <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
//           <Loader2 size={18} className="animate-spin text-white" />
//         </div>
//       )}

//       {/* Single entry point for all avatar actions — replaces the previous
//           two overlapping corner buttons (camera + trash), which competed
//           for the same small footprint and looked cluttered / accidentally
//           tappable on mobile. */}
//       {!busy && (
//         <div ref={menuRef} className="absolute -right-1 -bottom-1">
//           <button
//             type="button"
//             onClick={() => (url ? setMenuOpen((v) => !v) : openFilePicker())}
//             aria-label={url ? "Edit profile photo" : "Add profile photo"}
//             aria-haspopup={url ? "menu" : undefined}
//             aria-expanded={url ? menuOpen : undefined}
//             className="border-bg bg-primary flex h-7 w-7 items-center justify-center rounded-full border-2 text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
//           >
//             <Camera size={14} />
//           </button>

//           {menuOpen && (
//             // Anchored with `left-0` (not `right-0`) so the menu opens
//             // rightward, into open space — this avatar sits near the left
//             // edge of its card, so anchoring the menu's right edge to the
//             // button (as before) pushed it left, off the edge of the card.
//             <div
//               role="menu"
//               className="border-border bg-surface absolute -bottom-9 left-0 z-10 w-44 overflow-hidden rounded-lg border py-1 shadow-lg"
//             >
//               <button
//                 type="button"
//                 role="menuitem"
//                 onClick={openFilePicker}
//                 className="text-text-primary hover:bg-surface-raised text-body-sm flex w-full items-center gap-2 px-3 py-2 text-left"
//               >
//                 <ImageUp size={14} className="text-text-secondary" />
//                 Upload new photo
//               </button>
//               <button
//                 type="button"
//                 role="menuitem"
//                 onClick={handleRemove}
//                 className="text-danger hover:bg-danger-subtle text-body-sm flex w-full items-center gap-2 px-3 py-2 text-left"
//               >
//                 <Trash2 size={14} />
//                 Remove photo
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       <input
//         ref={avatarInputRef}
//         type="file"
//         accept={ALLOWED_AVATAR_TYPES.join(",")}
//         className="hidden"
//         onChange={handleFileChange}
//       />
//     </div>
//   );
// }


"use client";

import { Camera, ImageUp, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useUser } from "@/hooks/users";
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "@/lib/constants";
import { appEvents } from "@/utils/events";
import { AnimatePresence, motion } from "framer-motion";

interface UserAvatarProps {
  url: string;
  alt: string;
  fallback: string;
}

/* ============================================================
   UserAvatar — Kalya design system
   ------------------------------------------------------------
   The trigger opens a compact, icon-only action popover instead
   of a full text menu — two clearly distinct actions don't need
   a written label each, and a small pill is easier to place
   without covering the name/email that sits right next to the
   avatar in the profile header.

   Positioning: the popover opens *below* the trigger
   (`top-full`), not stacked over the avatar or reaching right
   into the header text — the two things that made the previous
   text menu overlap the name in the screenshot.

   Color: icon color on the primary/danger buttons uses the
   `on-primary` / `on-danger` tokens rather than a hardcoded
   white, since dark mode's primary is a bright green where
   plain white has poor contrast — those tokens are defined
   per-theme specifically to solve that.
   ============================================================ */

export function UserAvatar({ url, alt, fallback }: UserAvatarProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { updateAvatar, isUpdatingAvatar, removeAvatar, isRemovingAvatar } = useUser();

  const busy = isUpdatingAvatar || isRemovingAvatar;

  // Close the menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickAway = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickAway);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset immediately so picking the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      appEvents.emit("toast:show", {
        variant: "error",
        title: "Image too large",
        description: "Please choose an image under 5MB.",
      });
      return;
    }
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      appEvents.emit("toast:show", {
        variant: "error",
        title: "Unsupported file type",
        description: "Only JPEG, PNG, or WebP images are allowed.",
      });
      return;
    }

    // Optimistic preview while the upload is in flight and while
    // SessionSync catches up with the real image URL from the server.
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    try {
      await updateAvatar(file);
      appEvents.emit("toast:show", {
        variant: "success",
        title: "Profile photo updated",
      });
    } catch (err) {
      appEvents.emit("toast:show", {
        variant: "error",
        title: "Could not update photo",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  };

  const handleRemove = async () => {
    setMenuOpen(false);
    try {
      await removeAvatar();
      appEvents.emit("toast:show", {
        variant: "success",
        title: "Profile photo removed",
      });
    } catch (err) {
      appEvents.emit("toast:show", {
        variant: "error",
        title: "Could not remove photo",
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  const openFilePicker = () => {
    setMenuOpen(false);
    avatarInputRef.current?.click();
  };

  return (
    <div className="relative w-fit">
      <Avatar size="lg" className={busy ? "opacity-60" : undefined}>
        <AvatarImage src={localPreview ?? url} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>

      {busy && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
          <Loader2 size={18} className="text-on-primary animate-spin" />
        </div>
      )}

      {/* Single entry point for avatar actions. When there's no photo yet,
          there's nothing to remove, so the trigger opens the file picker
          directly instead of a menu with one live option. */}
      {!busy && (
        <div ref={menuRef} className="absolute -right-1 -bottom-1">
          <button
            type="button"
            onClick={() => (url ? setMenuOpen((v) => !v) : openFilePicker())}
            aria-label={url ? "Edit profile photo" : "Add profile photo"}
            aria-haspopup={url ? "menu" : undefined}
            aria-expanded={url ? menuOpen : undefined}
            className="border-bg bg-primary text-on-primary flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <Camera size={14} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.12 }}
                // Opens below-right of the trigger, clear of both the
                // avatar and the name/email text beside it — the previous
                // menu opened upward and left, straight over both.
                className="border-border bg-surface absolute top-full right-0 z-10 mt-2 flex items-center gap-0.5 rounded-full border p-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  title="Upload new photo"
                  aria-label="Upload new photo"
                  onClick={openFilePicker}
                  className="text-text-secondary hover:bg-surface-raised hover:text-text-primary flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                >
                  <ImageUp size={15} />
                </button>
                <span className="bg-border h-4 w-px" />
                <button
                  type="button"
                  role="menuitem"
                  title="Remove photo"
                  aria-label="Remove photo"
                  onClick={handleRemove}
                  className="text-text-secondary hover:bg-danger-subtle hover:text-danger flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <input
        ref={avatarInputRef}
        type="file"
        accept={ALLOWED_AVATAR_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
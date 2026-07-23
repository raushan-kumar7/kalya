/* eslint-disable react-hooks/set-state-in-effect */
// /* eslint-disable react-hooks/set-state-in-effect */
// "use client";

// import {
//   Button,
//   Input,
//   Modal,
//   ModalBody,
//   ModalContent,
//   ModalDescription,
//   ModalFooter,
//   ModalHeader,
//   ModalTitle,
// } from "@/components/ui";
// import { Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";

// interface DeleteAccountModalProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }

// const CONFIRM_WORD = "DELETE";

// export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
//   const [confirmText, setConfirmText] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   useEffect(() => {
//     if (open) setConfirmText("");
//   }, [open]);

//   const canDelete = confirmText === CONFIRM_WORD;

//   const handleDelete = async () => {
//     if (!canDelete) return;
//     setIsSubmitting(true);
//     console.log("Delete account confirmed");
//     setIsSubmitting(false);
//     onOpenChange(false);
//   };

//   return (
//     <Modal open={open} onOpenChange={onOpenChange}>
//       <ModalContent size="md">
//         <ModalHeader tone="danger" icon={<Trash2 size={18} />}>
//           <ModalTitle>Delete account</ModalTitle>
//           <ModalDescription>This action can&apos;t be undone.</ModalDescription>
//         </ModalHeader>

//         <ModalBody className="flex flex-col gap-4">
//           <ul className="text-body-sm text-text-secondary list-disc space-y-1.5 pl-5">
//             <li>Your profile, username, and email will be permanently removed.</li>
//             <li>Active sessions on all devices will be signed out.</li>
//             <li>This cannot be recovered once completed.</li>
//           </ul>
//           <Input
//             label={`Type ${CONFIRM_WORD} to confirm`}
//             placeholder={CONFIRM_WORD}
//             value={confirmText}
//             onChange={(e) => setConfirmText(e.target.value)}
//           />
//         </ModalBody>

//         <ModalFooter>
//           <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button
//             type="button"
//             variant="danger"
//             disabled={!canDelete || isSubmitting}
//             onClick={handleDelete}
//           >
//             {isSubmitting ? "Deleting…" : "Delete my account"}
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }

"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui";
import { useUser } from "@/hooks/users";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONFIRM_WORD = "DELETE";

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const { deleteAccount, isUpdatingSecurity, securityError } = useUser();

  // Reset local form state each time the modal opens — otherwise a prior
  // failed attempt's password/confirm text lingers on screen.
  useEffect(() => {
    if (open) {
      setConfirmText("");
      setPassword("");
    }
  }, [open]);

  const canDelete = confirmText === CONFIRM_WORD && !isUpdatingSecurity;

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_WORD) return;
    try {
      // Password is only meaningful for email/password accounts; better-auth
      // ignores it for OAuth-only users, so send undefined rather than "".
      await deleteAccount(password || undefined);
      // No manual close/redirect here — the onSuccess in useUser's
      // deleteAccount already pushes to /auth/sign-in once the session
      // is actually gone. Closing the modal ourselves first would just
      // flash the settings page mid-navigation.
    } catch {
      // securityError below already reflects the failure; nothing else to do.
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="md">
        <ModalHeader tone="danger" icon={<Trash2 size={18} />}>
          <ModalTitle>Delete account</ModalTitle>
          <ModalDescription>This action can&apos;t be undone.</ModalDescription>
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4">
          <ul className="text-body-sm text-text-secondary list-disc space-y-1.5 pl-5">
            <li>Your profile, username, and email will be permanently removed.</li>
            <li>Active sessions on all devices will be signed out.</li>
            <li>This cannot be recovered once completed.</li>
          </ul>

          <Input
            type="password"
            label="Current password"
            placeholder="Required if you signed up with email & password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isUpdatingSecurity}
          />

          <Input
            label={`Type ${CONFIRM_WORD} to confirm`}
            placeholder={CONFIRM_WORD}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isUpdatingSecurity}
          />

          {securityError && (
            <p className="text-body-sm text-danger" role="alert">
              {securityError}
            </p>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdatingSecurity}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={!canDelete} onClick={handleDelete}>
            {isUpdatingSecurity ? "Deleting…" : "Delete my account"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

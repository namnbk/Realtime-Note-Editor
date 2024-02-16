"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { onDelNoti, onHardDelNoti, onRestoreNoti } from "./constants";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useCoverImageRemove } from "@/hooks/use-cover-image-remove";
import { url } from "inspector";

interface BannerProps {
  documentId: Id<"documents">;
  coverImageUrl: string | undefined;
}

export const Banner = ({ documentId, coverImageUrl }: BannerProps) => {
  // Hooks
  const router = useRouter();
  const remove = useMutation(api.documents.remove);
  const restore = useMutation(api.documents.restore);

  const { handleCoverImageRemove } = useCoverImageRemove();

  // Function
  const onRemove = () => {
    // Function
    const totalRemove = (async () => {
      // remove cover image from bucket store
      await handleCoverImageRemove(coverImageUrl);
      // remove document from database
      await remove({ id: documentId });
    })();
    // Noti
    toast.promise(totalRemove, onHardDelNoti);
    // After remove
    router.push("/documents");
  };

  const onRestore = () => {
    const promise = restore({ id: documentId });
    toast.promise(promise, onRestoreNoti);
  };

  // Rendering
  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This page is in the Trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore Page
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete Forever
        </Button>
      </ConfirmModal>
    </div>
  );
};

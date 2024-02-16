import { useEdgeStore } from "@/lib/edgestore";

export const useCoverImageRemove = () => {
  // Hooks
  const { edgestore } = useEdgeStore();

  // Function
  const handleCoverImageRemove = async (url: string | undefined) => {
    if (url) {
      await edgestore.publicFiles.delete({
        url: url,
      });
    }
  };

  // Return
  return { handleCoverImageRemove };
};

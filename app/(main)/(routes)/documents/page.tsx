"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { initDocName, onCreateNoti } from "../../_components/constants";

const DocumentsPage = () => {
  // Hooks
  const { user } = useUser();
  const create = useMutation(api.documents.create);
  const get = useQuery(api.documents.get);
  // Function
  const onCreate = () => {
    const promise = create({ title: initDocName });
    toast.promise(promise, onCreateNoti);
  };
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Image
        src="/empty.png"
        height="300"
        width="300"
        alt="Empty"
        className="dark:hidden"
      />
      <Image
        src="/empty-dark.png"
        height="300"
        width="300"
        alt="Dark empty"
        className="hidden dark:block"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s Jotion
      </h2>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
    </div>
  );
};

export default DocumentsPage;

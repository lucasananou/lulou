"use client";

import { PostForm } from "./PostForm";
import { updatePost } from "@/modules/posts/actions";
import { type CreatePostInput } from "@/contracts/posts";

interface PostFormWrapperProps {
  clientId: string;
  postId: string;
  defaultValues?: any;
}

export function PostFormWrapper({
  clientId,
  postId,
  defaultValues,
}: PostFormWrapperProps) {
  const handleSubmit = async (data: CreatePostInput) => {
    await updatePost(postId, data);
  };

  return (
    <PostForm
      clientId={clientId}
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
    />
  );
}


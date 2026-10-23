"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function addTodo(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title || title.length > 500) return;
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("todos").insert({ title, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function toggleTodo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = formData.get("is_complete") === "true";
  const { supabase } = await requireUser();
  // RLS guarantees only the owner's row can be updated.
  const { error } = await supabase.from("todos").update({ is_complete: next }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

export async function deleteTodo(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireUser();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}

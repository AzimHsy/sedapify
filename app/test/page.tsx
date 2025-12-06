import { supabase } from "@/lib/supabaseClient";

export default async function TestPage() {
  const { data, error } = await supabase.from("recipes").select("*");

  console.log(data, error);

  return <div>Check your console!</div>;
}

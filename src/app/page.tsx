import { redirect } from "next/navigation";

export default function HomePage() {
  // Ana sayfa direkt login'e yönlendir
  redirect("/login");
}

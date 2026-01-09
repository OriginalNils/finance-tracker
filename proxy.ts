// middleware.ts
import { auth } from "@/auth";
export { auth as proxy };

export const config = {
  // Schützt alle Seiten außer /login und /api
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
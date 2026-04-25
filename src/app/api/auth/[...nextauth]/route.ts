// NextAuth v5 catch-all API route — delegates all GET/POST to the handlers.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;

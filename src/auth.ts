import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
export { handlers, auth, signIn, signOut };

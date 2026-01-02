import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow specific email addresses to sign in
      const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || []
      
      if (allowedEmails.length > 0 && user.email) {
        return allowedEmails.includes(user.email)
      }
      
      return true
    },
    async session({ session }) {
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

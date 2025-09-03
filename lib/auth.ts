import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from './mongodb';
import User from '../models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          const existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            const newUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
            });
            console.log('Created new user:', newUser.email);
          } else {
            console.log('Existing user signed in:', existingUser.email);
          }
          
          return true;
        } catch (error) {
          console.error('Error signing in:', error);
          return true;
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
            const legacyAdminEmail = process.env.ADMIN_EMAIL;
            if (legacyAdminEmail) {
              adminEmails.push(legacyAdminEmail);
            }
            
            session.user.isAdmin = adminEmails.includes(session.user.email) || dbUser.isAdmin;
          }
        } catch (error) {
          console.error('Error fetching user session:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      isAdmin: boolean;
    };
  }
}

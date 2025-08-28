import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get admin emails from environment variables
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
    const legacyAdminEmail = process.env.ADMIN_EMAIL;
    if (legacyAdminEmail) {
      adminEmails.push(legacyAdminEmail);
    }

    if (adminEmails.length === 0) {
      return NextResponse.json({ error: 'No admin emails configured' }, { status: 400 });
    }

    // Update admin status for all users with admin emails
    const result = await User.updateMany(
      { email: { $in: adminEmails } },
      { $set: { isAdmin: true } }
    );

    // Also remove admin status from users who shouldn't have it
    await User.updateMany(
      { email: { $nin: adminEmails }, isAdmin: true },
      { $set: { isAdmin: false } }
    );

    return NextResponse.json({ 
      message: 'Admin status updated successfully',
      updatedUsers: result.modifiedCount,
      adminEmails: adminEmails
    });
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json({ error: 'Failed to update admin status' }, { status: 500 });
  }
}


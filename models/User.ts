import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  googleId: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Pre-save hook to check if user is admin based on email
UserSchema.pre('save', function(next) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  const legacyAdminEmail = process.env.ADMIN_EMAIL;
  
  // Support both ADMIN_EMAILS (new) and ADMIN_EMAIL (legacy)
  if (legacyAdminEmail) {
    adminEmails.push(legacyAdminEmail);
  }
  
  if (adminEmails.includes(this.email)) {
    this.isAdmin = true;
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

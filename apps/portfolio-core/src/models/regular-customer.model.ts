import { Schema, model, Document, Model } from 'mongoose';
import {
  CustomerMembershipTier,
  IRegularCustomer,
  IRegularCustomerMasked,
} from '@portfolio/shared-types';
import {
  encryptKYC,
  generateBlindIndex,
  maskAadhaar,
  maskDL,
} from '../utils/security/kyc-crypto.util';

export interface IRegularCustomerDocument extends Document {
  membershipId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  phone: string;
  altPhone: string;
  email: string;
  aadhar: string;
  aadharBlindIndex: string;
  dl: string;
  dlBlindIndex: string;
  address: string;
  membershipTier: CustomerMembershipTier;
  discountRate: number;
  totalBookings: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  toMaskedJSON(): IRegularCustomerMasked;
}

export interface IRegularCustomerModel extends Model<IRegularCustomerDocument> {
  findByPhoneOrEmail(identifier: string): Promise<IRegularCustomerDocument | null>;
}

const RegularCustomerSchema = new Schema<IRegularCustomerDocument>(
  {
    membershipId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
      index: true,
    },
    altPhone: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v: string): boolean {
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: 'Alternate phone must be a valid 10-digit mobile number',
      },
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    // Encrypted KYC at rest
    aadhar: {
      type: String,
      required: [true, 'Aadhaar number is required'],
      trim: true,
    },
    aadharBlindIndex: {
      type: String,
      index: true,
      default: '',
    },
    dl: {
      type: String,
      required: [true, 'Driving License number is required'],
      trim: true,
    },
    dlBlindIndex: {
      type: String,
      index: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    membershipTier: {
      type: String,
      enum: ['regular', 'silver', 'gold', 'platinum'],
      default: 'regular',
      index: true,
    },
    discountRate: {
      type: Number,
      default: 10,
      min: [0, 'Discount rate cannot be negative'],
      max: [100, 'Discount rate cannot exceed 100%'],
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, unknown>) {
        delete ret['aadharBlindIndex'];
        delete ret['dlBlindIndex'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

/**
 * Pre-save middleware:
 * Encrypts sensitive KYC fields (Aadhaar & DL) using AES-256-GCM before saving to database.
 * Computes deterministic HMAC-SHA256 blind indexes for duplicate prevention without plaintext storage.
 */
RegularCustomerSchema.pre('save', async function () {
  const isAadharModified = this['isModified']('aadhar');
  const aadharVal = this.get('aadhar') as string | undefined;

  if (isAadharModified && aadharVal) {
    if (!aadharVal.startsWith('enc:v1:') && aadharVal !== '[Aadhaar Redacted]') {
      this.set('aadharBlindIndex', generateBlindIndex(aadharVal));
    }
    this.set('aadhar', encryptKYC(aadharVal));
  }

  const isDLModified = this['isModified']('dl');
  const dlVal = this.get('dl') as string | undefined;

  if (isDLModified && dlVal) {
    if (!dlVal.startsWith('enc:v1:') && dlVal !== '[DL Redacted]') {
      this.set('dlBlindIndex', generateBlindIndex(dlVal));
    }
    this.set('dl', encryptKYC(dlVal));
  }
});

/**
 * Pre-findOneAndUpdate middleware:
 * Ensures modified Aadhaar or DL in update operations are properly re-encrypted.
 */
RegularCustomerSchema.pre('findOneAndUpdate', async function () {
  const update = this['getUpdate']() as Record<string, unknown> | null;
  if (!update) return;

  const setObj = (update['$set'] || update) as Record<string, unknown>;

  if (setObj && typeof setObj['aadhar'] === 'string' && setObj['aadhar']) {
    const raw = setObj['aadhar'];
    if (!raw.startsWith('enc:v1:') && raw !== '[Aadhaar Redacted]') {
      setObj['aadharBlindIndex'] = generateBlindIndex(raw);
      setObj['aadhar'] = encryptKYC(raw);
    }
  }

  if (setObj && typeof setObj['dl'] === 'string' && setObj['dl']) {
    const raw = setObj['dl'];
    if (!raw.startsWith('enc:v1:') && raw !== '[DL Redacted]') {
      setObj['dlBlindIndex'] = generateBlindIndex(raw);
      setObj['dl'] = encryptKYC(raw);
    }
  }
});

/**
 * Custom instance method to return masked customer object.
 * Strictly guarantees that unmasked Aadhaar and DL are never sent in API responses.
 */
RegularCustomerSchema.methods['toMaskedJSON'] = function (): IRegularCustomerMasked {
  const obj = this['toObject']() as IRegularCustomer & { _id: unknown; createdAt: Date; updatedAt?: Date };
  return {
    _id: String(obj._id),
    membershipId: obj.membershipId,
    firstName: obj.firstName,
    lastName: obj.lastName,
    fatherName: obj.fatherName,
    phone: obj.phone,
    altPhone: obj.altPhone || '',
    email: obj.email,
    aadhar: maskAadhaar(obj.aadhar),
    dl: maskDL(obj.dl),
    address: obj.address,
    membershipTier: obj.membershipTier as CustomerMembershipTier,
    discountRate: obj.discountRate,
    totalBookings: obj.totalBookings,
    isActive: obj.isActive,
    createdAt: obj.createdAt ? new Date(obj.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : undefined,
  };
};

/**
 * Static lookup helper by phone or email identifier.
 */
RegularCustomerSchema.statics['findByPhoneOrEmail'] = async function (
  identifier: string
): Promise<IRegularCustomerDocument | null> {
  const clean = identifier.trim().toLowerCase();
  return this.findOne({
    isDeleted: { $ne: true },
    $or: [
      { phone: identifier.trim() },
      { email: clean },
    ],
  }).exec();
};

export const RegularCustomer = model<IRegularCustomerDocument, IRegularCustomerModel>(
  'RegularCustomer',
  RegularCustomerSchema,
  'regular_customers'
);

import { hashSync } from 'bcrypt';

export interface AuthUserProfile {
  companyName: string;
  registrationNumber: string;
  sector: string;
  website: string;
  firstName: string;
  lastName: string;
  phone: string;
  preferredChannel: 'national' | 'export' | 'institutional';
  language: 'fr' | 'ar' | 'en';
  currency: 'DZD' | 'EUR' | 'USD';
  twoFactorEnabled: boolean;
  notifications: {
    orderConfirmations: boolean;
    shipments: boolean;
    newAvailability: boolean;
    offers: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  userType: 'buyer';
  profile: AuthUserProfile;
}

export const authUsersSeed: AuthUser[] = [
  {
    id: 'buyer-001',
    email: 'buyer@ba33.dz',
    passwordHash: hashSync('Buyer@2026!', 10),
    fullName: 'Noura Benkhelifa',
    userType: 'buyer',
    profile: {
      companyName: 'Noura Fibres',
      registrationNumber: '001612345678900',
      sector: 'Textile technique',
      website: 'https://nourafibres.dz',
      firstName: 'Noura',
      lastName: 'Benkhelifa',
      phone: '+213 555 22 11 90',
      preferredChannel: 'export',
      language: 'fr',
      currency: 'DZD',
      twoFactorEnabled: true,
      notifications: {
        orderConfirmations: true,
        shipments: true,
        newAvailability: false,
        offers: false,
      },
    },
  },
];

import { Injectable } from '@angular/core';
import { MD5, SHA256, SHA1, SHA512 } from 'crypto-js';

export interface ArraySettings {
  type: 'number' | 'string' | 'boolean' | 'mixed';
  minElements: number;
  maxElements: number;
  unique: boolean;
}

export interface NumberSettings {
  min: number;
  max: number;
  integer: boolean;
  precision: number;
}

export interface ObjectSettings {
  preset: 'user' | 'product' | 'transaction';
}

export interface UuidSettings {
  casing: 'lower' | 'upper';
  hyphens: boolean;
}

export interface PasswordSettings {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface HashSettings {
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  casing: 'lower' | 'upper';
}

@Injectable({
  providedIn: 'root',
})
export class RandomGeneratorService {
  private firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Robin', 'Jamie', 'Skyler', 'Kim', 'Pat', 'Sam', 'Chris', 'Drew'];
  private lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'];
  private domains = ['example.com', 'test.com', 'mail.com', 'demo.org', 'sandbox.dev', 'company.com'];
  private roles = ['Admin', 'Editor', 'Subscriber', 'Moderator', 'Collaborator'];
  private categories = ['Electronics', 'Apparel', 'Home & Living', 'Office Supplies', 'Fitness', 'Automotive'];
  private productAdjectives = ['Smart', 'Ergonomic', 'Eco-Friendly', 'Heavy-Duty', 'Wireless', 'Compact', 'Pro', 'Ultra', 'Sleek'];
  private productNouns = ['Keyboard', 'Hub', 'Stand', 'Desk Lamp', 'Backpack', 'Charger', 'Bottle', 'Planner', 'Organizer'];
  private currencies = ['USD', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'];
  private statuses = ['completed', 'pending', 'processing', 'failed', 'refunded'];

  // Helper: Get random item from list
  private randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Helper: Get random int
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a random array and formats it as a string.
   */
  generateArray(settings: ArraySettings): string {
    const size = this.randomInt(settings.minElements, settings.maxElements);
    const result: (number | string | boolean)[] = [];
    const maxAttempts = size * 5; // Prevent infinite loop in unique generation
    let attempts = 0;

    while (result.length < size && attempts < maxAttempts) {
      attempts++;
      let val: number | string | boolean;

      const type = settings.type === 'mixed'
        ? this.randomItem<ArraySettings['type']>(['number', 'string', 'boolean'])
        : settings.type;

      if (type === 'number') {
        val = this.randomInt(1, 100);
      } else if (type === 'boolean') {
        val = Math.random() >= 0.5;
      } else {
        // String
        val = this.randomItem([...this.firstNames, ...this.productAdjectives, ...this.productNouns]);
      }

      if (settings.unique && result.includes(val)) {
        continue;
      }
      result.push(val);
    }

    return JSON.stringify(result);
  }

  /**
   * Generates a random number based on bounds and precision.
   */
  generateNumber(settings: NumberSettings): number {
    if (settings.integer) {
      return this.randomInt(settings.min, settings.max);
    } else {
      const val = Math.random() * (settings.max - settings.min) + settings.min;
      return parseFloat(val.toFixed(settings.precision));
    }
  }

  /**
   * Generates a structured JSON object as a string.
   */
  generateObject(settings: ObjectSettings): string {
    let obj: any = {};

    if (settings.preset === 'user') {
      const first = this.randomItem(this.firstNames);
      const last = this.randomItem(this.lastNames);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}@${this.randomItem(this.domains)}`;
      
      obj = {
        id: this.generateUUID({ casing: 'lower', hyphens: true }),
        name: `${first} ${last}`,
        email: email,
        role: this.randomItem(this.roles),
        status: this.randomItem(['Active', 'Inactive', 'Suspended']),
        createdAt: new Date(Date.now() - this.randomInt(0, 10000000000)).toISOString(),
      };
    } else if (settings.preset === 'product') {
      obj = {
        sku: `PROD-${this.randomInt(1000, 9999)}-${this.randomInt(100, 999)}`,
        name: `${this.randomItem(this.productAdjectives)} ${this.randomItem(this.productNouns)}`,
        price: parseFloat((Math.random() * 200 + 5).toFixed(2)),
        category: this.randomItem(this.categories),
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        inStock: Math.random() > 0.15,
      };
    } else {
      // Transaction
      obj = {
        transactionId: `TXN-${this.randomInt(10000000, 99999999)}`,
        amount: parseFloat((Math.random() * 950 + 10).toFixed(2)),
        currency: this.randomItem(this.currencies),
        status: this.randomItem(this.statuses),
        paymentMethod: this.randomItem(['Credit Card', 'PayPal', 'Apple Pay', 'Bank Transfer']),
        timestamp: new Date().toISOString(),
      };
    }

    return JSON.stringify(obj, null, 2);
  }

  /**
   * Generates a v4 UUID.
   */
  generateUUID(settings: UuidSettings): string {
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    if (!settings.hyphens) {
      uuid = uuid.replace(/-/g, '');
    }

    return settings.casing === 'upper' ? uuid.toUpperCase() : uuid.toLowerCase();
  }

  /**
   * Generates a secure random password.
   */
  generatePassword(settings: PasswordSettings): string {
    const lowercasePool = 'abcdefghijklmnopqrstuvwxyz';
    const uppercasePool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbersPool = '0123456789';
    const symbolsPool = '!@#$%^&*()_+~|}{[]:;?><,./-=';
    const ambiguousChars = /[0O1lI]/g;

    let combinedPool = '';
    const guaranteedChars: string[] = [];

    if (settings.lowercase) {
      let pool = lowercasePool;
      if (settings.excludeAmbiguous) {
        pool = pool.replace(ambiguousChars, '');
      }
      if (pool.length > 0) {
        combinedPool += pool;
        guaranteedChars.push(this.randomItem(pool.split('')));
      }
    }
    if (settings.uppercase) {
      let pool = uppercasePool;
      if (settings.excludeAmbiguous) {
        pool = pool.replace(ambiguousChars, '');
      }
      if (pool.length > 0) {
        combinedPool += pool;
        guaranteedChars.push(this.randomItem(pool.split('')));
      }
    }
    if (settings.numbers) {
      let pool = numbersPool;
      if (settings.excludeAmbiguous) {
        pool = pool.replace(ambiguousChars, '');
      }
      if (pool.length > 0) {
        combinedPool += pool;
        guaranteedChars.push(this.randomItem(pool.split('')));
      }
    }
    if (settings.symbols) {
      let pool = symbolsPool;
      if (settings.excludeAmbiguous) {
        pool = pool.replace(ambiguousChars, '');
      }
      if (pool.length > 0) {
        combinedPool += pool;
        guaranteedChars.push(this.randomItem(pool.split('')));
      }
    }

    // Default fall-back pool if nothing is selected
    if (combinedPool.length === 0) {
      combinedPool = lowercasePool + numbersPool;
    }

    const passwordChars: string[] = [];
    const targetLength = Math.max(settings.length, guaranteedChars.length);

    // Add guaranteed characters first to ensure complexity constraint
    passwordChars.push(...guaranteedChars);

    // Fill the rest with random characters from the combined pool
    while (passwordChars.length < targetLength) {
      passwordChars.push(this.randomItem(combinedPool.split('')));
    }

    // Shuffle the characters to mix the guaranteed ones
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.join('');
  }

  /**
   * Generates a cryptographic hash and the seed used.
   */
  generateHash(settings: HashSettings): { seed: string; hash: string } {
    // Generate a random plain text seed
    const seedWord = this.randomItem([...this.firstNames, ...this.productAdjectives, ...this.productNouns]);
    const seed = `${seedWord}-${this.randomInt(100, 999)}`;
    let hash = '';

    switch (settings.algorithm) {
      case 'md5':
        hash = MD5(seed).toString();
        break;
      case 'sha1':
        hash = SHA1(seed).toString();
        break;
      case 'sha512':
        hash = SHA512(seed).toString();
        break;
      case 'sha256':
      default:
        hash = SHA256(seed).toString();
        break;
    }

    if (settings.casing === 'upper') {
      hash = hash.toUpperCase();
    } else {
      hash = hash.toLowerCase();
    }

    return { seed, hash };
  }
}

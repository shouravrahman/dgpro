import crypto from 'crypto';

export class DataEncryption {
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly KEY_LENGTH = 32; // 256 bits
    private static readonly IV_LENGTH = 16; // 128 bits
    private static readonly TAG_LENGTH = 16; // 128 bits
    private static readonly SALT_LENGTH = 32; // 256 bits

    /**
     * Get encryption key from environment or generate one
     */
    private static getEncryptionKey(): Buffer {
        const key = process.env.ENCRYPTION_KEY;
        if (!key) {
            throw new Error('ENCRYPTION_KEY environment variable is required');
        }

        // If key is hex string, convert to buffer
        if (key.length === 64) {
            return Buffer.from(key, 'hex');
        }

        // Otherwise, derive key from string using PBKDF2
        const salt = Buffer.from(process.env.ENCRYPTION_SALT || 'default-salt', 'utf8');
        return crypto.pbkdf2Sync(key, salt, 100000, this.KEY_LENGTH, 'sha256');
    }

    /**
     * Encrypt sensitive data
     */
    static encrypt(plaintext: string): string {
        try {
            const key = this.getEncryptionKey();
            const iv = crypto.randomBytes(this.IV_LENGTH);

            const cipher = crypto.createCipher(this.ALGORITHM, key);
            cipher.setAAD(Buffer.from('additional-data')); // Additional authenticated data

            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const tag = cipher.getAuthTag();

            // Combine IV, tag, and encrypted data
            const result = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
            return result;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt sensitive data
     */
    static decrypt(encryptedData: string): string {
        try {
            const key = this.getEncryptionKey();
            const parts = encryptedData.split(':');

            if (parts.length !== 3) {
                throw new Error('Invalid encrypted data format');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const tag = Buffer.from(parts[1], 'hex');
            const encrypted = parts[2];

            const decipher = crypto.createDecipher(this.ALGORITHM, key);
            decipher.setAAD(Buffer.from('additional-data'));
            decipher.setAuthTag(tag);

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Hash passwords securely
     */
    static async hashPassword(password: string): Promise<string> {
        const salt = crypto.randomBytes(this.SALT_LENGTH);
        const hash = await new Promise<Buffer>((resolve, reject) => {
            crypto.pbkdf2(password, salt, 100000, 64, 'sha256', (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey);
            });
        });

        return salt.toString('hex') + ':' + hash.toString('hex');
    }

    /**
     * Verify password against hash
     */
    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            const parts = hashedPassword.split(':');
            if (parts.length !== 2) return false;

            const salt = Buffer.from(parts[0], 'hex');
            const originalHash = parts[1];

            const hash = await new Promise<Buffer>((resolve, reject) => {
                crypto.pbkdf2(password, salt, 100000, 64, 'sha256', (err, derivedKey) => {
                    if (err) reject(err);
                    else resolve(derivedKey);
                });
            });

            return hash.toString('hex') === originalHash;
        } catch (error) {
            console.error('Password verification error:', error);
            return false;
        }
    }

    /**
     * Generate secure random token
     */
    static generateSecureToken(length: number = 32): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Generate API key
     */
    static generateAPIKey(): string {
        const prefix = 'apc_'; // AI Product Creator prefix
        const randomPart = crypto.randomBytes(32).toString('hex');
        return prefix + randomPart;
    }

    /**
     * Hash API key for storage
     */
    static hashAPIKey(apiKey: string): string {
        return crypto.createHash('sha256').update(apiKey).digest('hex');
    }

    /**
     * Encrypt PII (Personally Identifiable Information)
     */
    static encryptPII(data: Record<string, any>): Record<string, any> {
        const piiFields = ['email', 'phone', 'address', 'name', 'ssn', 'credit_card'];
        const encrypted = { ...data };

        for (const field of piiFields) {
            if (encrypted[field] && typeof encrypted[field] === 'string') {
                encrypted[field] = this.encrypt(encrypted[field]);
            }
        }

        return encrypted;
    }

    /**
     * Decrypt PII
     */
    static decryptPII(data: Record<string, any>): Record<string, any> {
        const piiFields = ['email', 'phone', 'address', 'name', 'ssn', 'credit_card'];
        const decrypted = { ...data };

        for (const field of piiFields) {
            if (decrypted[field] && typeof decrypted[field] === 'string') {
                try {
                    decrypted[field] = this.decrypt(decrypted[field]);
                } catch (error) {
                    console.error(`Failed to decrypt field ${field}:`, error);
                    // Keep original value if decryption fails
                }
            }
        }

        return decrypted;
    }

    /**
     * Secure file encryption for uploads
     */
    static encryptFile(fileBuffer: Buffer): { encryptedData: Buffer; key: string; iv: string } {
        const key = crypto.randomBytes(this.KEY_LENGTH);
        const iv = crypto.randomBytes(this.IV_LENGTH);

        const cipher = crypto.createCipher(this.ALGORITHM, key);

        const encrypted = Buffer.concat([
            cipher.update(fileBuffer),
            cipher.final()
        ]);

        const tag = cipher.getAuthTag();
        const encryptedData = Buffer.concat([iv, tag, encrypted]);

        return {
            encryptedData,
            key: key.toString('hex'),
            iv: iv.toString('hex')
        };
    }

    /**
     * Decrypt file
     */
    static decryptFile(encryptedData: Buffer, keyHex: string): Buffer {
        const key = Buffer.from(keyHex, 'hex');
        const iv = encryptedData.subarray(0, this.IV_LENGTH);
        const tag = encryptedData.subarray(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
        const encrypted = encryptedData.subarray(this.IV_LENGTH + this.TAG_LENGTH);

        const decipher = crypto.createDecipher(this.ALGORITHM, key);
        decipher.setAuthTag(tag);

        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
    }

    /**
     * Generate HMAC signature for data integrity
     */
    static generateHMAC(data: string, secret?: string): string {
        const hmacSecret = secret || process.env.HMAC_SECRET || 'default-hmac-secret';
        return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
    }

    /**
     * Verify HMAC signature
     */
    static verifyHMAC(data: string, signature: string, secret?: string): boolean {
        const expectedSignature = this.generateHMAC(data, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }

    /**
     * Encrypt database fields that contain sensitive data
     */
    static encryptDatabaseField(value: string): string {
        if (!value) return value;
        return this.encrypt(value);
    }

    /**
     * Decrypt database fields
     */
    static decryptDatabaseField(encryptedValue: string): string {
        if (!encryptedValue) return encryptedValue;
        try {
            return this.decrypt(encryptedValue);
        } catch (error) {
            console.error('Failed to decrypt database field:', error);
            return encryptedValue; // Return original if decryption fails
        }
    }

    /**
     * Generate encryption key for new installations
     */
    static generateEncryptionKey(): string {
        return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
    }

    /**
     * Secure data masking for logs
     */
    static maskSensitiveData(data: any): unknown {
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        const sensitiveFields = [
            'password', 'token', 'secret', 'key', 'email', 'phone',
            'ssn', 'credit_card', 'api_key', 'access_token'
        ];

        const masked = Array.isArray(data) ? [...data] : { ...data };

        for (const key in masked) {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                if (typeof masked[key] === 'string' && masked[key].length > 4) {
                    masked[key] = masked[key].substring(0, 4) + '*'.repeat(masked[key].length - 4);
                } else {
                    masked[key] = '***';
                }
            } else if (typeof masked[key] === 'object') {
                masked[key] = this.maskSensitiveData(masked[key]);
            }
        }

        return masked;
    }
}
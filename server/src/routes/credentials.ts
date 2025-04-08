import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { db } from '../db/client';
import { credentials } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars!!';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

interface CredentialRequest {
  name: string;
  value: string;
  nodeId: string;
  canvasId: string;
}

interface QueryParams {
  nodeId: string;
  canvasId: string;
}

async function encrypt(text: string): Promise<string> {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

async function decrypt(text: string): Promise<string> {
  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }

    const [ivHex, encryptedHex] = parts;
    if (!ivHex || !encryptedHex) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt value');
  }
}

const postHandler = async (req: Request<{}, any, CredentialRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, value, nodeId, canvasId } = req.body;
    
    if (!name || !value || !nodeId || !canvasId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Encrypt the credential value
    const encryptedValue = await encrypt(value);

    // Store in database
    const result = await db.insert(credentials).values({
      name,
      value: encryptedValue,
      nodeId,
      canvasId
    }).returning();

    const credential = result[0];
    if (!credential) {
      throw new Error('Failed to insert credential');
    }

    res.json({
      id: credential.id,
      name: credential.name,
      nodeId: credential.nodeId,
      canvasId: credential.canvasId
    });
  } catch (error) {
    next(error);
  }
};

const getHandler = async (req: Request<{}, any, any, QueryParams>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nodeId, canvasId } = req.query;
    
    if (!nodeId || !canvasId) {
      res.status(400).json({ error: 'Missing required query parameters' });
      return;
    }

    // Fetch credentials
    const storedCredentials = await db.select()
      .from(credentials)
      .where(
        and(
          eq(credentials.nodeId, nodeId),
          eq(credentials.canvasId, canvasId)
        )
      )
      .execute();

    // Decrypt values before sending
    const decryptedCredentials = await Promise.all(
      storedCredentials.map(async (cred) => ({
        id: cred.id,
        name: cred.name,
        nodeId: cred.nodeId,
        canvasId: cred.canvasId,
        value: await decrypt(cred.value)
      }))
    );

    res.json(decryptedCredentials);
  } catch (error) {
    next(error);
  }
};

router.post('/', postHandler);
router.get('/', getHandler);

export default router; 
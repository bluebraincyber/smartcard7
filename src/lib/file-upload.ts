import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type UploadedFile = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

export async function handleFileUpload(
  req: NextApiRequest,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: number = 5 * 1024 * 1024 // 5MB
): Promise<{ file: UploadedFile; fileName: string }> {
  if (req.method !== 'POST') {
    throw new Error('Method not allowed');
  }

  // Verify authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Check content-type
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Invalid content type. Expected multipart/form-data');
  }

  // Parse form data
  const formData = await new Promise<{ file: UploadedFile }>((resolve, reject) => {
    const formData: any = {};
    const chunks: Buffer[] = [];
    let file: UploadedFile | null = null;

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const boundary = contentType.split('boundary=')[1];
      const parts = buffer.toString().split(`--${boundary}`);

      for (const part of parts) {
        if (part.includes('Content-Disposition: form-data;')) {
          const match = part.match(/name="([^"]+)"/);
          if (match && match[1] === 'file') {
            const content = part.split('\r\n\r\n').slice(1).join('\r\n\r\n');
            const headers = part.split('\r\n\r\n')[0];
            const filenameMatch = headers.match(/filename="([^"]+)"/);
            const contentTypeMatch = headers.match(/Content-Type: ([^\r\n]+)/);
            
            if (!filenameMatch || !contentTypeMatch) continue;
            
            const originalname = filenameMatch[1];
            const mimetype = contentTypeMatch[1].trim();
            
            if (!allowedTypes.includes(mimetype)) {
              reject(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`));
              return;
            }
            
            const fileBuffer = Buffer.from(content, 'binary');
            
            if (fileBuffer.length > maxSize) {
              reject(new Error(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`));
              return;
            }
            
            file = {
              fieldname: 'file',
              originalname,
              mimetype,
              buffer: fileBuffer,
              size: fileBuffer.length
            };
            break;
          }
        }
      }

      if (!file) {
        reject(new Error('No file uploaded'));
        return;
      }

      resolve({ file });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });

  // Generate unique filename
  const ext = path.extname(formData.file.originalname).toLowerCase();
  const fileName = `${uuidv4()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  const filePath = path.join(uploadDir, fileName);

  // Ensure upload directory exists
  try {
    await fs.access(uploadDir);
  } catch (err) {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Save file
  await fs.writeFile(filePath, formData.file.buffer);

  return {
    file: formData.file,
    fileName
  };
}

export function getPublicUrl(fileName: string): string {
  return `/uploads/${fileName}`;
}

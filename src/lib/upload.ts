import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type SavedFile = { url: string; filepath: string; filename: string };

export async function ensureUploadsDir() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function saveFormFile(formData: FormData, field = "file"): Promise<SavedFile> {
  console.log('Iniciando saveFormFile para o campo:', field);
  
  const file = formData.get(field) as File | null;
  console.log('Arquivo recebido no formData:', file ? 
    { name: file.name, type: file.type, size: file.size } : 'null');
  
  if (!file) throw new Error("Arquivo não enviado.");
  
  console.log('Verificando tipo do arquivo:', file.type);
  if (!ALLOWED_TYPES.has(file.type)) {
    console.error('Tipo de arquivo não permitido:', file.type);
    throw new Error("Formato inválido. Use JPG, PNG ou WebP.");
  }
  
  console.log('Verificando tamanho do arquivo:', file.size, 'bytes');
  if (file.size > MAX_SIZE) {
    console.error('Arquivo muito grande:', file.size, 'bytes (limite:', MAX_SIZE, 'bytes)');
    throw new Error("A imagem deve ter no máximo 5MB.");
  }

  console.log('Lendo conteúdo do arquivo...');
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  console.log('Conteúdo do arquivo lido, tamanho do buffer:', buffer.length, 'bytes');

  const ext = mimeToExt(file.type);
  console.log('Extensão do arquivo:', ext);
  
  const hash = crypto.createHash("sha1").update(buffer).digest("hex").slice(0, 12);
  const filename = `${Date.now()}_${hash}${ext}`;
  console.log('Nome do arquivo gerado:', filename);

  console.log('Garantindo que o diretório de uploads existe...');
  const uploadDir = await ensureUploadsDir();
  console.log('Diretório de uploads:', uploadDir);
  
  const filepath = path.join(uploadDir, filename);
  console.log('Caminho completo do arquivo:', filepath);
  
  console.log('Escrevendo arquivo no disco...');
  await writeFile(filepath, buffer);
  console.log('Arquivo salvo com sucesso em:', filepath);

  const url = `/uploads/${filename}`;
  console.log('URL de retorno:', url);
  
  return { url, filepath, filename };
}

function mimeToExt(mime: string): ".jpg" | ".png" | ".webp" {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  throw new Error("Tipo de arquivo não suportado.");
}

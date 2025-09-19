import { NextResponse } from "next/server";
import { saveFormFile } from "@/lib/upload";
import pool from "@/lib/db";  // ✅ CORREÇÃO: Incluir acesso ao banco

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Validar ID da loja
    const storeId = params.id;
    if (!storeId) {
      return NextResponse.json({ error: "ID da loja não fornecido" }, { status: 400 });
    }

    // Processar upload do arquivo
    console.log('Processando upload da foto de perfil...');
    const formData = await req.formData();
    const saved = await saveFormFile(formData, "file");
    console.log('Foto de perfil salva com sucesso:', saved);

    // ✅ CORREÇÃO: Salvar URL no banco de dados
    try {
      console.log('Atualizando URL da foto de perfil no banco de dados...');
      const updateQuery = 'UPDATE stores SET profile_image = $1 WHERE id = $2';
      const result = await pool.query(updateQuery, [saved.url, storeId]);
      
      if (result.rowCount === 0) {
        console.warn('Nenhuma linha foi atualizada - loja pode não existir');
      } else {
        console.log('URL da foto de perfil atualizada no banco com sucesso!');
      }
    } catch (dbError) {
      console.error('Erro ao atualizar banco de dados:', dbError);
      // Não falhar o upload por erro de banco, apenas logar
    }

    // Retornar a URL da imagem
    return NextResponse.json({ 
      url: saved.url,
      success: true,
      message: 'Foto de perfil atualizada com sucesso'
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (err) {
    console.error("Erro no upload da foto de perfil:", err);
    const message = err instanceof Error ? err.message : "Falha no upload da foto de perfil";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Configuração CORS para requisições pré-voo
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

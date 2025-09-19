import { NextResponse } from "next/server";
import { saveFormFile } from "@/lib/upload";
import pool from "@/lib/db";  // ✅ CORREÇÃO: Incluir acesso ao banco

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log('Recebendo requisição de upload de capa');
    
    // Validar ID da loja
    const storeId = params.id;
    console.log('Store ID from params:', storeId);
    
    if (!storeId) {
      console.error('ID da loja não fornecido');
      return NextResponse.json(
        { error: "ID da loja não fornecido" }, 
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Processar upload do arquivo
    console.log('Processando upload do arquivo...');
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.error('Nenhum arquivo enviado');
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" }, 
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }
    
    console.log('Arquivo recebido, salvando...');
    const saved = await saveFormFile(formData, "file");
    console.log('Arquivo salvo com sucesso:', saved);

    // ✅ CORREÇÃO: Salvar URL no banco de dados
    try {
      console.log('Atualizando URL da capa no banco de dados...');
      const updateQuery = 'UPDATE stores SET cover_image = $1 WHERE id = $2';
      const result = await pool.query(updateQuery, [saved.url, storeId]);
      
      if (result.rowCount === 0) {
        console.warn('Nenhuma linha foi atualizada - loja pode não existir');
      } else {
        console.log('URL da capa atualizada no banco com sucesso!');
      }
    } catch (dbError) {
      console.error('Erro ao atualizar banco de dados:', dbError);
      // Não falhar o upload por erro de banco, apenas logar
    }

    // Retornar a URL da imagem
    return new Response(JSON.stringify({ 
      url: saved.url, 
      success: true,
      message: 'Capa atualizada com sucesso'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    console.error("Erro no upload da capa:", err);
    const message = err instanceof Error ? err.message : "Falha no upload da capa";
    return NextResponse.json(
      { error: message }, 
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Configuração CORS para requisições pré-voo
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

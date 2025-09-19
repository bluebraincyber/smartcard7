'use client';

import * as React from 'react';
import Image from 'next/image';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ CORREÇÃO: Sistema de notificação melhorado
const toast = {
  success: (message: string) => {
    console.log('✅ Sucesso:', message);
    // Notificação não-intrusiva - será substituída por sistema de toast adequado
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-[9999] bg-success text-success-foreground px-4 py-2 rounded-lg shadow-lg transition-all duration-300';
      notification.textContent = `✅ ${message}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  },
  error: (message: string) => {
    console.error('❌ Erro:', message);
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-[9999] bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg transition-all duration-300';
      notification.textContent = `❌ ${message}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }
  },
};

type ImageType = 'cover' | 'profile';

interface EditableImageCardProps {
  type: ImageType;
  currentImage?: string | null;
  storeId: string | number;  // ✅ CORREÇÃO: Aceitar string ou number
  onUploadSuccess?: (imageUrl: string) => void;
  className?: string;
  onError?: (error: string) => void;
}

export function EditableImageCard({
  type,
  currentImage,
  storeId,
  onUploadSuccess,
  className,
  onError,
}: EditableImageCardProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isCover = type === 'cover';
  const defaultImage = isCover ? '/images/placeholder-cover.svg' : '/images/placeholder-logo.svg';
  const displayImage = preview || currentImage || defaultImage;
  const aspectRatio = isCover ? 'aspect-[3/1]' : 'aspect-square';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input de arquivo alterado');
    const file = e.target.files?.[0];
    console.log('Arquivo selecionado:', file ? file.name : 'nenhum arquivo');
    if (!file) {
      console.log('Nenhum arquivo selecionado');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de arquivo inválido. Use JPG, PNG ou WebP.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      handleUpload(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    console.log('🔄 Iniciando upload de imagem do tipo:', type);
    console.log('📦 StoreId recebido:', storeId);

    try {
      // ✅ CORREÇÃO: Conversão segura para string e validação
      console.log('🔍 Tipo do storeId:', typeof storeId, 'Valor:', storeId);
      
      if (!storeId) {
        throw new Error('ID da loja não fornecido');
      }

      // Converter para string de forma segura
      let storeIdToUse = String(storeId).trim();
      
      if (storeIdToUse === '' || storeIdToUse === 'undefined' || storeIdToUse === 'null') {
        throw new Error('ID da loja inválido');
      }
      
      // Se contém caracteres não-numéricos, pode ser slug - extrair ID
      if (storeIdToUse.includes('/') || storeIdToUse.includes('://')) {
        const parts = storeIdToUse.split('/').filter(Boolean);
        storeIdToUse = parts[parts.length - 1];
        console.log('🔧 ID extraído:', storeIdToUse);
      }

      const endpoint = `/api/stores/${storeIdToUse}/upload-${type}`;
      console.log('🎯 Endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin', // ✅ CORREÇÃO: Incluir cookies de sessão
      });

      console.log('📡 Resposta:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Falha ao fazer upload da ${type === 'cover' ? 'capa' : 'foto de perfil'}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Erro do servidor:', errorData);
        } catch (e) {
          console.error('❌ Erro ao analisar resposta:', e);
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('URL da imagem não retornada pelo servidor');
      }
      
      console.log('✅ Upload concluído! URL:', data.url);
      
      onUploadSuccess?.(data.url);
      toast.success(`${type === 'cover' ? 'Capa' : 'Foto de perfil'} atualizada com sucesso!`);
    } catch (error) {
      console.error('💥 Erro no upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao fazer upload';
      onError?.(errorMessage);
      toast.error(errorMessage);
      setPreview(null); // Limpar preview em caso de erro
    } finally {
      setIsUploading(false);
    }
  };


  // ✅ CORREÇÃO: Função melhorada para ativar input de arquivo
  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('👆 CLIQUE DETECTADO no EditableImageCard');
    console.log('Tipo:', type);
    console.log('StoreId:', storeId);
    console.log('Upload em andamento:', isUploading);
    
    if (isUploading) {
      console.log('⏳ Upload em andamento, clique ignorado');
      return;
    }
    
    console.log('🎨 Tentando abrir seletor de arquivo...');
    if (fileInputRef.current) {
      console.log('✅ Input encontrado, disparando clique');
      fileInputRef.current.click();
    } else {
      console.error('❌ Input de arquivo não encontrado!');
      toast.error('Erro interno: seletor de arquivo não encontrado');
    }
  };

  return (
    <div className={cn('group relative', className)}>
      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        onChange={handleImageChange}
        disabled={isUploading}
        id={`file-input-${type}`}
      />

      {/* Container clicável */}
      <div 
        className={cn(
          'relative w-full overflow-hidden cursor-pointer',
          isCover ? 'rounded-lg' : 'rounded-full',
          aspectRatio,
          isCover ? 'max-h-[300px] border-2 border-dashed border-border/50 bg-muted/30 hover:border-foreground/30' : 'h-24 w-24 border-4 border-background',
          isUploading && 'opacity-70',
          'group transition-colors duration-200'
        )}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && triggerFileInput(e as unknown as React.MouseEvent)}
      >
        <Image
          src={displayImage}
          alt={isCover ? 'Capa da loja' : 'Logo da loja'}
          fill
          className={cn(
            'object-cover transition-opacity duration-300',
            isUploading ? 'opacity-50' : 'opacity-100',
            'group-hover:opacity-80'
          )}
          sizes={isCover ? '100vw' : '96px'}
        />

        {/* ✅ CORREÇÃO: Overlay clicável */}
        <div 
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-200',
            isCover ? 'bg-gradient-to-t from-black/40 via-black/20 to-transparent' : 'bg-black/30',
            isCover ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            isUploading && 'opacity-100 bg-black/60',
            'flex-col gap-2 p-4 text-center'
            // ✅ REMOVIDO pointer-events-none para permitir clique
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-white mb-2" />
              <span className="text-white font-medium">Enviando...</span>
            </>
          ) : (
            <>
              <div className={cn(
                'p-2 rounded-full mb-2',
                isCover ? 'bg-background/80' : 'bg-background/90',
                'flex items-center justify-center',
                'transition-transform duration-200 group-hover:scale-110'
              )}>
                <Camera className={cn(
                  isCover ? 'h-6 w-6' : 'h-5 w-5',
                  'text-foreground'
                )} />
              </div>
              <span className="text-white font-medium text-sm sm:text-base">
                {isCover ? 'Alterar capa' : 'Alterar logo'}
              </span>
              <span className="text-white/80 text-xs mt-1">
                {isCover ? 'Clique para enviar uma nova imagem' : 'Clique para alterar'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

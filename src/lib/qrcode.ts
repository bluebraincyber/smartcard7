import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };

    const qrCodeDataURL = await QRCode.toDataURL(text, qrOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw new Error('Falha ao gerar QR Code');
  }
}

export async function generateStoreQRCode(
  slug: string,
  customOptions?: QRCodeOptions
): Promise<string> {
  const storeUrl = `https://${slug}.smartcard.app`;
  
  const defaultOptions: QRCodeOptions = {
    size: 256,
    margin: 2,
    color: {
      dark: '#1F2937',
      light: '#FFFFFF'
    }
  };

  const options = { ...defaultOptions, ...customOptions };
  return generateQRCode(storeUrl, options);
}

export function getQRCodeSVG(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };

    QRCode.toString(text, { type: 'svg', ...qrOptions }, (err, svg) => {
      if (err) {
        reject(err);
      } else {
        resolve(svg);
      }
    });
  });
}

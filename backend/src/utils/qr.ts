import QRCode from 'qrcode';
import { randomUUID } from 'crypto';

export async function generateQrPngDataUrl(payload: string) {
	return QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 320 });
}

export function createQrToken() {
	return randomUUID().replace(/-/g, '');
}

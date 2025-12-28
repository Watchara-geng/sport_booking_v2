import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

const target = process.env.PROMPTPAY_TARGET || '';
const fixedAmount = (process.env.PROMPTPAY_FIXED_AMOUNT || 'true').toLowerCase() === 'true';

export async function buildPromptPayQr(amount: number) {
  if (!target) {
    throw new Error('PROMPTPAY_TARGET is not set');
  }
  if (!(amount > 0)) {
    throw new Error('amount must be greater than 0');
  }

  const payload = fixedAmount ? generatePayload(target, { amount }) : generatePayload(target);
  const dataUrl = await QRCode.toDataURL(payload, { margin: 1, scale: 6 });
  return { payload, dataUrl };
}

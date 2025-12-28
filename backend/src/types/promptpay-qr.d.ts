// backend/src/types/promptpay-qr.d.ts
declare module 'promptpay-qr' {
  export default function generatePayload(
    mobileNumber: string,
    options?: { amount?: number }
  ): string;
}

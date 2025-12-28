export default function QRPreview({ dataUrl }: { dataUrl?: string | null }) {
  if (!dataUrl) return null;
  return (
    <div className="card p-4 mt-4 flex flex-col items-center">
      <h3 className="font-semibold mb-2">สแกนจ่าย PromptPay</h3>
      <img src={dataUrl} alt="PromptPay QR" className="w-64 h-64 object-contain rounded-xl border border-gray-200 dark:border-gray-800" />
      <p className="text-xs text-gray-500 mt-2">แสดง QR นี้ในแอปธนาคารเพื่อชำระเงิน</p>
    </div>
  );
}

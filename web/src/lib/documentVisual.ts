import {
  FileSpreadsheet,
  FileText,
  IdCard,
  Image as ImageIcon,
  LucideIcon,
  MessageCircle,
  Receipt,
  Smartphone,
} from 'lucide-react';

/** Pick an icon that matches the paper's kind or filename. */
export function documentVisual(doc: {
  name?: string;
  kind?: string;
  mime?: string;
}): { Icon: LucideIcon; tint: string } {
  const name = (doc.name || '').toLowerCase();
  const mime = doc.mime || '';
  if (mime.startsWith('image/') || /screen|photo|image|\.(png|jpg|jpeg|webp)$/.test(name)) {
    return { Icon: ImageIcon, tint: 'text-sky-600 dark:text-sky-400' };
  }
  if (doc.kind === 'CHAT' || /whatsapp|chat|conversation|telegram/.test(name)) {
    return { Icon: MessageCircle, tint: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (doc.kind === 'NOTICE' || /sms|notice|freeze|lien|hold/.test(name)) {
    return { Icon: Smartphone, tint: 'text-amber-600 dark:text-amber-400' };
  }
  if (doc.kind === 'STATEMENT' || /statement|passbook|ledger/.test(name)) {
    return { Icon: FileSpreadsheet, tint: 'text-teal-600 dark:text-teal-400' };
  }
  if (doc.kind === 'INVOICE' || /invoice|bill|receipt|tax/.test(name)) {
    return { Icon: Receipt, tint: 'text-violet-600 dark:text-violet-400' };
  }
  if (doc.kind === 'ID' || /aadhaar|pan|license|identity/.test(name)) {
    return { Icon: IdCard, tint: 'text-rose-600 dark:text-rose-400' };
  }
  return { Icon: FileText, tint: 'text-slate-600 dark:text-slate-300' };
}

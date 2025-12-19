import { Code, Copy, Download, FileText, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ScriptOutputProps {
  script: string;
  credentials: Array<{ username: string; password: string }>;
}

const ScriptOutput = ({ script, credentials }: ScriptOutputProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast.success('تم نسخ السكريبت بنجاح');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل نسخ السكريبت');
    }
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mikrotik-script-${Date.now()}.rsc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل السكريبت');
  };

  const downloadTxt = () => {
    const text = credentials
      .map((c) => `${c.username}\t${c.password}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credentials-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('تم تحميل الحسابات');
  };

  return (
    <div className="glass-card p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0 border-none pb-0">
          <Code className="w-5 h-5 text-primary" />
          السكريبت الناتج
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            disabled={!script}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            نسخ
          </button>
          <br>
          <button
            onClick={downloadScript}
            disabled={!script}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            تحميل .rsc
          </button>
          <button
            onClick={downloadTxt}
            disabled={credentials.length === 0}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            تحميل .txt
          </button>
        </div>
      </div>

      <textarea
        readOnly
        value={script}
        placeholder="سيظهر هنا سكريبت MikroTik بعد التوليد..."
        className="script-output"
      />
    </div>
  );
};

export default ScriptOutput;

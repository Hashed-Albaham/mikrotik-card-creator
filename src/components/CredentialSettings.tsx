import { Key, Hash, Link, Type, ListOrdered, Timer } from 'lucide-react';

interface CredentialSettingsProps {
  settings: {
    credentialType: string;
    credentialMatch: string;
    codeLength: number;
    accountCount: number;
    prefix: string;
    suffix: string;
    passSuffix: string;
    scriptDelay: number;
  };
  onChange: (field: string, value: string | number) => void;
}

const CredentialSettings = ({ settings, onChange }: CredentialSettingsProps) => {
  const showPassSuffix = settings.credentialMatch !== 'empty';

  return (
    <div className="glass-card p-6 fade-in">
      <h2 className="section-title">
        <Key className="w-5 h-5 text-primary" />
        إعدادات توليد الحسابات
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Credential Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Type className="w-4 h-4" />
            نوع الكود
          </label>
          <select
            value={settings.credentialType}
            onChange={(e) => onChange('credentialType', e.target.value)}
            className="select-field"
          >
            <option value="mixed">أرقام وحروف</option>
            <option value="numbers">أرقام فقط</option>
            <option value="letters">حروف فقط</option>
          </select>
        </div>

        {/* Credential Match */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Link className="w-4 h-4" />
            تطابق الاسم والسر
          </label>
          <select
            value={settings.credentialMatch}
            onChange={(e) => onChange('credentialMatch', e.target.value)}
            className="select-field"
          >
            <option value="different">مختلفة</option>
            <option value="same">متشابهة</option>
            <option value="empty">كلمة سر فارغة</option>
          </select>
        </div>

        {/* Code Length */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Hash className="w-4 h-4" />
            طول الكود
          </label>
          <input
            type="number"
            min={5}
            value={settings.codeLength}
            onChange={(e) => onChange('codeLength', parseInt(e.target.value) || 5)}
            className="input-field"
          />
        </div>

        {/* Account Count */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ListOrdered className="w-4 h-4" />
            عدد الحسابات
          </label>
          <input
            type="number"
            min={1}
            value={settings.accountCount}
            onChange={(e) => onChange('accountCount', parseInt(e.target.value) || 1)}
            className="input-field"
          />
        </div>

        {/* Prefix */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Type className="w-4 h-4" />
            البادئة
          </label>
          <input
            type="text"
            value={settings.prefix}
            onChange={(e) => onChange('prefix', e.target.value)}
            placeholder="مثال: user_"
            className="input-field"
          />
        </div>

        {/* Suffix */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Type className="w-4 h-4" />
            النهاية (اسم المستخدم)
          </label>
          <input
            type="text"
            value={settings.suffix}
            onChange={(e) => onChange('suffix', e.target.value)}
            placeholder="مثال: _end"
            className="input-field"
          />
        </div>

        {/* Password Suffix */}
        {showPassSuffix && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Key className="w-4 h-4" />
              النهاية (كلمة السر)
            </label>
            <input
              type="text"
              value={settings.passSuffix}
              onChange={(e) => onChange('passSuffix', e.target.value)}
              placeholder="مثال: _pass"
              className="input-field"
            />
          </div>
        )}

        {/* Script Delay */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Timer className="w-4 h-4" />
            تأخير السكريبت (ms)
          </label>
          <input
            type="number"
            min={0}
            value={settings.scriptDelay}
            onChange={(e) => onChange('scriptDelay', parseInt(e.target.value) || 0)}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default CredentialSettings;

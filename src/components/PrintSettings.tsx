import { Printer, Image, Columns, Rows2, Move, User, Lock, Hash, Calendar, Palette, Bold } from 'lucide-react';
import { NumberInput } from '@/components/ui/number-input';

interface PrintSettingsProps {
  settings: {
    columns: number;
    rows: number;
    boxSpacing: number;
    backgroundImage: string | null;
    printUsername: boolean;
    printPassword: boolean;
    useSerialNumber: boolean;
    useDatePrinting: boolean;
    usernameSize: number;
    usernameColor: string;
    usernameBold: boolean;
    usernamePositionX: number;
    usernamePositionY: number;
    passwordSize: number;
    passwordColor: string;
    passwordBold: boolean;
    passwordPositionX: number;
    passwordPositionY: number;
    serialStartNumber: number;
    serialNumberSize: number;
    serialColor: string;
    serialBold: boolean;
    serialPositionX: number;
    serialPositionY: number;
    dateSize: number;
    dateColor: string;
    dateBold: boolean;
    datePositionX: number;
    datePositionY: number;
  };
  onChange: (field: string, value: string | number | boolean) => void;
  onImageChange: (file: File | null) => void;
}

const PrintSettings = ({ settings, onChange, onImageChange }: PrintSettingsProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  return (
    <div className="glass-card p-6 fade-in">
      <h2 className="section-title">
        <Printer className="w-5 h-5 text-primary" />
        إعدادات PDF والطباعة
      </h2>

      {/* Basic Print Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Image className="w-4 h-4" />
            صورة الخلفية
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 file:cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Columns className="w-4 h-4" />
            الأعمدة
          </label>
          <NumberInput
            min={1}
            value={settings.columns}
            onChange={(val) => onChange('columns', val)}
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Rows2 className="w-4 h-4" />
            الصفوف
          </label>
          <NumberInput
            min={1}
            value={settings.rows}
            onChange={(val) => onChange('rows', val)}
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Move className="w-4 h-4" />
            المسافة بين الكروت (mm)
          </label>
          <NumberInput
            min={0}
            step={0.1}
            allowFloat
            value={settings.boxSpacing}
            onChange={(val) => onChange('boxSpacing', val)}
            className="input-field"
          />
        </div>
      </div>

      {/* Checkboxes Row */}
      <div className="flex flex-wrap gap-6 mt-6 p-4 bg-muted/30 rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.printUsername}
            onChange={(e) => onChange('printUsername', e.target.checked)}
            className="checkbox-custom"
          />
          <User className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">طباعة اسم المستخدم</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.printPassword}
            onChange={(e) => onChange('printPassword', e.target.checked)}
            className="checkbox-custom"
          />
          <Lock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">طباعة كلمة السر</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.useSerialNumber}
            onChange={(e) => onChange('useSerialNumber', e.target.checked)}
            className="checkbox-custom"
          />
          <Hash className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">طباعة رقم تسلسلي</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.useDatePrinting}
            onChange={(e) => onChange('useDatePrinting', e.target.checked)}
            className="checkbox-custom"
          />
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">طباعة التاريخ</span>
        </label>
      </div>

      {/* Username Settings */}
      {settings.printUsername && (
        <div className="mt-6 p-4 border border-border rounded-lg slide-in">
          <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
            <User className="w-4 h-4 text-primary" />
            إعدادات اسم المستخدم
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">حجم النص (pt)</label>
              <NumberInput
                min={1}
                step={0.1}
                allowFloat
                value={settings.usernameSize}
                onChange={(val) => onChange('usernameSize', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Palette className="w-3 h-3" />
                اللون
              </label>
              <input
                type="color"
                value={settings.usernameColor}
                onChange={(e) => onChange('usernameColor', e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border border-border"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={settings.usernameBold}
                onChange={(e) => onChange('usernameBold', e.target.checked)}
                className="checkbox-custom"
              />
              <Bold className="w-4 h-4" />
              <span className="text-sm">غامق</span>
            </label>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">أفقياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.usernamePositionX}
                onChange={(val) => onChange('usernamePositionX', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">عمودياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.usernamePositionY}
                onChange={(val) => onChange('usernamePositionY', val)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Password Settings */}
      {settings.printPassword && (
        <div className="mt-6 p-4 border border-border rounded-lg slide-in">
          <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
            <Lock className="w-4 h-4 text-primary" />
            إعدادات كلمة السر
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">حجم النص (pt)</label>
              <NumberInput
                min={1}
                step={0.1}
                allowFloat
                value={settings.passwordSize}
                onChange={(val) => onChange('passwordSize', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Palette className="w-3 h-3" />
                اللون
              </label>
              <input
                type="color"
                value={settings.passwordColor}
                onChange={(e) => onChange('passwordColor', e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border border-border"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={settings.passwordBold}
                onChange={(e) => onChange('passwordBold', e.target.checked)}
                className="checkbox-custom"
              />
              <Bold className="w-4 h-4" />
              <span className="text-sm">غامق</span>
            </label>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">أفقياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.passwordPositionX}
                onChange={(val) => onChange('passwordPositionX', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">عمودياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.passwordPositionY}
                onChange={(val) => onChange('passwordPositionY', val)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Serial Number Settings */}
      {settings.useSerialNumber && (
        <div className="mt-6 p-4 border border-border rounded-lg slide-in">
          <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
            <Hash className="w-4 h-4 text-primary" />
            إعدادات الرقم التسلسلي
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">يبدأ من</label>
              <NumberInput
                min={1}
                value={settings.serialStartNumber}
                onChange={(val) => onChange('serialStartNumber', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">حجم النص (pt)</label>
              <NumberInput
                min={1}
                step={0.1}
                allowFloat
                value={settings.serialNumberSize}
                onChange={(val) => onChange('serialNumberSize', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Palette className="w-3 h-3" />
                اللون
              </label>
              <input
                type="color"
                value={settings.serialColor}
                onChange={(e) => onChange('serialColor', e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border border-border"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={settings.serialBold}
                onChange={(e) => onChange('serialBold', e.target.checked)}
                className="checkbox-custom"
              />
              <Bold className="w-4 h-4" />
              <span className="text-sm">غامق</span>
            </label>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">أفقياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.serialPositionX}
                onChange={(val) => onChange('serialPositionX', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">عمودياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.serialPositionY}
                onChange={(val) => onChange('serialPositionY', val)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Date Settings */}
      {settings.useDatePrinting && (
        <div className="mt-6 p-4 border border-border rounded-lg slide-in">
          <h3 className="flex items-center gap-2 text-base font-semibold mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            إعدادات التاريخ
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">حجم النص (pt)</label>
              <NumberInput
                min={1}
                step={0.1}
                allowFloat
                value={settings.dateSize}
                onChange={(val) => onChange('dateSize', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Palette className="w-3 h-3" />
                اللون
              </label>
              <input
                type="color"
                value={settings.dateColor}
                onChange={(e) => onChange('dateColor', e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border border-border"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={settings.dateBold}
                onChange={(e) => onChange('dateBold', e.target.checked)}
                className="checkbox-custom"
              />
              <Bold className="w-4 h-4" />
              <span className="text-sm">غامق</span>
            </label>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">أفقياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.datePositionX}
                onChange={(val) => onChange('datePositionX', val)}
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">عمودياً (mm)</label>
              <NumberInput
                step={0.1}
                allowFloat
                value={settings.datePositionY}
                onChange={(val) => onChange('datePositionY', val)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintSettings;
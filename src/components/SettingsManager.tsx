import { Save, FolderOpen, Trash2, Plus, Network, FileSliders } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SettingsManagerProps {
  onLoadSettings: (settings: Record<string, unknown>) => void;
  getCurrentSettings: () => Record<string, unknown>;
}

interface ProfileData {
  [templateName: string]: Record<string, unknown>;
}

interface AllProfiles {
  [profileName: string]: ProfileData;
}

const STORAGE_KEY = 'hashtik-profiles';

const SettingsManager = ({ onLoadSettings, getCurrentSettings }: SettingsManagerProps) => {
  const [profiles, setProfiles] = useState<AllProfiles>({});
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProfiles(JSON.parse(stored));
      } catch {
        console.error('Error loading profiles');
      }
    }
  }, []);

  const saveProfiles = (newProfiles: AllProfiles) => {
    setProfiles(newProfiles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfiles));
  };

  const addProfile = () => {
    const name = prompt('أدخل اسم الشبكة الجديدة:');
    if (!name?.trim()) return;
    if (profiles[name]) {
      toast.error('هذا الاسم موجود بالفعل');
      return;
    }
    const newProfiles = { ...profiles, [name]: {} };
    saveProfiles(newProfiles);
    setSelectedProfile(name);
    setSelectedTemplate('');
    toast.success(`تمت إضافة الشبكة: ${name}`);
  };

  const deleteProfile = () => {
    if (!selectedProfile) return;
    if (!confirm(`هل أنت متأكد من حذف الشبكة "${selectedProfile}"؟`)) return;
    const newProfiles = { ...profiles };
    delete newProfiles[selectedProfile];
    saveProfiles(newProfiles);
    setSelectedProfile('');
    setSelectedTemplate('');
    toast.success('تم حذف الشبكة');
  };

  const saveTemplate = () => {
    if (!selectedProfile) {
      toast.error('الرجاء اختيار شبكة أولاً');
      return;
    }
    const name = prompt('أدخل اسمًا لهذه الفئة:', selectedTemplate || '');
    if (!name?.trim()) return;
    const newProfiles = { ...profiles };
    newProfiles[selectedProfile][name] = getCurrentSettings();
    saveProfiles(newProfiles);
    setSelectedTemplate(name);
    toast.success(`تم حفظ الإعدادات: ${name}`);
  };

  const loadTemplate = () => {
    if (!selectedProfile || !selectedTemplate) {
      toast.error('الرجاء اختيار شبكة وفئة');
      return;
    }
    const settings = profiles[selectedProfile]?.[selectedTemplate];
    if (settings) {
      onLoadSettings(settings);
      toast.success('تم تحميل الإعدادات');
    }
  };

  const deleteTemplate = () => {
    if (!selectedProfile || !selectedTemplate) return;
    if (!confirm(`هل أنت متأكد من حذف الفئة "${selectedTemplate}"؟`)) return;
    const newProfiles = { ...profiles };
    delete newProfiles[selectedProfile][selectedTemplate];
    saveProfiles(newProfiles);
    setSelectedTemplate('');
    toast.success('تم حذف الفئة');
  };

  const profileNames = Object.keys(profiles);
  const templateNames = selectedProfile ? Object.keys(profiles[selectedProfile] || {}) : [];

  return (
    <div className="glass-card p-6 fade-in">
      <h2 className="section-title">
        <Save className="w-5 h-5 text-primary" />
        إدارة الإعدادات المحفوظة
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Profile Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            <span className="font-semibold">الشبكات</span>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedProfile}
              onChange={(e) => {
                setSelectedProfile(e.target.value);
                setSelectedTemplate('');
              }}
              className="select-field flex-1"
            >
              <option value="">اختر شبكة...</option>
              {profileNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button onClick={addProfile} className="btn-primary p-3">
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={deleteProfile}
              disabled={!selectedProfile}
              className="btn-danger p-3 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileSliders className="w-5 h-5 text-primary" />
            <span className="font-semibold">فئات الإعدادات</span>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="select-field flex-1"
              disabled={!selectedProfile}
            >
              <option value="">اختر فئة...</option>
              {templateNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              onClick={saveTemplate}
              disabled={!selectedProfile}
              className="btn-primary p-3 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={loadTemplate}
              disabled={!selectedTemplate}
              className="btn-success p-3 disabled:opacity-50"
            >
              <FolderOpen className="w-5 h-5" />
            </button>
            <button
              onClick={deleteTemplate}
              disabled={!selectedTemplate}
              className="btn-warning p-3 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;

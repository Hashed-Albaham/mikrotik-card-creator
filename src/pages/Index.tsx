import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Wand2, FileOutput, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import MikrotikSettings from '@/components/MikrotikSettings';
import CredentialSettings from '@/components/CredentialSettings';
import PrintSettings from '@/components/PrintSettings';
import CardPreview from '@/components/CardPreview';
import ScriptOutput from '@/components/ScriptOutput';
import SettingsManager from '@/components/SettingsManager';
import MikrotikConnection from '@/components/MikrotikConnection';
import { generateCredentials, GeneratedCredential, MikrotikSettings as MikrotikSettingsType, CredentialSettings as CredentialSettingsType } from '@/lib/generator';
import { generatePDF, PrintSettings as PrintSettingsType } from '@/lib/pdfGenerator';

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [credentials, setCredentials] = useState<GeneratedCredential[]>([]);
  const [script, setScript] = useState('');
  const [existingUsers, setExistingUsers] = useState<string[]>([]);

  const handleExistingUsersLoaded = (users: string[]) => {
    setExistingUsers(users);
  };

  // Mikrotik Settings
  const [mikrotikSettings, setMikrotikSettings] = useState<MikrotikSettingsType>({
    userType: 'usermanager',
    mikrotikVersion: 'v7',
    customer: 'admin',
    hotspotServer: 'all',
    profile: 'default',
    hotspotLimit: '',
    hotspotDataLimit: '',
    comment: '',
    location: '',
  });

  // Credential Settings
  const [credentialSettings, setCredentialSettings] = useState<CredentialSettingsType>({
    credentialType: 'mixed',
    credentialMatch: 'different',
    codeLength: 8,
    accountCount: 50,
    prefix: '',
    suffix: '',
    passSuffix: '',
    scriptDelay: 100,
  });

  // Print Settings
  const [printSettings, setPrintSettings] = useState<PrintSettingsType>({
    columns: 4,
    rows: 18,
    boxSpacing: 2,
    backgroundImage: null,
    printUsername: true,
    printPassword: true,
    useSerialNumber: false,
    useDatePrinting: false,
    usernameSize: 8,
    usernameColor: '#000000',
    usernameBold: false,
    usernamePositionX: 5,
    usernamePositionY: 5,
    passwordSize: 8,
    passwordColor: '#000000',
    passwordBold: false,
    passwordPositionX: 5,
    passwordPositionY: 10,
    serialStartNumber: 1,
    serialNumberSize: 6,
    serialColor: '#000000',
    serialBold: false,
    serialPositionX: 20,
    serialPositionY: 5,
    dateSize: 8,
    dateColor: '#000000',
    dateBold: false,
    datePositionX: 30,
    datePositionY: 12,
  });

  const handleMikrotikChange = (field: string, value: string) => {
    setMikrotikSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleCredentialChange = (field: string, value: string | number) => {
    setCredentialSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePrintChange = (field: string, value: string | number | boolean) => {
    setPrintSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrintSettings((prev) => ({
          ...prev,
          backgroundImage: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPrintSettings((prev) => ({ ...prev, backgroundImage: null }));
    }
  };

  const handleGenerate = () => {
    if (!mikrotikSettings.profile.trim()) {
      toast.error('حقل البروفايل مطلوب');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const result = generateCredentials(
          mikrotikSettings,
          credentialSettings,
          printSettings.useSerialNumber,
          printSettings.serialStartNumber,
          existingUsers
        );
        
        setCredentials(result.credentials);
        setScript(result.script);
        toast.success(`تم توليد ${result.credentials.length} حساب بنجاح`);
      } catch (error) {
        toast.error('حدث خطأ أثناء التوليد');
        console.error(error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handleGeneratePDF = async () => {
    if (credentials.length === 0) {
      toast.error('يجب توليد الحسابات أولاً');
      return;
    }

    setIsPdfGenerating(true);
    
    try {
      await generatePDF(credentials, printSettings);
      toast.success('تم إنشاء ملف PDF بنجاح');
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء PDF');
      console.error(error);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const getCurrentSettings = useCallback(() => {
    return {
      mikrotik: mikrotikSettings,
      credential: credentialSettings,
      print: printSettings,
    };
  }, [mikrotikSettings, credentialSettings, printSettings]);

  const handleLoadSettings = (settings: Record<string, unknown>) => {
    const s = settings as {
      mikrotik?: MikrotikSettingsType;
      credential?: CredentialSettingsType;
      print?: PrintSettingsType;
    };
    
    if (s.mikrotik) setMikrotikSettings(s.mikrotik);
    if (s.credential) setCredentialSettings(s.credential);
    if (s.print) {
      // Keep background image null when loading (can't save images in localStorage)
      setPrintSettings({ ...s.print, backgroundImage: null });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow-pulse">
            مولد كروت MikroTik الاحترافي
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            أنشئ حسابات User Manager و Hotspot لإصدار RouterOS v6 و v7 بسهولة واحترافية
          </p>
        </div>

        {/* MikroTik Connection */}
        <MikrotikConnection 
          script={script} 
          onExistingUsersLoaded={handleExistingUsersLoaded} 
        />

        {/* Main Settings */}
        <div id="generator" className="space-y-6">
          <MikrotikSettings
            settings={mikrotikSettings}
            onChange={handleMikrotikChange}
          />

          <CredentialSettings
            settings={credentialSettings}
            onChange={handleCredentialChange}
          />

          <PrintSettings
            settings={printSettings}
            onChange={handlePrintChange}
            onImageChange={handleImageChange}
          />
        </div>

        {/* Generate Button */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary text-lg py-4 px-8 flex items-center justify-center gap-3 min-w-[250px]"
          >
            {isGenerating ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Wand2 className="w-6 h-6" />
            )}
            {isGenerating ? 'جارٍ التوليد...' : 'توليد الحسابات'}
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={isPdfGenerating || credentials.length === 0}
            className="btn-accent text-lg py-4 px-8 flex items-center justify-center gap-3 min-w-[250px] disabled:opacity-50"
          >
            {isPdfGenerating ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <FileOutput className="w-6 h-6" />
            )}
            {isPdfGenerating ? 'جارٍ الإنشاء...' : 'إنشاء PDF'}
          </button>
        </div>

        {/* Preview Section */}
        <div id="preview">
          <CardPreview credentials={credentials} printSettings={printSettings} />
        </div>

        {/* Script Output */}
        <ScriptOutput script={script} credentials={credentials} />

        {/* Settings Manager */}
        <div id="settings">
          <SettingsManager
            onLoadSettings={handleLoadSettings}
            getCurrentSettings={getCurrentSettings}
          />
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground">
            HashTik Mikrotik © {new Date().getFullYear()} - مولد كروت احترافي
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            يدعم RouterOS v6 و v7 | User Manager | Hotspot
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;

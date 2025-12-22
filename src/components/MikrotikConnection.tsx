import React, { useState } from 'react';
import { Wifi, WifiOff, Loader2, Upload, Users } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MikrotikConnectionProps {
  script: string;
  onExistingUsersLoaded: (users: string[]) => void;
}

interface ConnectionSettings {
  host: string;
  port: number;
  username: string;
  password: string;
}

const MikrotikConnection: React.FC<MikrotikConnectionProps> = ({ script, onExistingUsersLoaded }) => {
  const [settings, setSettings] = useState<ConnectionSettings>({
    host: '',
    port: 80,
    username: 'admin',
    password: '',
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isAddingToMikrotik, setIsAddingToMikrotik] = useState(false);
  const [existingUsers, setExistingUsers] = useState<string[]>([]);

  const handleChange = (field: keyof ConnectionSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    if (!settings.host || !settings.username) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال عنوان الجهاز واسم المستخدم',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-api', {
        body: {
          action: 'connect',
          credentials: settings,
        },
      });

      if (error) throw error;

      if (data.success) {
        setIsConnected(true);
        toast({
          title: 'تم الاتصال',
          description: 'تم الاتصال بجهاز MikroTik بنجاح',
        });
        // Load users after successful connection
        await loadExistingUsers();
      } else {
        throw new Error(data.error || 'فشل الاتصال');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: 'خطأ في الاتصال',
        description: error.message || 'فشل الاتصال بجهاز MikroTik',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const loadExistingUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-api', {
        body: {
          action: 'get-users',
          credentials: settings,
        },
      });

      if (error) throw error;

      if (data.success) {
        setExistingUsers(data.users || []);
        onExistingUsersLoaded(data.users || []);
        toast({
          title: 'تم جلب المستخدمين',
          description: `تم العثور على ${data.users?.length || 0} مستخدم موجود`,
        });
      } else {
        throw new Error(data.error || 'فشل جلب المستخدمين');
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل جلب المستخدمين',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleAddToMikrotik = async () => {
    if (!script) {
      toast({
        title: 'خطأ',
        description: 'يرجى توليد الكروت أولاً',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingToMikrotik(true);
    try {
      const scriptName = 'hashedAddCards';

      // Add or update the script
      const addResult = await supabase.functions.invoke('mikrotik-api', {
        body: {
          action: 'add-script',
          credentials: settings,
          scriptName,
          script,
        },
      });

      if (addResult.error) throw addResult.error;
      if (!addResult.data.success) throw new Error(addResult.data.error);

      toast({
        title: 'تم إضافة السكريبت',
        description: 'جاري تشغيل السكريبت...',
      });

      // Run the script
      const runResult = await supabase.functions.invoke('mikrotik-api', {
        body: {
          action: 'run-script',
          credentials: settings,
          scriptName,
        },
      });

      if (runResult.error) throw runResult.error;
      if (!runResult.data.success) throw new Error(runResult.data.error);

      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الكروت إلى MikroTik وتشغيل السكريبت',
      });

      // Reload users to update the list
      await loadExistingUsers();
    } catch (error: any) {
      console.error('Error adding to MikroTik:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل إضافة الكروت إلى MikroTik',
        variant: 'destructive',
      });
    } finally {
      setIsAddingToMikrotik(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setExistingUsers([]);
    onExistingUsersLoaded([]);
    toast({
      title: 'تم قطع الاتصال',
      description: 'تم قطع الاتصال بجهاز MikroTik',
    });
  };

  return (
    <div className="settings-card">
      <div className="flex items-center gap-2 mb-4">
        {isConnected ? (
          <Wifi className="w-5 h-5 text-green-500" />
        ) : (
          <WifiOff className="w-5 h-5 text-muted-foreground" />
        )}
        <h3 className="text-lg font-semibold">اتصال MikroTik</h3>
        {isConnected && (
          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full">
            متصل
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">عنوان IP أو Domain</label>
          <Input
            type="text"
            value={settings.host}
            onChange={(e) => handleChange('host', e.target.value)}
            placeholder="192.168.88.1"
            disabled={isConnected}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">المنفذ (Port)</label>
          <Input
            type="number"
            value={settings.port}
            onChange={(e) => handleChange('port', parseInt(e.target.value) || 80)}
            placeholder="80"
            disabled={isConnected}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
          <Input
            type="text"
            value={settings.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="admin"
            disabled={isConnected}
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">كلمة المرور</label>
          <Input
            type="password"
            value={settings.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••"
            disabled={isConnected}
            dir="ltr"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            {isConnecting ? 'جاري الاتصال...' : 'اتصال'}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="flex items-center gap-2"
            >
              <WifiOff className="w-4 h-4" />
              قطع الاتصال
            </Button>

            <Button
              onClick={loadExistingUsers}
              disabled={isLoadingUsers}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoadingUsers ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Users className="w-4 h-4" />
              )}
              تحديث المستخدمين ({existingUsers.length})
            </Button>

            <Button
              onClick={handleAddToMikrotik}
              disabled={isAddingToMikrotik || !script}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isAddingToMikrotik ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isAddingToMikrotik ? 'جاري الإضافة...' : 'إضافة للميكروتيك'}
            </Button>
          </>
        )}
      </div>

      {existingUsers.length > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            المستخدمين الموجودين ({existingUsers.length}):
          </p>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {existingUsers.slice(0, 50).map((user, index) => (
              <span
                key={index}
                className="text-xs bg-background px-2 py-1 rounded border"
              >
                {user}
              </span>
            ))}
            {existingUsers.length > 50 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                و {existingUsers.length - 50} آخرين...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MikrotikConnection;

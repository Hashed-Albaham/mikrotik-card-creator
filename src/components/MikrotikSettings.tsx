import { Network, Users, Server, Tag, Clock, MessageSquare, MapPin } from 'lucide-react';

interface MikrotikSettingsProps {
  settings: {
    userType: string;
    mikrotikVersion: string;
    customer: string;
    hotspotServer: string;
    profile: string;
    hotspotLimit: string;
    comment: string;
    location: string;
  };
  onChange: (field: string, value: string) => void;
}

const MikrotikSettings = ({ settings, onChange }: MikrotikSettingsProps) => {
  const isHotspot = settings.userType === 'hotspot';

  return (
    <div className="glass-card p-6 fade-in">
      <h2 className="section-title">
        <Network className="w-5 h-5 text-primary" />
        إعدادات MikroTik
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* User Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="w-4 h-4" />
            نوع المستخدمين
          </label>
          <select
            value={settings.userType}
            onChange={(e) => onChange('userType', e.target.value)}
            className="select-field"
          >
            <option value="usermanager">User Manager</option>
            <option value="hotspot">Hotspot</option>
          </select>
        </div>

        {/* MikroTik Version - Only for User Manager */}
        {!isHotspot && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="w-4 h-4" />
              إصدار MikroTik
            </label>
            <select
              value={settings.mikrotikVersion}
              onChange={(e) => onChange('mikrotikVersion', e.target.value)}
              className="select-field"
            >
              <option value="v6">RouterOS v6</option>
              <option value="v7">RouterOS v7</option>
            </select>
          </div>
        )}

        {/* Customer - Only for User Manager v6 */}
        {!isHotspot && settings.mikrotikVersion === 'v6' && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="w-4 h-4" />
              العميل (Customer)
            </label>
            <input
              type="text"
              value={settings.customer}
              onChange={(e) => onChange('customer', e.target.value)}
              placeholder="admin"
              className="input-field"
            />
          </div>
        )}

        {/* Hotspot Server - Only for Hotspot */}
        {isHotspot && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Server className="w-4 h-4" />
              سيرفر الهوتسبوت
            </label>
            <input
              type="text"
              value={settings.hotspotServer}
              onChange={(e) => onChange('hotspotServer', e.target.value)}
              placeholder="all"
              className="input-field"
            />
          </div>
        )}

        {/* Profile */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Tag className="w-4 h-4" />
            البروفايل
          </label>
          <input
            type="text"
            value={settings.profile}
            onChange={(e) => onChange('profile', e.target.value)}
            placeholder="default"
            className="input-field"
          />
        </div>

        {/* Hotspot Limit - Only for Hotspot */}
        {isHotspot && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4" />
              مدة الصلاحية
            </label>
            <input
              type="text"
              value={settings.hotspotLimit}
              onChange={(e) => onChange('hotspotLimit', e.target.value)}
              placeholder="مثال: 1d أو 12h30m"
              className="input-field"
            />
          </div>
        )}

        {/* Comment */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            التعليق
          </label>
          <input
            type="text"
            value={settings.comment}
            onChange={(e) => onChange('comment', e.target.value)}
            placeholder="اختياري"
            className="input-field"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="w-4 h-4" />
            الموقع / الرقم التسلسلي
          </label>
          <input
            type="text"
            value={settings.location}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="اختياري"
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
};

export default MikrotikSettings;

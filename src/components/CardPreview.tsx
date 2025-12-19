import { Eye, User, Lock, Hash, Calendar } from 'lucide-react';

interface Credential {
  username: string;
  password: string;
  profile: string;
  comment: string;
  location: string;
}

interface CardPreviewProps {
  credentials: Credential[];
  printSettings: {
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
}

const CardPreview = ({ credentials, printSettings }: CardPreviewProps) => {
  const credential = credentials[0];
  const today = new Date().toLocaleDateString('ar-EG');

  return (
    <div className="glass-card p-6 fade-in">
      <h2 className="section-title">
        <Eye className="w-5 h-5 text-primary" />
        معاينة الكرت
      </h2>

      <div className="mt-6 flex justify-center">
        {!credential ? (
          <div className="card-preview w-full max-w-md">
            <div className="text-center text-muted-foreground">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>تظهر المعاينة هنا بعد التوليد</p>
            </div>
          </div>
        ) : (
          <div
            className="relative border-2 border-dashed border-primary/30 rounded-lg overflow-hidden"
            style={{
              width: '200px',
              height: '80px',
              backgroundImage: printSettings.backgroundImage 
                ? `url(${printSettings.backgroundImage})` 
                : 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Username */}
            {printSettings.printUsername && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${printSettings.usernamePositionX * 2}px`,
                  top: `${printSettings.usernamePositionY * 2}px`,
                  fontSize: `${printSettings.usernameSize * 1.2}px`,
                  color: printSettings.usernameColor,
                  fontWeight: printSettings.usernameBold ? 'bold' : 'normal',
                  direction: 'ltr',
                }}
              >
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {credential.username}
                </span>
              </div>
            )}

            {/* Password */}
            {printSettings.printPassword && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${printSettings.passwordPositionX * 2}px`,
                  top: `${printSettings.passwordPositionY * 2}px`,
                  fontSize: `${printSettings.passwordSize * 1.2}px`,
                  color: printSettings.passwordColor,
                  fontWeight: printSettings.passwordBold ? 'bold' : 'normal',
                  direction: 'ltr',
                }}
              >
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {credential.password || '(بدون)'}
                </span>
              </div>
            )}

            {/* Serial Number */}
            {printSettings.useSerialNumber && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${printSettings.serialPositionX * 2}px`,
                  top: `${printSettings.serialPositionY * 2}px`,
                  fontSize: `${printSettings.serialNumberSize * 1.2}px`,
                  color: printSettings.serialColor,
                  fontWeight: printSettings.serialBold ? 'bold' : 'normal',
                  direction: 'ltr',
                }}
              >
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {printSettings.serialStartNumber}
                </span>
              </div>
            )}

            {/* Date */}
            {printSettings.useDatePrinting && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${printSettings.datePositionX * 2}px`,
                  top: `${printSettings.datePositionY * 2}px`,
                  fontSize: `${printSettings.dateSize * 1.2}px`,
                  color: printSettings.dateColor,
                  fontWeight: printSettings.dateBold ? 'bold' : 'normal',
                  direction: 'ltr',
                }}
              >
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {today}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {credentials.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{credentials.length}</div>
            <div className="text-sm text-muted-foreground">حساب مُولد</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-success">{credential.profile}</div>
            <div className="text-sm text-muted-foreground">البروفايل</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-accent">{credential.username.length}</div>
            <div className="text-sm text-muted-foreground">طول الاسم</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-warning">{credential.password.length || 0}</div>
            <div className="text-sm text-muted-foreground">طول السر</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardPreview;

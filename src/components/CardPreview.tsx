import { Eye } from 'lucide-react';

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
}

const CardPreview = ({ credentials, printSettings }: CardPreviewProps) => {
  const credential = credentials[0];
  const today = new Date().toLocaleDateString('ar-EG');

  // A4 dimensions in mm (same as PDF)
  const pageWidth = 210;
  const pageHeight = 297;
  
  // Calculate card dimensions exactly like PDF
  const cardWidthMM = (pageWidth - printSettings.boxSpacing * (printSettings.columns + 1)) / printSettings.columns;
  const cardHeightMM = (pageHeight - printSettings.boxSpacing * (printSettings.rows + 1)) / printSettings.rows;
  
  // Scale factor: 1mm = 3.78px (approximately)
  const SCALE = 3.78;
  
  // Preview dimensions in pixels
  const previewWidth = cardWidthMM * SCALE;
  const previewHeight = cardHeightMM * SCALE;

  // Convert mm to preview pixels
  const mmToPixels = (mm: number) => mm * SCALE;

  // Convert pt to preview pixels (1pt ≈ 0.353mm)
  const ptToPixels = (pt: number) => pt * 0.353 * SCALE;

  return (
    <div className="glass-card p-6 fade-in">
      <h2 className="section-title">
        <Eye className="w-5 h-5 text-primary" />
        معاينة الكرت
      </h2>

      {/* Card Dimensions Info */}
      <div className="mt-4 mb-4 text-sm text-muted-foreground text-center">
        أبعاد الكرت: {cardWidthMM.toFixed(1)} × {cardHeightMM.toFixed(1)} مم
      </div>

      <div className="mt-6 flex justify-center overflow-auto">
        {!credential ? (
          <div 
            className="border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center"
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              minWidth: '200px',
              minHeight: '80px',
            }}
          >
            <div className="text-center text-muted-foreground p-4">
              <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>تظهر المعاينة هنا بعد التوليد</p>
            </div>
          </div>
        ) : (
          <div
            className="relative border border-border/50 rounded overflow-hidden shadow-lg"
            style={{
              width: `${previewWidth}px`,
              height: `${previewHeight}px`,
              backgroundImage: printSettings.backgroundImage 
                ? `url(${printSettings.backgroundImage})` 
                : 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
            }}
          >
            {/* Username - positioned exactly like PDF */}
            {printSettings.printUsername && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${mmToPixels(printSettings.usernamePositionX)}px`,
                  top: `${mmToPixels(printSettings.usernamePositionY)}px`,
                  fontSize: `${ptToPixels(printSettings.usernameSize)}px`,
                  color: printSettings.usernameColor,
                  fontWeight: printSettings.usernameBold ? 'bold' : 'normal',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: 1,
                }}
              >
                {credential.username}
              </div>
            )}

            {/* Password - positioned exactly like PDF */}
            {printSettings.printPassword && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${mmToPixels(printSettings.passwordPositionX)}px`,
                  top: `${mmToPixels(printSettings.passwordPositionY)}px`,
                  fontSize: `${ptToPixels(printSettings.passwordSize)}px`,
                  color: printSettings.passwordColor,
                  fontWeight: printSettings.passwordBold ? 'bold' : 'normal',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: 1,
                }}
              >
                {credential.password || '(no password)'}
              </div>
            )}

            {/* Serial Number - positioned exactly like PDF */}
            {printSettings.useSerialNumber && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${mmToPixels(printSettings.serialPositionX)}px`,
                  top: `${mmToPixels(printSettings.serialPositionY)}px`,
                  fontSize: `${ptToPixels(printSettings.serialNumberSize)}px`,
                  color: printSettings.serialColor,
                  fontWeight: printSettings.serialBold ? 'bold' : 'normal',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: 1,
                }}
              >
                {printSettings.serialStartNumber}
              </div>
            )}

            {/* Date - positioned exactly like PDF */}
            {printSettings.useDatePrinting && (
              <div
                className="absolute whitespace-nowrap"
                style={{
                  left: `${mmToPixels(printSettings.datePositionX)}px`,
                  top: `${mmToPixels(printSettings.datePositionY)}px`,
                  fontSize: `${ptToPixels(printSettings.dateSize)}px`,
                  color: printSettings.dateColor,
                  fontWeight: printSettings.dateBold ? 'bold' : 'normal',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: 1,
                }}
              >
                {today}
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

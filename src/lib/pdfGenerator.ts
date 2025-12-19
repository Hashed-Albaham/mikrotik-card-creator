import { GeneratedCredential } from './generator';

export interface PrintSettings {
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
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

export async function generatePDF(
  credentials: GeneratedCredential[],
  settings: PrintSettings
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;
  
  // A4 dimensions in mm
  const pageWidth = 210;
  const pageHeight = 297;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const cardsPerPage = settings.columns * settings.rows;
  const cardWidth = (pageWidth - settings.boxSpacing * (settings.columns + 1)) / settings.columns;
  const cardHeight = (pageHeight - settings.boxSpacing * (settings.rows + 1)) / settings.rows;
  
  const today = new Date().toLocaleDateString('ar-EG');
  
  let cardIndex = 0;

  for (const credential of credentials) {
    if (cardIndex > 0 && cardIndex % cardsPerPage === 0) {
      pdf.addPage();
    }

    const pageCardIndex = cardIndex % cardsPerPage;
    const col = pageCardIndex % settings.columns;
    const row = Math.floor(pageCardIndex / settings.columns);
    
    // RTL adjustment - flip column order
    const rtlCol = settings.columns - 1 - col;
    
    const x = settings.boxSpacing + rtlCol * (cardWidth + settings.boxSpacing);
    const y = settings.boxSpacing + row * (cardHeight + settings.boxSpacing);

    // Draw background
    if (settings.backgroundImage) {
      try {
        pdf.addImage(settings.backgroundImage, 'JPEG', x, y, cardWidth, cardHeight);
      } catch {
        // Draw placeholder if image fails
        pdf.setFillColor(240, 240, 240);
        pdf.rect(x, y, cardWidth, cardHeight, 'F');
      }
    } else {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(x, y, cardWidth, cardHeight, 'F');
    }

    // Draw border
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(x, y, cardWidth, cardHeight, 'S');

    // Username
    if (settings.printUsername) {
      const [r, g, b] = hexToRgb(settings.usernameColor);
      pdf.setTextColor(r, g, b);
      pdf.setFontSize(settings.usernameSize);
      pdf.setFont('helvetica', settings.usernameBold ? 'bold' : 'normal');
      pdf.text(
        credential.username,
        x + settings.usernamePositionX,
        y + settings.usernamePositionY
      );
    }

    // Password
    if (settings.printPassword) {
      const [r, g, b] = hexToRgb(settings.passwordColor);
      pdf.setTextColor(r, g, b);
      pdf.setFontSize(settings.passwordSize);
      pdf.setFont('helvetica', settings.passwordBold ? 'bold' : 'normal');
      pdf.text(
        credential.password || '(no password)',
        x + settings.passwordPositionX,
        y + settings.passwordPositionY
      );
    }

    // Serial Number
    if (settings.useSerialNumber) {
      const [r, g, b] = hexToRgb(settings.serialColor);
      pdf.setTextColor(r, g, b);
      pdf.setFontSize(settings.serialNumberSize);
      pdf.setFont('helvetica', settings.serialBold ? 'bold' : 'normal');
      pdf.text(
        (settings.serialStartNumber + cardIndex).toString(),
        x + settings.serialPositionX,
        y + settings.serialPositionY
      );
    }

    // Date
    if (settings.useDatePrinting) {
      const [r, g, b] = hexToRgb(settings.dateColor);
      pdf.setTextColor(r, g, b);
      pdf.setFontSize(settings.dateSize);
      pdf.setFont('helvetica', settings.dateBold ? 'bold' : 'normal');
      pdf.text(today, x + settings.datePositionX, y + settings.datePositionY);
    }

    cardIndex++;
  }

  pdf.save(`hashtik-cards-${Date.now()}.pdf`);
}


import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export class PdfService {
  static async generatePdf(elementId: string, fileName: string): Promise<Blob | null> {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return null;
    }

    try {
      // Create a clone to avoid modifying the original hidden element too much
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = 'fixed';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.visibility = 'visible';
      clone.style.display = 'block';
      clone.style.zIndex = '9999'; // ensure the clone is visible for accurate rendering
      clone.style.width = '210mm'; // A4 width
      document.body.appendChild(clone);

      // Small delay to ensure styles are applied before capture
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false, // Disable logging for cleaner console
        backgroundColor: null, // allow transparent / dark backgrounds to show through
        windowWidth: 1200, // Fixed width for consistent layout
        onclone: (clonedDoc) => {
          try {
            // If the host document is in dark mode, make sure the cloned document reflects that
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
              clonedDoc.documentElement.classList.add('dark');
            }
          } catch (e) {
            // ignore
          }

          // Sanitize style tags to replace problematic oklch/oklab usages
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach(tag => {
            try {
              let css = tag.innerHTML;
              if (css.includes('oklch') || css.includes('oklab')) {
                css = css.replace(/oklch\([^)]+\)/g, '#777777');
                css = css.replace(/oklab\([^)]+\)/g, '#777777');
                css = css.replace(/--[\w-]+:\s*oklch\([^;]+\);/g, (match) => {
                  const varName = match.split(':')[0];
                  return `${varName}: #777777;`;
                });
                tag.innerHTML = css;
              }
            } catch (e) {
              console.warn('Failed to process style tag in PDF clone', e);
            }
          });

          // NOTE: do not remove external link[rel="stylesheet"] tags — keep tailwind/base/styles so dark variants work.

          // Also sanitize inline styles as a secondary measure for any remaining oklch/oklab
          const elements = clonedDoc.querySelectorAll('#professional-report, #professional-report *');
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const style = htmlEl.style;
            if (style) {
              try {
                if (style.color && (style.color.includes('oklch') || style.color.includes('oklab'))) style.color = '#000000';
                if (style.backgroundColor && (style.backgroundColor.includes('oklch') || style.backgroundColor.includes('oklab'))) style.backgroundColor = '#ffffff';
                if (style.borderColor && (style.borderColor.includes('oklch') || style.borderColor.includes('oklab'))) style.borderColor = '#000000';
              } catch (e) {
                // ignore
              }
            }
          });
        }
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG for smaller size
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Simple multi-page support
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  }

  static async savePdf(blob: Blob, fileName: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64 = base64data.split(',')[1];
          
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Documents,
              // Removed Encoding.UTF8 as it's not needed for base64 and can cause issues
            });
            alert(`تم حفظ التقرير بنجاح في مجلد المستندات باسم: ${fileName}`);
          } catch (writeError) {
            console.error('Filesystem write error:', writeError);
            alert('حدث خطأ أثناء محاولة حفظ الملف على ذاكرة الهاتف');
          }
        };
      } catch (error) {
        console.error('Error reading blob for native save:', error);
        alert('فشل تحويل التقرير للحفظ');
      }
    } else {
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
      } catch (webError) {
        console.error('Web download error:', webError);
        alert('فشل تحميل الملف في المتصفح');
      }
    }
  }

  static async sharePdf(blob: Blob, fileName: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const base64 = base64data.split(',')[1];
          
          try {
            const result = await Filesystem.writeFile({
              path: fileName,
              data: base64,
              directory: Directory.Cache,
            });

            await Share.share({
              title: 'تقرير زاد المسلم',
              text: 'إليك تقرير سجل العبادات من تطبيق زاد المسلم',
              url: result.uri,
              dialogTitle: 'مشاركة التقرير',
            });
          } catch (shareError) {
            console.error('Native share error:', shareError);
            alert('فشل فتح قائمة المشاركة');
          }
        };
      } catch (error) {
        console.error('Error reading blob for native share:', error);
        alert('فشل تحويل التقرير للمشاركة');
      }
    } else {
      // Web sharing fallback
      if (navigator.share) {
        try {
          const file = new File([blob], fileName, { type: 'application/pdf' });
          await navigator.share({
            title: 'تقرير زاد المسلم',
            files: [file],
          });
        } catch (error) {
          console.error('Web share failed, falling back to download');
          await this.savePdf(blob, fileName);
        }
      } else {
        await this.savePdf(blob, fileName);
      }
    }
  }
}

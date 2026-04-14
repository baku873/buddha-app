import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Opens the native camera/gallery picker on native platforms,
 * or falls back to a file input on web.
 *
 * @returns A base64 data URL string of the selected photo, or null if cancelled/failed
 */
export async function pickProfilePhoto(): Promise<string | null> {
  try {
    if (Capacitor.isNativePlatform()) {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        quality: 85,
        width: 400,
        height: 400,
        correctOrientation: true,
        promptLabelHeader: 'Профайл зураг',
        promptLabelPhoto: 'Галлерейгаас сонгох',
        promptLabelPicture: 'Камер ашиглах',
        promptLabelCancel: 'Болих',
      });
      return photo.dataUrl || null;
    } else {
      // Web fallback: create a hidden file input, trigger it, and read as data URL
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        };
        input.click();
      });
    }
  } catch (e) {
    console.warn('Camera cancelled or failed:', e);
    return null;
  }
}

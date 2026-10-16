/**
 * Utility to reliably download files in the browser with guaranteed filename preservation.
 *
 * Browsers ignore the `download` attribute on cross-origin URLs (such as Cloudinary or CDNs).
 * By fetching the file stream as a Blob and creating an Object URL on the local origin,
 * the browser's download manager is forced to respect the provided `fileName`.
 *
 * If blob fetching fails (e.g. strict CORS or offline), it gracefully falls back to opening
 * the direct link in a new tab.
 */
export async function downloadFileWithGuaranteedName(fileUrl: string, fileName: string): Promise<void> {
  if (!fileUrl) {
    throw new Error('No download URL provided');
  }

  try {
    const response = await fetch(fileUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file stream: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke after a brief delay so mobile browsers have time to trigger the save dialog
    setTimeout(() => {
      window.URL.revokeObjectURL(objectUrl);
    }, 2000);
  } catch (error) {
    console.warn('Direct blob download failed, falling back to direct navigation:', error);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

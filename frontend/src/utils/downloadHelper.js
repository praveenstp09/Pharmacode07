// Helper to trigger a true local file download to the user's Downloads folder
export const downloadPdfToLocal = async (url, filename = 'Pharmacode07_Document.pdf') => {
  if (!url) return;

  const finalName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    // 1. Fetch blob and trigger programmatic download
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Blob fetch failed');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (error) {
    // 2. Direct anchor click fallback
    let directUrl = url;
    if (url.includes('cloudinary.com')) {
      if (url.includes('/raw/upload/')) {
        directUrl = url.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      } else if (url.includes('/image/upload/')) {
        // Convert old image URL to raw URL or attachment
        directUrl = url.replace('/image/upload/', '/raw/upload/');
      }
    }
    const fallbackLink = document.createElement('a');
    fallbackLink.href = directUrl;
    fallbackLink.target = '_blank';
    fallbackLink.download = finalName;
    document.body.appendChild(fallbackLink);
    fallbackLink.click();
    document.body.removeChild(fallbackLink);
  }
};

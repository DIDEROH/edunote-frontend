export default function convertToWebp(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Conversion failed'));
          const fileName = `${(file.name || 'image').replace(/\.[^/.]+$/, '')}_${Date.now()}.webp`;
          const webpFile = new File([blob], fileName, { type: 'image/webp' });
          resolve(webpFile);
        }, 'image/webp', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

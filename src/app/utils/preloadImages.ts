export function preloadImages(urls: string[]): Promise<void> {
  return new Promise((resolve) => {
    let loaded = 0;
    const total = urls.length;

    if (total === 0) return resolve(); // nothing to load

    urls.forEach((url) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === total) {
          resolve();
        }
      };
      img.src = url;
    });
  });
}

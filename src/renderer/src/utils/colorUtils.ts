export function adjustLightness(hex: string, amount: number): string {
  // Remove '#' if present
  let color = hex.replace(/^#/, '');
  // Expand shorthand form (e.g. "03F") to full form ("0033FF")
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  
  // Convert to RGB decimals
  const r = parseInt(color.substring(0, 2), 16) / 255;
  const g = parseInt(color.substring(2, 4), 16) / 255;
  const b = parseInt(color.substring(4, 6), 16) / 255;

  // Convert RGB to HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Adjust lightness by percentage points (e.g. -10 to darken by 10%)
  l += amount / 100;
  if (l > 1) l = 1;
  if (l < 0) l = 0;

  // Helper function to convert HSL back to RGB
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r1 = hue2rgb(p, q, h + 1/3);
  const g1 = hue2rgb(p, q, h);
  const b1 = hue2rgb(p, q, h - 1/3);

  // Convert back to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

 export function getPastelColorForTag(tag: string): string {
   let hash = 0;
   for (let i = 0; i < tag.length; i++) {
     hash = tag.charCodeAt(i) + ((hash << 5) - hash);
   }
   const hue = Math.abs(hash) % 360;
   return `hsl(${hue}, 70%, 85%)`;
 }
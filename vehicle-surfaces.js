// The supplied GLBs encode bodywork, glass and trim in a single vertex-colour mesh.
export function vehicleSurface(r, g, b) {
  const high = Math.max(r,g,b), low = Math.min(r,g,b);
  if (low > .8 && high - low < .1) return 'chrome';
  if (low > .42 && high < .72 && high - low < .12) return 'glass';
  if (high < .085) return 'trim';
  if (r > .5 && g < .26 && b < .09) return 'lamp';
  return 'paint';
}

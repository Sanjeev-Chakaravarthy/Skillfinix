// Hallmark Coral Avatar Generator (zero external network requests, zero generic blue)
export const getHallmarkAvatar = (name) => {
  const cleanName = (name || "U").trim();
  const initial = (cleanName.charAt(0) || "U").toUpperCase();
  
  // Deterministic atelier tone selection based on name char codes
  const tones = [
    { bg: "%2324211E", ring: "%23322E2A", fg: "%23F8F6F0" }, // Deep Umber Ink
    { bg: "%23A34226", ring: "%23B84E30", fg: "%23FAF8F5" }, // Terracotta Sienna
    { bg: "%232A5A44", ring: "%23366D54", fg: "%23FAF8F5" }, // Botanical Laurel
    { bg: "%233E3832", ring: "%234C453E", fg: "%23F8F6F0" }, // Warm Slate
  ];
  const charCode = cleanName.charCodeAt(0) || 0;
  const tone = tones[charCode % tones.length];

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${tone.bg}"/><circle cx="100" cy="100" r="92" fill="none" stroke="${tone.ring}" stroke-width="6"/><text x="50%" y="54%" font-family="General Sans, -apple-system, sans-serif" font-size="84" font-weight="600" fill="${tone.fg}" dominant-baseline="middle" text-anchor="middle">${encodeURIComponent(initial)}</text></svg>`;
};

export const resolveAvatarUrl = (avatarPath, name) => {
  if (!avatarPath) return getHallmarkAvatar(name);
  if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://") || avatarPath.startsWith("data:")) {
    // If it's a legacy ui-avatars.com URL, replace with Hallmark avatar
    if (avatarPath.includes("ui-avatars.com")) {
      return getHallmarkAvatar(name);
    }
    return avatarPath;
  }
  return getHallmarkAvatar(name);
};

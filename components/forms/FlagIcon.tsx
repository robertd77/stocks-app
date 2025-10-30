import React, { useEffect, useState } from "react";

type FlagIconProps = {
  countryCode: string;
  size?: number;
  className?: string;
};

const getFlagEmoji = (countryCode: string) => {
  if (!countryCode || countryCode.length !== 2) return "";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

/**
 * FlagIcon renders either an emoji or an image for Windows users.
 * SSR-safe: server renders emoji, no hydration mismatch.
 */
const FlagIcon: React.FC<FlagIconProps> = ({ countryCode, size = 16, className }) => {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && /Windows/i.test(navigator.userAgent)) {
      setIsWindows(true);
    }
  }, []);

  if (!countryCode) return null;
  const code = countryCode.slice(0, 2).toUpperCase();

  if (isWindows) {
    const width = Math.round(size * (4 / 3));
    const src = `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
    return (
      <img
        src={src}
        alt={code}
        width={width}
        height={size}
        className={className}
        style={{ display: "inline-block", objectFit: "cover", borderRadius: 2 }}
      />
    );
  }

  // Emoji fallback for non-Windows platforms (also used on server)
  return (
    <span
      aria-hidden
      className={className}
      style={{ fontSize: size, lineHeight: 1, display: "inline-block" }}
    >
      {getFlagEmoji(code)}
    </span>
  );
};

export default FlagIcon;

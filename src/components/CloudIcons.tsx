/**
 * CloudIcons — Icônes officielles des services cloud.
 * simple-icons pour les marques disponibles, SvgIcon custom pour le reste.
 */

import { SvgIcon, SvgIconProps } from "@mui/material";
import { siGoogledrive, siDropbox, siIcloud, siBox, siMega } from "simple-icons";

function fromSimpleIcon(icon: { path: string; hex: string }) {
  return function BrandIcon(props: SvgIconProps) {
    return (
      <SvgIcon {...props} viewBox="0 0 24 24">
        <path d={icon.path} fill={`#${icon.hex}`} />
      </SvgIcon>
    );
  };
}

export const GoogleDriveIcon = fromSimpleIcon(siGoogledrive);
export const DropboxIcon = fromSimpleIcon(siDropbox);
export const ICloudIcon = fromSimpleIcon(siIcloud);
export const BoxIcon = fromSimpleIcon(siBox);
export const MegaIcon = fromSimpleIcon(siMega);

// OneDrive — SVG custom (logo officiel simplifié)
export function OneDriveIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M10.2 7.4c1.8-1.4 4.3-1.6 6.3-.4.4-.1.7-.1 1.1-.1 2.5 0 4.5 1.9 4.5 4.3v.2c1.1.6 1.9 1.8 1.9 3.2 0 2-1.6 3.6-3.6 3.6H6.5c-2.7 0-4.9-2.1-4.9-4.7 0-2.2 1.5-4.1 3.7-4.6.8-1.1 2.8-2.5 4.9-1.5z" fill="#0078D4" />
    </SvgIcon>
  );
}

// Amazon S3 — SVG custom (logo AWS simplifié)
export function AmazonS3Icon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.82 7 12 9.82 4.18 7 12 4.18zM3 8.27l8 4v8.46l-8-4V8.27zm10 12.46V12.27l8-4v8.46l-8 4z" fill="#FF9900" />
    </SvgIcon>
  );
}

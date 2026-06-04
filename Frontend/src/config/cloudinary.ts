import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;

export const cld = new Cloudinary({
  cloud: { cloudName: cloudName || 'demo' },
  url: { secure: true },
});

export const isCldConfigured = !!cloudName && cloudName !== 'demo';

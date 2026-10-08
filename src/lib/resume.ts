import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '@/data/site';

/** The resume link only renders when the PDF is actually shipped in /public. */
export const hasResume = existsSync(join(process.cwd(), 'public', site.links.resume));

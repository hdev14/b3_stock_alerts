import { readdirSync } from 'fs';
import { resolve } from 'path';

const is_production = process.env.NODE_ENV === 'production';

const js_filenames = readdirSync(resolve(__dirname, '../public/js/'));
const css_filenames = readdirSync(resolve(__dirname, '../public/css/'));

function createFilenameObject(path: 'css' | 'js') {
  return (acc: Record<string, string>, filename: string) => {
    const [name, ext] = filename.split('.');

    if (!acc[name]) {
      acc[name] = is_production ? `/${path}/${name}.min.${ext}` : `/${path}/${filename}`;
    }

    return acc;
  }
}

const scripts = js_filenames.reduce(createFilenameObject('js'), {
  captcha: 'https://www.google.com/recaptcha/api.js?render=6LdAc2UpAAAAAObuHow9pOS5dy0coRW11AKKiWJA',
  imask: 'https://unpkg.com/imask',
});

const styles = css_filenames.reduce(createFilenameObject('css'), {});

export function getStyles(link_names: string[]) {
  const link_keys = Object.keys(styles).filter((key) => link_names.includes(key));
  return link_keys.map((key) => ({ url: styles[key] }));
}

export function getScripts(script_names: string[]) {
  const script_keys = Object.keys(scripts).filter((key) => script_names.includes(key));
  return script_keys.map((key) => ({ url: scripts[key] }));
}

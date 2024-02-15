import { readdirSync } from 'fs';
import { resolve } from 'path';
import QueryString from 'qs';

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

const _scripts = js_filenames.reduce(createFilenameObject('js'), {
  captcha: 'https://www.google.com/recaptcha/api.js?render=6LdAc2UpAAAAAObuHow9pOS5dy0coRW11AKKiWJA',
  imask: 'https://unpkg.com/imask',
});

const _styles = css_filenames.reduce(createFilenameObject('css'), {});

export function getStyles(link_names: string[]) {
  const link_keys = Object.keys(_styles).filter((key) => link_names.includes(key));
  return link_keys.map((key) => ({ url: _styles[key] }));
}

export function getScripts(script_names: string[]) {
  const script_keys = Object.keys(_scripts).filter((key) => script_names.includes(key));
  return script_keys.map((key) => ({ url: _scripts[key] }));
}

type Alerts = Array<{
  type: 'alert_error' | 'alert_success' | 'alert_info';
  message: string;
}>;

export function getAlerts(query: QueryString.ParsedQs): Alerts {
  const { success_message, info_message, error_message } = query;
  const alerts: Alerts = [];

  if (error_message && typeof error_message === 'string') {
    alerts.push({ type: 'alert_error', message: error_message });
  }

  if (info_message && typeof info_message === 'string') {
    alerts.push({ type: 'alert_info', message: info_message });
  }

  if (success_message && typeof success_message === 'string') {
    alerts.push({ type: 'alert_success', message: success_message });
  }

  return alerts;
}

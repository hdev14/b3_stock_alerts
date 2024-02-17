import { readdirSync } from 'fs';
import { resolve } from 'path';
import QueryString from 'qs';

const is_production = process.env.NODE_ENV === 'production';

const js_filenames = readdirSync(resolve(__dirname, './public/js/'));

const _scripts = js_filenames.reduce((acc: Record<string, string>, filename: string) => {
  const [name, ext] = filename.split('.');

  if (!acc[name]) {
    acc[name] = is_production ? `/js/${name}.min.${ext}` : `/js/${filename}`;
  }

  return acc;
}, {
  captcha: 'https://www.google.com/recaptcha/api.js?render=6LdAc2UpAAAAAObuHow9pOS5dy0coRW11AKKiWJA',
  imask: 'https://unpkg.com/imask',
});

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

export default function isPage(original_url: string) {
  return original_url.startsWith('/forms') || original_url.startsWith('/pages');
}

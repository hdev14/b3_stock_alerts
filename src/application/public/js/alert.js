class Alert {
  static ALERT_TYPES = {
    success_message: [
      'absolute',
      'right-10',
      'top-10',
      'z-10',
      'px-6',
      'py-4',
      'bg-green-50',
      'rounded-lg',
      'text-green-500',
    ],
    info_message: [
      'absolute',
      'right-10',
      'top-10',
      'z-10',
      'px-6',
      'py-4',
      'bg-blue-50',
      'rounded-lg',
      'text-blue-500',
    ],
    error_message: [
      'absolute',
      'right-10',
      'top-10',
      'z-10',
      'px-6',
      'py-4',
      'bg-red-50',
      'rounded-lg',
      'text-red-500',
    ],
  };

  /**
   *
   * @param {string} type
   * @param {string} message
   */
  static create(type, message) {
    const class_names = Alert.ALERT_TYPES[type];

    if (class_names) {
      const alert = document.createElement('div');
      const text = document.createTextNode(message);
      alert.appendChild(text);
      alert.classList.add(...class_names);
      alert.setAttribute('data-testid', 'alert-message');

      return alert;
    }

    return null;
  }
}

(function showAlert(query_params) {
  for (const [type, value] of query_params.entries()) {
    if (['success_message', 'info_message', 'error_message'].includes(type)) {
      const alert = Alert.create(type, value);

      document.body.appendChild(alert);

      const ALERT_SECS = 5000;

      let timeout_id = setTimeout(() => {
        document.body.removeChild(alert);
      }, ALERT_SECS);

      alert.addEventListener('mouseover', () => {
        clearTimeout(timeout_id);
      });

      alert.addEventListener('mouseout', () => {
        timeout_id = setTimeout(() => {
          document.body.removeChild(alert);
        }, ALERT_SECS);
      });

      break;
    }
  }
}(new URLSearchParams(window.location.search)));

import { useState } from 'react';
import Icon from './Icon';

export default function PasswordInput({ id, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrap">
      <input id={id} type={visible ? 'text' : 'password'} {...inputProps} />
      <button
        type="button"
        className="password-toggle"
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible((v) => !v)}
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  );
}

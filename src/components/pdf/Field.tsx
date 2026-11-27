import React, { useId } from 'react';

export interface FieldProps {
  /** Current value of the field. */
  value?: string;
  /** Default value used when the field is first rendered. */
  defaultValue?: string;
  /** Called when the field value changes. */
  onChange?: (value: string) => void;
  /** Called when the field loses focus. */
  onBlur?: () => void;
  /** Visible label above the field. */
  label?: string;
  /** Hint shown inside the field before the user types. */
  placeholder?: string;
  /** Helpful description rendered below the field. */
  help?: string;
  /** Status message (e.g. a validation note) rendered below the field. */
  message?: string | undefined;
  /** When true, renders the field in an error state. */
  error?: boolean;
  /** Name attribute forwarded to the input. */
  name?: string;
  /** Id attribute forwarded to the input; auto-generated when omitted. */
  id?: string;
  /** When true, the field is disabled. */
  disabled?: boolean;
  /** Extra class names applied to the wrapper. */
  className?: string;
  /** Any additional props forwarded to the underlying input element. */
  [key: string]: unknown;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  function Field(props: FieldProps, ref) {
    const { value, defaultValue, onChange, onBlur, label, placeholder, help, message, error, name, id, disabled, className, ...rest } = props;
    const generatedId = useId();
    const fieldId = id ?? generatedId;

    return (
      <div className={`field field--has-label ${className ?? ''}`}>
        {label != null && (
          <label htmlFor={fieldId} className="field__label">
            {label}
          </label>
        )}
        <div className="field__control">
          <input
            ref={ref}
            id={fieldId}
            name={name}
            disabled={disabled}
            defaultValue={defaultValue}
            value={value}
            placeholder={placeholder}
            onChange={(event) => {
              if (onChange) {
                onChange(event.target.value);
              }
            }}
            onBlur={onBlur}
            className={`field__input ${error ? 'field__input--error' : ''}`}
            aria-invalid={error ? true : undefined}
            aria-describedby={help != null || message != null ? `${fieldId}-desc` : undefined}
            {...rest}
          />
        </div>
        {(help != null || message != null) && (
          <div id={`${fieldId}-desc`} className={`field__messaging ${error ? 'field__messaging--error' : ''}`}>
            {message != null ? <span className="field__message">{message}</span> : null}
            {help != null ? <span className="field__help">{help}</span> : null}
          </div>
        )}
      </div>
    );
  },
);

Field.displayName = 'Field';

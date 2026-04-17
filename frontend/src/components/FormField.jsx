export default function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  accept,
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={type === 'file' ? undefined : value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        accept={accept}
      />
    </label>
  );
}

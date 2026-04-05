import { ParamHead } from '@mintlify/components';

interface ParamFieldProps {
  path?: string;
  type?: string;
  required?: boolean;
  default?: string;
  deprecated?: boolean;
  children?: React.ReactNode;
}

export function ParamField({
  path,
  type,
  required,
  deprecated,
  default: defaultValue,
  children,
}: ParamFieldProps) {
  return (
    <div className="field my-2.5 border-stone-50 border-b pt-2.5 pb-5 dark:border-stone-800/50">
      {path && (
        <ParamHead
          name={path}
          type={type}
          required={required != null ? true : undefined}
          requiredLabel="required"
          deprecated={deprecated != null ? true : undefined}
          deprecatedLabel="deprecated"
          default={defaultValue}
        />
      )}
      <div>{children}</div>
    </div>
  );
}

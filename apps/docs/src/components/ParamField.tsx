/**
 * Lightweight ParamField + ParamHead. Zero @mintlify/components dependency.
 */

interface ParamFieldProps {
  path?: string;
  type?: string;
  required?: boolean;
  default?: string;
  deprecated?: boolean;
  children?: React.ReactNode;
}

function InfoPill({ children, prefix }: { children: React.ReactNode; prefix?: string }) {
  return (
    <div className="mr-2 inline rounded-md bg-stone-100/50 px-1.5 py-0.5 text-stone-500 dark:bg-white/5 dark:text-stone-400">
      {prefix && <span>{prefix}: </span>}
      {children}
    </div>
  );
}

function RequiredPill({ label }: { label: string }) {
  return (
    <div className="mr-2 inline rounded-md bg-red-50 px-1.5 py-0.5 text-red-600 dark:bg-red-500/10 dark:text-red-400">
      {label}
    </div>
  );
}

function DeprecatedPill({ label }: { label: string }) {
  return (
    <div className="mr-2 inline rounded-md bg-yellow-50 px-1.5 py-0.5 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400">
      {label}
    </div>
  );
}

function ParamHead({
  name,
  type,
  required,
  requiredLabel,
  deprecated,
  deprecatedLabel,
  default: defaultValue,
}: any) {
  if (!name) return null;

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="group/param-head param-head relative flex break-all font-mono text-sm" id={slug}>
      <div className="mr-5 flex flex-1 flex-col content-start py-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="overflow-wrap-anywhere cursor-pointer font-semibold text-[var(--primary)]"
            data-component-part="field-name"
          >
            {name}
          </div>
          <div
            className="inline items-center gap-2 font-medium text-xs [&_div]:mr-2 [&_div]:inline [&_div]:leading-5"
            data-component-part="field-meta"
          >
            {type && <InfoPill>{type}</InfoPill>}
            {defaultValue != null && (
              <InfoPill prefix="default">
                {typeof defaultValue === 'string' ? (defaultValue === '' ? '""' : defaultValue) : JSON.stringify(defaultValue)}
              </InfoPill>
            )}
            {required && <RequiredPill label={requiredLabel || 'required'} />}
            {deprecated && <DeprecatedPill label={deprecatedLabel || 'deprecated'} />}
          </div>
        </div>
      </div>
    </div>
  );
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

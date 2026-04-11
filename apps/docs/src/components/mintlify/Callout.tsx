/**
 * Lightweight callout components. Zero client JS.
 * Replaces Info, Note, Tip, Warning, Check, Danger from @mintlify/components.
 */

const InfoSvg = () => (
  <svg className="size-5 shrink-0 fill-current" viewBox="0 0 20 20">
    <path d="M8 0C3.58125 0 0 3.58125 0 8C0 12.4187 3.58125 16 8 16C12.4187 16 16 12.4187 16 8C16 3.58125 12.4187 0 8 0ZM8 14.5C4.41563 14.5 1.5 11.5841 1.5 8C1.5 4.41594 4.41563 1.5 8 1.5C11.5844 1.5 14.5 4.41594 14.5 8C14.5 11.5841 11.5844 14.5 8 14.5ZM9.25 10.5H8.75V7.75C8.75 7.3375 8.41563 7 8 7H7C6.5875 7 6.25 7.3375 6.25 7.75C6.25 8.1625 6.5875 8.5 7 8.5H7.25V10.5H6.75C6.3375 10.5 6 10.8375 6 11.25C6 11.6625 6.3375 12 6.75 12H9.25C9.66406 12 10 11.6641 10 11.25C10 10.8359 9.66563 10.5 9.25 10.5ZM8 6C8.55219 6 9 5.55219 9 5C9 4.44781 8.55219 4 8 4C7.44781 4 7 4.44687 7 5C7 5.55313 7.44687 6 8 6Z" />
  </svg>
);

const NoteSvg = () => (
  <svg className="size-4 shrink-0 fill-current" viewBox="0 0 14 14">
    <path fillRule="evenodd" clipRule="evenodd" d="M7 1.3C10.14 1.3 12.7 3.86 12.7 7C12.7 10.14 10.14 12.7 7 12.7C5.48908 12.6974 4.0408 12.096 2.97241 11.0276C1.90403 9.9592 1.30264 8.51092 1.3 7C1.3 3.86 3.86 1.3 7 1.3ZM7 0C3.14 0 0 3.14 0 7C0 10.86 3.14 14 7 14C10.86 14 14 10.86 14 7C14 3.14 10.86 0 7 0ZM8 3H6V8H8V3ZM8 9H6V11H8V9Z" />
  </svg>
);

const TipSvg = () => (
  <svg className="h-auto w-3.5 shrink-0 fill-current" viewBox="0 0 11 14">
    <path d="M3.12794 12.4232C3.12794 12.5954 3.1776 12.7634 3.27244 12.907L3.74114 13.6095C3.88471 13.8248 4.21067 14 4.46964 14H6.15606C6.41415 14 6.74017 13.825 6.88373 13.6095L7.3508 12.9073C7.43114 12.7859 7.49705 12.569 7.49705 12.4232L7.50055 11.3513H3.12521L3.12794 12.4232ZM5.31288 0C2.52414 0.00875889 0.5 2.26889 0.5 4.78826C0.5 6.00188 0.949566 7.10829 1.69119 7.95492C2.14321 8.47011 2.84901 9.54727 3.11919 10.4557C3.12005 10.4625 3.12175 10.4698 3.12261 10.4771H7.50342C7.50427 10.4698 7.50598 10.463 7.50684 10.4557C7.77688 9.54727 8.48281 8.47011 8.93484 7.95492C9.67728 7.13181 10.1258 6.02703 10.1258 4.78826C10.1258 2.15486 7.9709 0.000106649 5.31288 0ZM7.94902 7.11267C7.52078 7.60079 6.99082 8.37878 6.6077 9.18794H4.02051C3.63739 8.37878 3.10743 7.60079 2.67947 7.11294C2.11997 6.47551 1.8126 5.63599 1.8126 4.78826C1.8126 3.09829 3.12794 1.31944 5.28827 1.3126C7.2435 1.3126 8.81315 2.88226 8.81315 4.78826C8.81315 5.63599 8.50688 6.47551 7.94902 7.11267ZM4.87534 2.18767C3.66939 2.18767 2.68767 3.16939 2.68767 4.37534C2.68767 4.61719 2.88336 4.81288 3.12521 4.81288C3.36705 4.81288 3.56274 4.61599 3.56274 4.37534C3.56274 3.6515 4.1515 3.06274 4.87534 3.06274C5.11719 3.06274 5.31288 2.86727 5.31288 2.62548C5.31288 2.38369 5.11599 2.18767 4.87534 2.18767Z" />
  </svg>
);

const WarningSvg = () => (
  <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckSvg = () => (
  <svg className="h-auto w-3.5 shrink-0 fill-current" viewBox="0 0 448 512">
    <path d="M438.6 105.4C451.1 117.9 451.1 138.1 438.6 150.6L182.6 406.6C170.1 419.1 149.9 419.1 137.4 406.6L9.372 278.6C-3.124 266.1-3.124 245.9 9.372 233.4C21.87 220.9 42.13 220.9 54.63 233.4L159.1 338.7L393.4 105.4C405.9 92.88 426.1 92.88 438.6 105.4H438.6z" />
  </svg>
);

const DangerSvg = () => (
  <svg className="size-4 shrink-0 fill-current" viewBox="0 0 512 512">
    <path d="M17.1 292c-12.9-22.3-12.9-49.7 0-72L105.4 67.1c12.9-22.3 36.6-36 62.4-36l176.6 0c25.7 0 49.5 13.7 62.4 36L494.9 220c12.9 22.3 12.9 49.7 0 72L406.6 444.9c-12.9 22.3-36.6 36-62.4 36l-176.6 0c-25.7 0-49.5-13.7-62.4-36L17.1 292zm41.6-48c-4.3 7.4-4.3 16.6 0 24l88.3 152.9c4.3 7.4 12.2 12 20.8 12l176.6 0c8.6 0 16.5-4.6 20.8-12L453.4 268c4.3-7.4 4.3-16.6 0-24L365.1 91.1c-4.3-7.4-12.2-12-20.8-12l-176.6 0c-8.6 0-16.5 4.6-20.8 12L58.6 244zM256 128c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
  </svg>
);

interface CalloutProps {
  children?: any;
  title?: string;
}

function Callout({ variant, icon: IconComponent, containerClass, textClass, title, children }: any) {
  return (
    <div className={`my-4 flex gap-3 overflow-hidden rounded-2xl px-5 py-4 ${containerClass}`}>
      {IconComponent && (
        <div className={`mt-0.5 ${textClass}`} data-component-part="callout-icon">
          <IconComponent />
        </div>
      )}
      <div className={`prose dark:prose-invert w-full min-w-0 text-sm [&_a]:border-current [&_a]:!text-current [&_code]:!text-current [&_strong]:!text-current ${textClass} ${title ? '[&>:nth-child(2)]:mt-3' : ''}`}>
        {title && <div className="font-semibold">{title}</div>}
        {children}
      </div>
    </div>
  );
}

export function Info({ children, title }: CalloutProps) {
  return <Callout containerClass="border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-white/10" textClass="text-stone-800 dark:text-stone-300" icon={InfoSvg} title={title}>{children}</Callout>;
}

export function Note({ children, title }: CalloutProps) {
  return <Callout containerClass="border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-600/20" textClass="text-blue-800 dark:text-blue-300" icon={NoteSvg} title={title}>{children}</Callout>;
}

export function Tip({ children, title }: CalloutProps) {
  return <Callout containerClass="border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-600/20" textClass="text-green-800 dark:text-green-300" icon={TipSvg} title={title}>{children}</Callout>;
}

export function Warning({ children, title }: CalloutProps) {
  return <Callout containerClass="border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-600/20" textClass="text-yellow-800 dark:text-yellow-300" icon={WarningSvg} title={title}>{children}</Callout>;
}

export function Check({ children, title }: CalloutProps) {
  return <Callout containerClass="border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-600/20" textClass="text-green-800 dark:text-green-300" icon={CheckSvg} title={title}>{children}</Callout>;
}

export function Danger({ children, title }: CalloutProps) {
  return <Callout containerClass="border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-600/20" textClass="text-red-800 dark:text-red-300" icon={DangerSvg} title={title}>{children}</Callout>;
}

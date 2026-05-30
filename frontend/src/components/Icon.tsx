export function Icon(props: { name: string; className?: string; title?: string }) {
  return (
    <svg className={props.className ?? "h-4 w-4"} aria-hidden={props.title ? undefined : true} role={props.title ? "img" : undefined}>
      {props.title ? <title>{props.title}</title> : null}
      <use href={`/icons.svg#${props.name}`} />
    </svg>
  );
}


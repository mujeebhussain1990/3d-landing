/**
 * Splits a line into words, each behind its own mask, so a heading can rise into
 * place word by word. Screen readers get the sentence once.
 */
export default function Words({
  text,
  className = "",
  announce = true,
}: {
  text: string;
  className?: string;
  /** false when the surrounding element already carries the accessible text */
  announce?: boolean;
}) {
  const words = text.split(" ");
  return (
    <>
      {announce && <span className="sr-only">{text}</span>}
      <span aria-hidden className={className}>
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
            <span data-word className="inline-block">
              {w}
            </span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </>
  );
}

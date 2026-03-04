interface TldrBoxProps {
  content: string;
}

export function TldrBox({ content }: TldrBoxProps) {
  return (
    <div className="rounded-lg bg-navy-800 border-l-4 border-neon p-5 my-6">
      <span className="inline-block mb-2 text-xs font-bold uppercase tracking-widest text-neon">
        TL;DR
      </span>
      <p className="text-slate-300 leading-relaxed">{content}</p>
    </div>
  );
}

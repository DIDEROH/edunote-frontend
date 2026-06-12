export default function TitleAndSubtitleComponent({ children }) {
  return (
    <div className="flex flex-col">
        {children}
    </div>
  )
}

TitleAndSubtitleComponent.Title = function ({ children }) {
    return <span className="text-indigo-800 font-black uppercase tracking-tighter text-sm">{children}</span>
}

TitleAndSubtitleComponent.Subtitle = function ({ children }) {
    return <span className="text-[10px] text-slate-500 italic">{children}</span>
}
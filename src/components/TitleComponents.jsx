function TitleUnderline({ text, tcolor, textSize, color }) {
  return (
    <div className="animate-reveal mb-8">
        <h2 className={`animate-slide-left text-${textSize || '3xl'} md:text-5xl font-bold tracking-tight text-${color || 'base-content'} mb-6`}>
              {text} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{tcolor}</span>.
        </h2>
        <div className="h-1 w-2/3 bg-gradient-to-r from-primary to-transparent rounded-full animate-slide-left"></div>
    </div>
  )
}


function Title1({ text }) {
    return(
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-base-content mb-4">
            {text}
        </h1>
    )
}


function Title2({ text }) {
    return(
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-base-content mb-4">
            {text}
        </h2>
    )
}


function Title3({ text }) {
    return(
        <h3 className="text-xl md:text-3xl font-bold tracking-tight text-base-content mb-4">
            {text}
        </h3>
    )
}


function TitleBig({ text }) {
    return(
        <h2 className="text-4xl md:text-6xl font-black text-base-content mb-6 tracking-tight">
            {text}
        </h2>
    )
}


function TitleGradient({ text }) {
    return(
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
            {text}
        </h2>
    )
}

function TitleTrack({ text, color }) {
    return(
        <span className={`text-xs font-bold uppercase tracking-[0.25em] text-${color}`}>
            {text}
        </span>
    )
}


export { TitleUnderline, Title1, Title2, Title3, TitleGradient, TitleTrack }
export default function TitleComponent({ children, css }) {
  return (
    <h1 className={`text-base font-semibold text-base-content ${css}`}>
        {children}
    </h1>
  )
}

export default function TitleComponent({ children, css }) {
  return (
    <h1 className={`text-md font-bold text-indigo-800 ${css}`}>
        {children}
    </h1>
  )
}

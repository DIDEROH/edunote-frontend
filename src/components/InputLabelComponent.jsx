export default function InputLabelComponent({ children }) {
  return (
    <div className='flex flex-col gap-1'>
      {children}
    </div>
  )
}

InputLabelComponent.Label = function ({ children }) {
    return  <label className="label pl-3">{children}</label>
}

InputLabelComponent.Input = function ({children}) {
    return <>{children}</>
}
export default function AlertInfo({ msg }) {
  return (
    <div role="alert" className="alert alert-info">
        ⚠️<span>{msg}</span>
    </div>
  )
}

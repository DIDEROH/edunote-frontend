export default function SelectComponent({ children, name, value, action, size, ref }) {
    const handleChange = (event) => {
        if (typeof action === 'function') {
            action(event); 
        }
    };

    return (
        <select
            ref={ref}
            name={name}
            value={value}
            onChange={handleChange}
            className={`select select-${size || 'sm'} outline-none border-none rounded-full`}
        >
            {children}
        </select>
    );
}
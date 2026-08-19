export default function TextTag({ color, children, size }){
    return (
        <span 
            className={`text-sm px-2 py-1 border rounded ${size}`}
            style={{
                color: color,
                borderColor: color,
                backgroundColor: `${color}20`,
            }}
        >
            { children }
        </span>
    )
}
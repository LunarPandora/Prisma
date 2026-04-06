import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ContextMenu({ onClicked, icon = "", iconColor = "text-gray-600", textColor = "text-gray-600", children }){
    return (
        <div className="bg-transparent hover:bg-gray-200 transition-colors duration-200 ease-in-out w-full flex items-center gap-2 px-2 py-2" onClick={() => onClicked()}>
            { icon && 
                <FontAwesomeIcon icon={icon} className={`${iconColor}`} />
            }
            <p className={`text-sm ${textColor}`}>{children}</p>
        </div>
    )
}
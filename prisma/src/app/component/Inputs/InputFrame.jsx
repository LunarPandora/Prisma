import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion, AnimatePresence } from "framer-motion"

export default function InputFrame({ icon, className, children, ...props }){
    return (
        <div className={`w-full h-full flex flex-col justify-center border-[0.5px] border-gray-300 rounded-lg p-3 gap-2 relative ${className}`}>
            <AnimatePresence>
                <span className="text-gray-400 text-xs absolute -top-2 bg-white px-2 left-2">
                    { props.placeholder }
                </span>
            </AnimatePresence>

            <div className="flex items-center w-full gap-2">
                <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />                
                
                <div className="w-full flex gap-2">
                    { children }
                </div>
            </div>
        </div>
    )
}
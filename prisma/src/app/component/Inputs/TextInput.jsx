import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion, AnimatePresence } from "framer-motion"

export default function TextInput({ icon, className, ...props }){
    return (
        <div className={`w-full flex flex-col border-[0.5px] border-gray-300 rounded-md px-3 py-3 gap-2 relative ${className}`}>
            <AnimatePresence>
                { props.value?.length > 0 &&
                    <motion.span
                        initial={{ opacity: 0, scale: 0.95, translateY: 0 }}
                        animate={{ opacity: 1, scale: 1, translateY: -10 }}
                        exit={{ opacity: 0, scale: 0.95, translateY: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400 text-xs absolute top-0 bg-white px-2 left-2"
                    >
                        { props.placeholder }
                    </motion.span>
                }
            </AnimatePresence>

            <div className="flex items-center w-full gap-2">
                <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />                
                <input 
                    className="w-full text-sm focus:outline-none" 
                    {...props}
                />
            </div>
        </div>
    )
}
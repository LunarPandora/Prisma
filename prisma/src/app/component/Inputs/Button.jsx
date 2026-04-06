import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"

export default function Button({ icon, children, ...props }){
    return (
        <motion.button
            {...props}
            key="action_type"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="will-change-auto flex items-center gap-2 px-3 py-2 rounded-lg border w-fit bg-transparent hover:bg-foreground hover:text-white transition-colors duration-300 ease-in-out"
        >
            <FontAwesomeIcon icon={icon} className="text-sm" /> 
            <p className="text-md">{ children }</p>
        </motion.button>
    )
}
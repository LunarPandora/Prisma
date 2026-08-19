import { motion } from "framer-motion";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoadingBar(){
    return (
        <motion.div
            key="alert"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, }}
            exit={{ opacity: 0, scale: 0.95, }}
            transition={{ duration: 0.2 }}
            className="w-1/3 bg-white p-6 rounded-xl flex flex-col items-center justify-center drop-shadow-lg will-change-auto gap-3"
        >   
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-black animate-spin"></FontAwesomeIcon>
            <p className="text-black">Loading...</p>
        </motion.div>
    )
}
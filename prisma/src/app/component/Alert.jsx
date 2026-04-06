import { AnimatePresence, motion } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBell, faCheck, faExclamation, faInfo, faQuestion, faX } from "@fortawesome/free-solid-svg-icons"

export default function Alert({ 
    alertType = "info",
    title = 'Notifikasi',
    msg, 
    onCancel, 
    onAccept, 
    cancelText = "Tidak",
    acceptText = "Ya",
    isConfirmation = false,
    isAlert = false,
}){

    let bgColor, textColor, icon;
    switch (alertType) {
        case "success":
            bgColor = "bg-green-500"; textColor = "text-white"; icon = faCheck; break;
        case "info":
            bgColor = "bg-blue-500"; textColor = "text-white"; icon = faInfo; break;
        case "warning":
            bgColor = "bg-yellow-500"; textColor = "text-white"; icon = faExclamation; break;
        case "danger":
            bgColor = "bg-red-500"; textColor = "text-white"; icon = faX; break;
        case "confirmation":
            bgColor = "bg-gray-800"; textColor = "text-white"; icon = faQuestion; break;
        default:
            bgColor = "bg-gray-500"; textColor = "text-white"; icon = faBell;
    }

    if(!isConfirmation){
        return (
            <motion.div
                key="alert"
                initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
            >   
                <div className="w-1/3 bg-white px-6 pt-8 pb-6 rounded-xl flex flex-col drop-shadow-lg will-change-auto">
                    <div className="flex flex-col w-full pb-1 gap-3">
                        <div className="relative flex items-center justify-center w-10 h-10">
                            <div className={`${bgColor} p-3 aspect-square rounded-full animate-ping w-8 h-8 absolute z-0 flex items-center justify-center`}>
                                <FontAwesomeIcon className={`text-sm ${textColor}`} icon={icon} />
                            </div>
                            <div className={`${bgColor} p-3 aspect-square rounded-full w-10 h-10 z-20 relative flex items-center justify-center`}>
                                <FontAwesomeIcon className={`text-sm ${textColor}`} icon={icon} />
                            </div>
                        </div>
                        <p className="font-medium text-xl">{ title }</p>
                    </div>

                    <p className="pb-2">{ msg }</p>

                    { !isAlert && 
                        <div className="flex gap-3">
                            <button onClick={() => onCancel()} className="bg-foreground/90 hover:bg-foreground text-white text-md px-5 py-2 rounded-lg font-medium mt-1 transition-colors duration-300 ease-in-out cursor-pointer">
                                Oke
                            </button>
                        </div>
                    }
                </div>
            </motion.div>
        )
    }
    else{
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-1/3 bg-white px-6 pt-8 pb-6 rounded-xl flex flex-col drop-shadow-lg will-change-auto"
                >  
                    <div className="flex flex-col w-full pb-1 gap-3">
                        <div className="relative flex items-center justify-center w-10 h-10">
                            <div className={`${bgColor} p-3 aspect-square rounded-full animate-ping w-8 h-8 absolute z-0 flex items-center justify-center`}>
                                <FontAwesomeIcon className={`text-sm ${textColor}`} icon={icon} />
                            </div>
                            <div className={`${bgColor} p-3 aspect-square rounded-full w-10 h-10 z-20 relative flex items-center justify-center`}>
                                <FontAwesomeIcon className={`text-sm ${textColor}`} icon={icon} />
                            </div>
                        </div>
                        <p className="font-medium text-xl">{ title }</p>
                    </div>

                    <p className="pb-5">{ msg }</p>

                    <div className="flex gap-2">
                        <button onClick={() => onCancel()} className="w-1/2 border-2 border-foreground/90 hover:border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-white text-md px-5 py-2 rounded-lg font-medium mt-1 transition-colors duration-300 ease-in-out cursor-pointer">
                            { cancelText }
                        </button>
                        <button onClick={() => onAccept()} className="w-1/2 bg-foreground/90 hover:bg-foreground text-white text-md px-5 py-2 rounded-lg font-medium mt-1 transition-colors duration-300 ease-in-out cursor-pointer">
                            { acceptText }
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        )
    }
}
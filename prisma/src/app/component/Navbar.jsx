import Image from "next/image"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons"

export default function Navbar({ setActive, modules, onLogout, mode = 'normal2' }){
    return (
        <div className="w-16 h-screen top-0 bottom-0 left-0 z-20 bg-white drop-shadow-lg flex flex-col items-center fixed">
            <div id="logo" className="aspect-square flex items-center justify-center border-b border-gray-200 w-full p-3">
                <Image
                    src="/img/icon.webp"
                    width={50}
                    height={50}
                    className="relative"
                />
            </div>

            <div id="navbar-menu" className="flex flex-col items-center h-full w-full p-2.5 gap-2">
                {modules.map(module => (
                    <div
                        key={module.key}
                        onClick={() => setActive(module.key)}
                        className="relative w-full group"
                    >
                        <div className="bg-white hover:bg-gray-200 w-full aspect-square flex items-center justify-center transition-colors duration-300 not-first-of-type:ease-in-out rounded-md">
                            <FontAwesomeIcon icon={module.icon} className="text-gray-500 text-lg" />
                        </div>
                        <div className="absolute top-1/6 left-full whitespace-nowrap translate-0 opacity-0 group-hover:translate-x-2 group-hover:opacity-100 bg-foreground/90 rounded-md px-3 py-1 text-sm items-center justify-center transition-all duration-300 ease-in-out">
                            <p className="w-full text-white">{module.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div id="logout-section" className="aspect-square flex flex-col items-center w-full p-2.5 gap-2">
                <div
                    onClick={() => onLogout()}
                    className="relative w-full group"
                >
                    <div className="bg-white hover:bg-gray-200 w-full aspect-square flex items-center justify-center transition-colors duration-300 not-first-of-type:ease-in-out rounded-md">
                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-red-600 text-lg" />
                    </div>
                    <div className="absolute top-1/6 left-full whitespace-nowrap translate-0 opacity-0 group-hover:translate-x-2 group-hover:opacity-100 bg-foreground/90 rounded-md px-3 py-1 text-sm items-center justify-center transition-all duration-300 ease-in-out">
                        <p className="w-full text-white">Logout</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
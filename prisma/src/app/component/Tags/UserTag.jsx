import Image from "next/image";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function UserTag({ img, name, readOnly = false, onRemove }){
    return(
        <div className="border border-gray-300 has-[span:hover]:border-red-700 duration-200 ease-in-out transition-color p-1.5 rounded-full flex items-center gap-2 w-fit">
            <Image
                src={`${img}`}
                width={20}
                height={20}
                className="relative rounded-full"
                alt={name || ""}
                unoptimized
            />

            <p className="text-xs">{ name }</p>

            {
                readOnly && 
                    <span className="ml-2 bg-gray-300 hover:bg-red-700 duration-200 ease-in-out transition-color rounded-full aspect-square p-1 flex items-center justify-center" onClick={() => onRemove()}>
                        <FontAwesomeIcon icon={faX} className="text-white text-[8px]" />
                    </span>
            }
        </div>
    )
}
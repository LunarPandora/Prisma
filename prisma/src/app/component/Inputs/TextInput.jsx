import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export default function TextInput({ icon, tag, className, isTextArea = false, error, required, helperText, ...props }){
    return (
        <div className={`w-full relative ${className}`}>
            <span className={`text-xs ${error ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                { tag ? tag : props.placeholder }
                { required && <span className="text-red-500 ml-0.5">*</span> }
            </span>

            <div className={`
                w-full flex flex-col justify-center border-[0.5px] rounded-lg p-3 mt-1 gap-2 transition-all duration-300 ease-in-out

                ${isTextArea ? 'h-fit' : ''}
                
                ${props.disabled
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70'
                    : error
                        ? 'border-red-400 focus-within:border-red-500 focus-within:outline-4 outline-transparent focus-within:outline-red-200'
                        : 'border-gray-300 focus-within:border-black focus-within:outline-4 outline-transparent focus-within:outline-black/20 cursor-pointer'
                }
            `}>
                <div className={`flex w-full gap-2 ${isTextArea ? 'items-stretch' : 'items-center'}`}>
                    { icon &&
                        <FontAwesomeIcon icon={icon} className="text-gray-500 text-md" />
                    }

                    {!isTextArea ? 
                        <input 
                            className="w-full text-sm focus:outline-none disabled:cursor-not-allowed" 
                            aria-invalid={!!error}
                            aria-describedby={error ? `${props.name}-error` : helperText ? `${props.name}-helper` : undefined}
                            {...props}
                        />
                        :
                        <textarea 
                            className="w-full text-sm focus:outline-none h-full max-h-16 disabled:cursor-not-allowed"
                            aria-invalid={!!error}
                            aria-describedby={error ? `${props.name}-error` : helperText ? `${props.name}-helper` : undefined}
                            {...props}
                        ></textarea>
                    }
                </div>
            </div>

            {error && (
                <p id={`${props.name}-error`} className="text-red-500 text-xs mt-1">{error}</p>
            )}

            {!error && helperText && (
                <p id={`${props.name}-helper`} className="text-gray-400 text-xs mt-1">{helperText}</p>
            )}
        </div>
        
    )
}
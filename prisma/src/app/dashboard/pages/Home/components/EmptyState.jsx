import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInbox } from "@fortawesome/free-solid-svg-icons"

export default function EmptyState({ icon = faInbox, message = "Tidak ada data" }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <FontAwesomeIcon icon={icon} className="text-2xl mb-2" />
            <p className="text-sm">{message}</p>
        </div>
    )
}

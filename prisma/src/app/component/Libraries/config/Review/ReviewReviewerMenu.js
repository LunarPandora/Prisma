import { faClipboardList } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createReviewReviewerMenus = ({
    user,
    access,
    reviewType,
    handleShow,
    handlePenugasan,
    handleTolak
}) => {

    const canStartReview = (r) => {
        if (!access.create) return false

        if (reviewType === "laporan") {
            const myPenugasan = (r.penugasan || []).find(
                p => p.user_id === user?.id
            )
            return myPenugasan && myPenugasan.status_review === "Belum direview"
        }

        return r.status === "Belum direview"
    }

    const isReviewable = (r) => {
        if (reviewType === "laporan") {
            const myPenugasan = (r.penugasan || []).find(
                p => p.user_id === user?.id
            )
            return !!myPenugasan
        }

        return true
    }

    return {
        main: [],

        row: [
            group(
                [
                    item("Mulai penilaian", handleShow, {
                        icon: faClipboardList,
                        enabled: canStartReview,
                    }),
                ],
                {
                    hidden: (r) => !isReviewable(r)
                }
            )
        ]
    }
}

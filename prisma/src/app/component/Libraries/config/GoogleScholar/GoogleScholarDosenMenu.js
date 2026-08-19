import { faChartLine } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createGoogleScholarDosenMenus = ({
    onViewCitationHistory,
}) => ({
    main: [],

    row: [
        group([
            item("Lihat Riwayat Sitasi", onViewCitationHistory, { icon: faChartLine }),
        ]),
    ]
})

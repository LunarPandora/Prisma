import { faPaperPlane, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createDanaAdminMenus = ({
    mode,
    access,
    handleUploadBuktiTransfer,
    handleRequestPengembalian,
}) => {

    const claimGroup = group(
        [
            item("Upload Bukti Transfer", handleUploadBuktiTransfer, {
                icon: faCloudArrowUp,
                enabled: (r) =>
                    access?.update &&
                    !r.claim_dana_status
            }),
        ]
    )

    const pengembalianGroup = group(
        [
            item("Minta Pengembalian Dana", handleRequestPengembalian, {
                icon: faPaperPlane,
                enabled: (r) =>
                    access?.update &&
                    !r.pengembalian_dana_status
            }),
        ]
    )

    return {
        main: [],
        row: [
            mode === "pengembalian" ? pengembalianGroup : claimGroup,
        ]
    }
}

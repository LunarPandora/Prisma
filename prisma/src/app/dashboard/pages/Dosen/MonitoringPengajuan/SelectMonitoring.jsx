

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function SelectMonitoring({ skema, setView, onBack }) {
    return (
        <div className="flex flex-col gap-5 min-h-screen">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                    onClick={onBack}
                    className="hover:text-black"
                >
                    Monitoring Progress
                </button>
                <span>›</span>
                <span>{skema.nama_skema}</span>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-medium">
                    Pilih pengajuan
                </h1>

                <p className="text-lg text-gray-500 font-light">
                    Pilih bentuk pengajuan / pengerjaan yang ingin di monitor
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button
                    className="
                        bg-white
                        rounded-lg
                        border
                        shadow
                        p-6
                        flex
                        items-start
                        gap-4
                        text-left
                        hover:bg-gray-50
                        hover:shadow-md
                        hover:scale-[1.01]
                        hover:border-blue-300
                        transition-all
                        duration-200
                        cursor-pointer
                    "
                    onClick={() => setView("proposal")}
                >
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon
                            icon={faFileLines}
                            className="text-blue-600 text-xl"
                        />
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-lg font-medium">Proposal</h3>

                        <p className="text-sm text-gray-500">
                            Monitoring pengajuan, seleksi, dan pengumuman proposal penelitian
                            maupun PkM.
                        </p>
                    </div>
                </button>
                <button
                    className="
                        bg-white
                        rounded-lg
                        border
                        shadow
                        p-6
                        flex
                        items-start
                        gap-4
                        text-left
                        hover:bg-gray-50
                        hover:shadow-md
                        hover:scale-[1.01]
                        hover:border-blue-300
                        transition-all
                        duration-200
                        cursor-pointer
                    "
                    onClick={() => setView("laporan")}
                >
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon
                            icon={faClipboardCheck}
                            className="text-green-600 text-xl"
                        />
                    </div>

                    <div className="flex flex-col">
                        <h3 className="text-lg font-medium">Laporan</h3>

                        <p className="text-sm text-gray-500">
                            Monitoring laporan kemajuan, laporan akhir, dan luaran penelitian
                            maupun PkM.
                        </p>
                    </div>
                </button>
            </div>
        </div>
        
    );
}

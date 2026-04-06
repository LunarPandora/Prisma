import { useState } from "react";
import SelectInput from "@/app/component/Inputs/SelectInput";
import { faTag } from "@fortawesome/free-solid-svg-icons";

export default function MonitoringPengajuan(){
    const defaultForm = {
        status: "",
    }

    const [form, setForm] = useState(defaultForm)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div 
            className="flex flex-col gap-5 min-h-screen"
            // onContextMenu={(e) => {
            //     e.preventDefault();

            //     setContextMenu({
            //         x: e.clientX,
            //         y: e.clientY,
            //         type: "main",
            //         data: null,
            //     });
            // }}
        >
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">Monitoring Pengajuan</h1>
                    <p className="text-lg text-gray-500 font-light">Cek progress pengajuan dari dosen disini.</p>
                </div>

                <SelectInput
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={[
                        {text: "option1", value: 1},
                        {text: "option2", value: 2},
                        {text: "option3", value: 3},
                    ]}
                    icon={faTag}
                    placeholder="Pilih status penelitian"
                />
            </div>
        </div>
    )
}
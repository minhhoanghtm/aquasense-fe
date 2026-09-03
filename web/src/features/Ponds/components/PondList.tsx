import { useState } from "react";
import PondListItem from "../../../components/PondListItem";
import { Droplets } from "lucide-react";


type Pond = {
    id: string;
    name: string;
    area: number;
    density: string;
    status: "NORMAL" | "WARNING" | "DANGER";
};

const data: Pond[] = [
    {
        id: "1",
        name: "Vuông A1 - Cà Mau",
        area: 2.4,
        density: "180 PL/m²",
        status: "NORMAL",
    },
    {
        id: "2",
        name: "Vuông B2 - Cà Mau",
        area: 1.8,
        density: "160 PL/m²",
        status: "WARNING",
    },
    {
        id: "3",
        name: "Vuông C1 - Bạc Liêu",
        area: 3.1,
        density: "200 PL/m²",
        status: "NORMAL",
    },
    {
        id: "4",
        name: "Vuông D3 - Sóc Trăng",
        area: 2.0,
        density: "140 PL/m²",
        status: "DANGER",
    },
    {
        id: "2",
        name: "Vuông B2 - Cà Mau",
        area: 1.8,
        density: "160 PL/m²",
        status: "WARNING",
    },
    {
        id: "3",
        name: "Vuông C1 - Bạc Liêu",
        area: 3.1,
        density: "200 PL/m²",
        status: "NORMAL",
    },
    {
        id: "4",
        name: "Vuông D3 - Sóc Trăng",
        area: 2.0,
        density: "140 PL/m²",
        status: "DANGER",
    },
    {
        id: "2",
        name: "Vuông B2 - Cà Mau",
        area: 1.8,
        density: "160 PL/m²",
        status: "WARNING",
    },
    {
        id: "3",
        name: "Vuông C1 - Bạc Liêu",
        area: 3.1,
        density: "200 PL/m²",
        status: "NORMAL",
    },
    {
        id: "4",
        name: "Vuông D3 - Sóc Trăng",
        area: 2.0,
        density: "140 PL/m²",
        status: "DANGER",
    },
    {
        id: "2",
        name: "Vuông B2 - Cà Mau",
        area: 1.8,
        density: "160 PL/m²",
        status: "WARNING",
    },
    {
        id: "3",
        name: "Vuông C1 - Bạc Liêu",
        area: 3.1,
        density: "200 PL/m²",
        status: "NORMAL",
    },
    {
        id: "4",
        name: "Vuông D3 - Sóc Trăng",
        area: 2.0,
        density: "140 PL/m²",
        status: "DANGER",
    },
    {
        id: "2",
        name: "Vuông B2 - Cà Mau",
        area: 1.8,
        density: "160 PL/m²",
        status: "WARNING",
    },
    {
        id: "3",
        name: "Vuông C1 - Bạc Liêu",
        area: 3.1,
        density: "200 PL/m²",
        status: "NORMAL",
    },
    {
        id: "4",
        name: "Vuông D3 - Sóc Trăng",
        area: 2.0,
        density: "140 PL/m²",
        status: "DANGER",
    },
];

export default function PondList() {
    const [selectedId, setSelectedId] = useState<string>("1");

    return (
        <div className="w-full rounded-3xl border border-(--panel-border) bg-(--bg-primary) p-6 shadow-lg">
            {/* Header */}
            <div className="flex flex-col items-start justify-between mb-4">
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-bold text-(--text-heading)">
                        Danh sách vuông nuôi
                    </h2>

                    <Droplets className="text-(--accent)" />
                </div>

                <p className="text-xs text-(--text-muted) font-light">
                    {data.length} vuông hoạt động · tổng 9.3 ha
                </p>
            </div>

            {/* Danh sách có scroll */}
            <div className="max-h-[337px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {data.map((pond, index) => (
                    <PondListItem
                        key={`${pond.id}-${index}`}
                        pond={pond}
                        isSelected={pond.id === selectedId}
                        onClick={(p) => setSelectedId(p.id)}
                    />
                ))}
            </div>
        </div>
    );
}
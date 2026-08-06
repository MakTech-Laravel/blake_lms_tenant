import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { ChartPoint, DonutSlice } from '@/data/aquacert-fixtures';
import { SectionCard } from '@/components/aquacert/section-card';

type AreaChartCardProps = {
    title: string;
    data: ChartPoint[];
    dataKey?: string;
    secondaryKey?: string;
    action?: React.ReactNode;
};

export function AreaChartCard({
    title,
    data,
    dataKey = 'value',
    secondaryKey,
    action,
}: AreaChartCardProps) {
    return (
        <SectionCard title={title} action={action}>
            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="aquaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ab1b9" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#0ab1b9" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ed" />
                        <XAxis dataKey="name" tick={{ fill: '#8b9bae', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#8b9bae', fontSize: 12 }} />
                        <Tooltip />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke="#0ab1b9"
                            fill="url(#aquaFill)"
                            strokeWidth={2}
                        />
                        {secondaryKey && (
                            <Area
                                type="monotone"
                                dataKey={secondaryKey}
                                stroke="#03264e"
                                fill="transparent"
                                strokeWidth={2}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </SectionCard>
    );
}

type DonutChartCardProps = {
    title: string;
    data: DonutSlice[];
    centerLabel?: string;
};

export function DonutChartCard({ title, data, centerLabel }: DonutChartCardProps) {
    const total = data.reduce((sum, slice) => sum + slice.value, 0);

    return (
        <SectionCard title={title}>
            <div className="flex h-56 items-center gap-4">
                <div className="relative h-full min-w-0 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={2}
                            >
                                {data.map((slice) => (
                                    <Cell key={slice.name} fill={slice.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-h5 font-bold text-navy-500">
                            {centerLabel ?? total}
                        </span>
                    </div>
                </div>
                <ul className="space-y-2">
                    {data.map((slice) => (
                        <li key={slice.name} className="flex items-center gap-2 text-body-4">
                            <span
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: slice.color }}
                            />
                            <span className="text-navy-400">{slice.name}</span>
                            <span className="font-semibold text-navy-500">{slice.value}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </SectionCard>
    );
}

type BarChartCardProps = {
    title: string;
    data: ChartPoint[];
    action?: React.ReactNode;
};

export function BarChartCard({ title, data, action }: BarChartCardProps) {
    return (
        <SectionCard title={title} action={action}>
            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ed" />
                        <XAxis dataKey="name" tick={{ fill: '#8b9bae', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#8b9bae', fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.name}
                                    fill={index % 2 === 0 ? '#0ab1b9' : '#03264e'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </SectionCard>
    );
}

'use client';

import React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';

const MedicalHistory = () => {
    const data = React.useMemo(
        () => [
            { date: '01/01/2025', doctor: 'Dr. Teerapat', specialty: 'Neurology and Stroke', diagnosis: 'Stroke' },
            { date: '09/10/2024', doctor: 'Dr. Naree', specialty: 'Internal Medicine', diagnosis: 'Tuberculosis' },
            { date: '12/05/2023', doctor: 'Dr. Bukoree', specialty: 'Internal Medicine', diagnosis: 'Chronic Bronchitis' },
            { date: '05/12/2022', doctor: 'Dr. John', specialty: 'Internal Medicine', diagnosis: 'Asthma' },
            { date: '07/10/2022', doctor: 'Dr. Joel', specialty: 'Neurology', diagnosis: 'Chronic Migraine' },
        ],
        []
    );

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'date',
                header: 'Date',
            },
            {
                accessorKey: 'doctor',
                header: 'Doctor',
            },
            {
                accessorKey: 'specialty',
                header: 'Specialty',
            },
            {
                accessorKey: 'diagnosis',
                header: 'Diagnosis',
            },
        ],
        []
    );

    const [sorting, setSorting] = React.useState([]);

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg border">

            <div className="bg-blue-200 text-white py-4 px-6 rounded-lg shadow mb-6 text-center">
                <h2 className="text-3xl text-black font-bold tracking-wide">Medical History</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className="bg-gray-100">
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700 cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-3">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <button
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="flex flex-col items-center justify-center w-6 h-10  transition-all duration-200"
                                                title="Sort"
                                            >
                                                <span
                                                    className={`text-xs leading-none ${header.column.getIsSorted() === 'asc'
                                                        ? 'text-blue-500 font-bold'
                                                        : 'text-gray-400'
                                                        }`}
                                                >
                                                    ▲
                                                </span>
                                                <span
                                                    className={`text-xs leading-none ${header.column.getIsSorted() === 'desc'
                                                        ? 'text-blue-500 font-bold'
                                                        : 'text-gray-400'
                                                        }`}
                                                >
                                                    ▼
                                                </span>
                                            </button>
                                        </div>

                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="even:bg-gray-50">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="border border-gray-300 px-4 py-2 text-gray-600">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MedicalHistory;

import React, { useEffect, useState } from 'react';
import { ReportData } from '../../types';
import { getReportData } from '../../services/mockApi';

const Reports: React.FC = () => {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            setIsLoading(true);
            const data = await getReportData();
            setReportData(data);
            setIsLoading(false);
        };
        fetchReports();
    }, []);

    const exportToCSV = () => {
        if (!reportData) return;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric,Value\r\n";
        csvContent += `Total Appointments,${reportData.totalAppointments}\r\n`;
        csvContent += `Attendance Rate (%),${reportData.attendanceRate.toFixed(2)}\r\n`;
        csvContent += `No-Show Rate (%),${reportData.noShowRate.toFixed(2)}\r\n\r\n`;
        
        csvContent += "Appointments by Service\r\n";
        csvContent += "Service,Count\r\n";
        Object.entries(reportData.appointmentsByService).forEach(([key, value]) => {
            csvContent += `${key},${value}\r\n`;
        });
        csvContent += "\r\n";

        csvContent += "Appointments by Day of Week\r\n";
        csvContent += "Day,Count\r\n";
        Object.entries(reportData.busiestDays).forEach(([key, value]) => {
            csvContent += `${key},${value}\r\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "nexsched_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (isLoading) {
        return <p>Generating reports...</p>;
    }

    if (!reportData) {
        return <p>Could not load report data.</p>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Clinic Performance Report</h2>
                <button onClick={exportToCSV} className="px-4 py-2 bg-brand-blue text-white text-sm font-semibold rounded-lg shadow-md hover:bg-brand-blue-dark">
                    Export to CSV
                </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-brand-gray-light p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Total Appointments</p>
                    <p className="text-3xl font-bold text-brand-blue-dark">{reportData.totalAppointments}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.attendanceRate.toFixed(1)}%</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-600">No-Show Rate</p>
                    <p className="text-3xl font-bold text-red-600">{reportData.noShowRate.toFixed(1)}%</p>
                </div>
            </div>

            {/* Charts/Data Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold mb-4 text-gray-700">Appointments by Service</h3>
                    <div className="space-y-4">
                        {Object.entries(reportData.appointmentsByService).sort(([, a], [, b]) => Number(b) - Number(a)).map(([service, count]) => {
                            const c = count as number;
                            const max = Math.max(...(Object.values(reportData.appointmentsByService) as number[]), 1);
                            const percentage = (c / max) * 100;
                            return (
                                <div key={service} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-gray-500">
                                        <span>{service}</span>
                                        <span>{c}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div 
                                            className="bg-brand-blue h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-semibold mb-4 text-gray-700">Busiest Days</h3>
                    <div className="space-y-4">
                        {Object.entries(reportData.busiestDays).sort(([, a], [, b]) => Number(b) - Number(a)).map(([day, count]) => {
                            const c = count as number;
                            const max = Math.max(...(Object.values(reportData.busiestDays) as number[]), 1);
                            const percentage = (c / max) * 100;
                            return (
                                <div key={day} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium text-gray-500">
                                        <span>{day}</span>
                                        <span>{c}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div 
                                            className="bg-brand-blue h-2 rounded-full transition-all duration-500" 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

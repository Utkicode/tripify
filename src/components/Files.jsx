import React, { useState } from 'react';
import { UploadCloud, FileText, Image, Paperclip, MoreVertical, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Files = () => {
    const [files, setFiles] = useState([
        { id: 1, name: 'Flight_Tickets_Paris.pdf', type: 'pdf', size: '2.4 MB', date: '2024-05-12' },
        { id: 2, name: 'Hotel_Booking_Confirmation.png', type: 'image', size: '1.8 MB', date: '2024-05-13' },
        { id: 3, name: 'Itinerary_Draft_v2.docx', type: 'doc', size: '0.5 MB', date: '2024-05-14' },
    ]);

    const getIcon = (type) => {
        if (type === 'pdf') return <FileText className="text-red-500" />;
        if (type === 'image') return <Image className="text-blue-500" />;
        return <Paperclip className="text-slate-500" />;
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer mb-8 group">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Upload Documents</h3>
                <p className="text-slate-500 text-sm mb-4">Drag & drop files here, or click to select</p>
                <button className="btn-secondary mx-auto text-sm py-2 px-4 shadow-none">
                    Browse Files
                </button>
            </div>

            {/* File List */}
            <h3 className="text-lg font-bold text-slate-800 mb-4">Attached Files ({files.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg shrink-0">
                                {getIcon(file.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-800 truncate" title={file.name}>{file.name}</p>
                                <p className="text-xs text-slate-400 mt-1">{file.size} • {file.date}</p>
                            </div>
                            <button className="text-slate-300 hover:text-slate-600">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Download">
                                <Download size={20} />
                            </button>
                            <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Files;

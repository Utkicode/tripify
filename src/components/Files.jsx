import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Image, Paperclip, MoreVertical, Download, Trash2, X, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db, storage } from '../firebase';
import { appId } from '../constants';

const Files = ({ user, tripId }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // --- Real-time File Sync ---
    useEffect(() => {
        if (!user || !tripId) return;

        const q = query(
            collection(db, 'artifacts', appId, 'trips', tripId, 'files'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const filesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFiles(filesData);
        }, (error) => {
            console.error("Error fetching files:", error);
        });

        return () => unsubscribe();
    }, [user, tripId]);

    // --- File Upload Logic ---
    const handleFile = async (file) => {
        if (!file) return;

        // Validations (e.g., size limit 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File is too large (Max 10MB)');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // 1. Upload to Firebase Storage
            // Keep using user/trip structure for organization, or switch to trip/file? 
            // Let's migrate to trip centric: trips/{tripId}/files/{name}
            // But for now, to ensure we don't break permissions if rules rely on user, we can keep it?
            // Actually, for consistency, let's use the trip ID in storage too if possible, but strict user rules might block us.
            // Let's stick to the current storage path for safety, but update the FIRESTORE path for sharing.
            const storageRef = ref(storage, `users/${user.uid}/trips/${tripId}/files/${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload error:", error);
                    setUploading(false);
                    alert("Upload failed. Make sure Storage is enabled in Firebase Console.");
                },
                async () => {
                    // 2. Get Download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // 3. Save Metadata to Firestore (Global)
                    await addDoc(collection(db, 'artifacts', appId, 'trips', tripId, 'files'), {
                        name: file.name,
                        type: file.type,
                        size: formatBytes(file.size),
                        url: downloadURL,
                        storagePath: uploadTask.snapshot.ref.fullPath,
                        uploadedBy: user.uid, // Track uploader
                        createdAt: Date.now(),
                        date: new Date().toLocaleDateString()
                    });

                    setUploading(false);
                    setUploadProgress(0);
                }
            );
        } catch (error) {
            console.error("Error starting upload:", error);
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDelete = async (file) => {
        if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

        try {
            // 1. Delete from Storage
            const storageRef = ref(storage, file.storagePath);
            await deleteObject(storageRef);

            // 2. Delete from Firestore (Global)
            await deleteDoc(doc(db, 'artifacts', appId, 'trips', tripId, 'files', file.id));
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file. Check permissions.");
        }
    };

    // --- Helpers ---
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const getIcon = (type) => {
        if (type.includes('pdf')) return <FileText className="text-red-500" />;
        if (type.includes('image')) return <Image className="text-blue-500" />;
        return <Paperclip className="text-slate-500" />;
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Upload Zone */}
            <div
                className={`border-3 border-dashed rounded-[3rem] p-12 text-center transition-all cursor-pointer mb-10 group relative overflow-hidden ${dragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-slate-200/60 bg-white/40 hover:bg-white/60 hover:border-slate-300'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm -z-10"></div>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                />

                {uploading ? (
                    <div className="flex flex-col items-center py-4">
                        <Loader className="animate-spin text-blue-600 mb-6" size={40} />
                        <p className="text-slate-800 font-bold text-lg">Uploading your files...</p>
                        <p className="text-slate-500 text-sm font-medium mb-6">{Math.round(uploadProgress)}% Complete</p>
                        <div className="w-80 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-4">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">
                            <UploadCloud size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Upload Trip Documents</h3>
                        <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">Drag & drop your tickets, bookings, and IDs here, or click to browse.</p>
                        <button className="bg-slate-900 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-slate-900/20 group-hover:bg-blue-600 group-hover:shadow-blue-500/30 transition-all pointer-events-none">
                            Select Files
                        </button>
                    </div>
                )}
            </div>

            {/* File List */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    Attached Files <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">{files.length}</span>
                </h3>
            </div>

            {files.length === 0 && !uploading && (
                <div className="text-center py-20 bg-white/30 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No documents attached yet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                    {files.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className="bg-white/90 backdrop-blur-xl p-5 rounded-[2rem] border border-white/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-200/20 hover:-translate-y-1 transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4 z-10 relative">
                                <div className="p-4 bg-slate-50 rounded-[1.2rem] shrink-0 shadow-sm group-hover:bg-blue-50 transition-colors">
                                    {getIcon(file.type)}
                                </div>
                                <div className="min-w-0 flex-1 text-left pt-1">
                                    <p className="font-bold text-slate-900 truncate text-lg leading-tight mb-1" title={file.name}>{file.name}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{file.size} • {file.date}</p>
                                </div>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform"
                                    title="Download"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download size={22} />
                                </a>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                                    className="p-3 bg-white text-red-500 border-2 border-red-50 rounded-2xl hover:bg-red-50 hover:border-red-100 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={22} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Files;

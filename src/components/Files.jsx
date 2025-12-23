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
        <div className="max-w-4xl mx-auto pb-12">
            {/* Upload Zone */}
            <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-8 group relative ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                />

                {uploading ? (
                    <div className="flex flex-col items-center">
                        <Loader className="animate-spin text-blue-500 mb-4" size={32} />
                        <p className="text-slate-600 font-medium">Uploading... {Math.round(uploadProgress)}%</p>
                        <div className="w-64 h-2 bg-slate-200 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Upload Documents</h3>
                        <p className="text-slate-500 text-sm mb-4">Drag & drop files here, or click to select</p>
                        <button className="btn-secondary mx-auto text-sm py-2 px-4 shadow-none pointer-events-none">
                            Browse Files
                        </button>
                    </>
                )}
            </div>

            {/* File List */}
            <h3 className="text-lg font-bold text-slate-800 mb-4">Attached Files ({files.length})</h3>

            {files.length === 0 && !uploading && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-400">No files uploaded yet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {files.map((file) => (
                        <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            layout
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg shrink-0">
                                    {getIcon(file.type)}
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                    <p className="font-semibold text-slate-800 truncate" title={file.name}>{file.name}</p>
                                    <p className="text-xs text-slate-400 mt-1">{file.size} • {file.date}</p>
                                </div>
                                <button className="text-slate-300 hover:text-slate-600">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Download"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download size={20} />
                                </a>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={20} />
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

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Resume } from '../types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Edit3,
  Trash2,
} from 'lucide-react';
import { SkillBadge } from '../components/common/SkillBadge';

export const ResumeUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [parsedResume, setParsedResume] = useState<Resume | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Invalid file format. Please upload a PDF or DOCX file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File exceeds maximum 5MB size limit.');
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    try {
      const res = await api.uploadResume(file);
      setParsedResume(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveParsedEdits = async () => {
    if (!parsedResume) return;
    try {
      const updated = await api.updateResumeParsedData(parsedResume.id, parsedResume.parsed_data);
      setParsedResume(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError('Failed to update resume details.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">Upload & Parse Resume</h1>
        <p className="text-xs text-slate-400">
          Upload your resume in PDF or DOCX format for automatic information extraction and skill recognition.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      {!parsedResume ? (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
              file
                ? 'border-brand-500 bg-brand-500/5'
                : 'border-slate-700/80 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-400">Supports PDF and DOCX documents (Up to 5MB)</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            {file && (
              <button
                onClick={() => setFile(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-90 shadow-glow-brand flex items-center gap-2 disabled:opacity-40 transition"
            >
              {uploading ? 'Parsing Resume with NLP...' : 'Extract Resume Information'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Parsed Review Section */
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl glass-panel-glow flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Extraction Complete</h3>
                <p className="text-xs text-slate-400">
                  {parsedResume.file_name} • Completeness Score: {parsedResume.completeness_score}%
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditing ? 'Cancel Edit' : 'Edit Extracted Data'}
              </button>
              <button
                onClick={() => navigate('/jobs/new')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand flex items-center gap-1.5 transition"
              >
                Match Against Job
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Candidate Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Full Name</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={parsedResume.parsed_data.contact.full_name || ''}
                    onChange={(e) =>
                      setParsedResume({
                        ...parsedResume,
                        parsed_data: {
                          ...parsedResume.parsed_data,
                          contact: { ...parsedResume.parsed_data.contact, full_name: e.target.value },
                        },
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                ) : (
                  <span className="font-semibold text-white">
                    {parsedResume.parsed_data.contact.full_name || 'Not detected'}
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Email Address</span>
                <span className="font-semibold text-white">
                  {parsedResume.parsed_data.contact.email || 'Not detected'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block mb-1">Phone Number</span>
                <span className="font-semibold text-white">
                  {parsedResume.parsed_data.contact.phone || 'Not detected'}
                </span>
              </div>
            </div>
          </div>

          {/* Extracted Skills Card */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Detected Technical Skills ({parsedResume.skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {parsedResume.skills.map((skill) => (
                <SkillBadge
                  key={skill.id}
                  name={skill.skill_name}
                  category={skill.category}
                  type="matched"
                  evidence={skill.evidence_text}
                />
              ))}
            </div>
          </div>

          {/* Experience Highlights */}
          <div className="p-6 rounded-3xl glass-panel space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Work Experience ({parsedResume.parsed_data.experience?.length || 0})
            </h3>
            <div className="space-y-3">
              {parsedResume.parsed_data.experience?.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white">{exp.title_company || 'Experience Entry'}</h4>
                    <span className="text-[11px] text-slate-400">{exp.date_range}</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {exp.responsibilities.slice(0, 3).map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveParsedEdits}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald transition"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

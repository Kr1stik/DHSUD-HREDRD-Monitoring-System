import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { CloseIcon } from './Icons';
import { initialOptions, initialNirLocations, type Application } from '../utils/constants';

// 🌐 API CONFIGURATION
const API_URL = '/api/applications/';

const ProjectFormModal = ({ 
  appToEdit, 
  onClose, 
  onSave, 
  showNotification, 
  requestConfirm,
  handleExport
}: { 
  appToEdit: Application | null, 
  onClose: () => void, 
  onSave: () => void,
  showNotification: any,
  requestConfirm: any,
  handleExport: (format: 'xlsx' | 'csv') => void
}) => {
  
  const [activeTab, setActiveTab] = useState<'form' | 'import'>(appToEdit ? 'form' : 'form');
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const emptyForm = {
    name_of_proj: '', proj_owner_dev: '', status_of_application: 'Ongoing', type_of_application: 'New Application', 
    cr_nos: [''], ls_nos: [''],
    proj_type: '', main_or_compliance: 'Main', date_filed: '', date_issued: '', date_completion: '', prov: '', mun_city: '', street_brgy: '', crls_options: [] as string[],
    drive_link: ''
  };

  const [formData, setFormData] = useState(() => {
    if (appToEdit) {
      return {
        ...appToEdit,
        cr_nos: appToEdit.cr_no ? appToEdit.cr_no.split(', ') : [''],
        ls_nos: appToEdit.ls_no ? appToEdit.ls_no.split(', ') : ['']
      }
    }
    return emptyForm;
  });

  const [locationDB, setLocationDB] = useState<Record<string, Record<string, string[]>>>(() => {
    const saved = localStorage.getItem('dhsud_custom_locations');
    return saved ? JSON.parse(saved) : initialNirLocations;
  });

  const [formOptions, setFormOptions] = useState(() => {
    const saved = localStorage.getItem('dhsud_custom_options');
    return saved ? JSON.parse(saved) : initialOptions;
  });

  const [promptDialog, setPromptDialog] = useState({ show: false, title: '', message: '', placeholder: '', action: null as any });
  const [promptValue, setPromptValue] = useState('');

  useEffect(() => { localStorage.setItem('dhsud_custom_locations', JSON.stringify(locationDB)); }, [locationDB]);
  useEffect(() => { localStorage.setItem('dhsud_custom_options', JSON.stringify(formOptions)); }, [formOptions]);

  const availableProvinces = Object.keys(locationDB);
  const availableCities = formData.prov ? Object.keys(locationDB[formData.prov] || {}).sort() : [];
  const availableBarangays = (formData.prov && formData.mun_city) ? (locationDB[formData.prov][formData.mun_city] || []).sort() : [];

  const handleAddOption = (category: string, title: string) => {
    setPromptValue('');
    setPromptDialog({
      show: true, title: `Add ${title}`, message: `Add a new custom option for ${title}.`, placeholder: `e.g. New ${title}`,
      action: (newVal: string) => {
        if (newVal && newVal.trim() !== '') {
          const cleanVal = newVal.trim();
          if (!formOptions[category as keyof typeof formOptions].includes(cleanVal)) {
            setFormOptions((prev: any) => ({ ...prev, [category]: [...prev[category as keyof typeof formOptions], cleanVal] }));
            showNotification(`Added ${cleanVal}!`, "success");
          }
        }
      }
    });
  };

  const handleDeleteOption = (category: string, title: string, targetValue: string, formField: string) => {
    if (!targetValue) return;
    requestConfirm("Delete Option", `Are you sure you want to permanently delete '${targetValue}' from ${title} options?`, () => {
      setFormOptions((prev: any) => ({ ...prev, [category]: prev[category].filter((item: string) => item !== targetValue) }));
      if (formField) {
          if (formField === 'crls_options') {
              setFormData(prev => ({ ...prev, crls_options: (prev.crls_options || []).filter(item => item !== targetValue) }));
          } else if ((formData as any)[formField] === targetValue) {
              setFormData(prev => ({ ...prev, [formField]: '' }));
          }
      }
      showNotification(`Deleted ${targetValue}.`, "success");
    }, "Delete Option", "bg-red-600 hover:bg-red-700");
  };

  const handleAddLocation = (type: 'Province' | 'City' | 'Barangay') => {
    setPromptValue('');
    let title = type;
    let message = `Add a new ${type}.`;
    
    if (type === 'City' && !formData.prov) { showNotification("Select a Province first", "error"); return; }
    if (type === 'Barangay' && !formData.mun_city) { showNotification("Select a City first", "error"); return; }

    setPromptDialog({
      show: true, title: `Add ${title}`, message, placeholder: `Enter ${type} name`,
      action: (newVal: string) => {
        if (!newVal || newVal.trim() === '') return;
        const clean = newVal.trim();
        setLocationDB(prev => {
          const next = { ...prev };
          if (type === 'Province') { if (!next[clean]) next[clean] = {}; }
          else if (type === 'City') { if (!next[formData.prov][clean]) next[formData.prov][clean] = []; }
          else if (type === 'Barangay') { if (!next[formData.prov][formData.mun_city].includes(clean)) next[formData.prov][formData.mun_city].push(clean); }
          return next;
        });
        showNotification(`Added ${clean}`, "success");
      }
    });
  };

  const handleDeleteLocation = (type: 'Province' | 'City' | 'Barangay', value: string) => {
    if (!value) return;
    requestConfirm(`Delete ${type}`, `Permanently delete '${value}'?`, () => {
      setLocationDB(prev => {
        const next = { ...prev };
        if (type === 'Province') { delete next[value]; setFormData(p => ({...p, prov: '', mun_city: '', street_brgy: ''})); }
        else if (type === 'City') { delete next[formData.prov][value]; setFormData(p => ({...p, mun_city: '', street_brgy: ''})); }
        else if (type === 'Barangay') { next[formData.prov][formData.mun_city] = next[formData.prov][formData.mun_city].filter(b => b !== value); setFormData(p => ({...p, street_brgy: ''})); }
        return next;
      });
      showNotification(`Deleted ${value}`, "success");
    }, "Delete", "bg-red-600");
  };

  const handleArrayInput = (index: number, value: string, field: 'cr_nos' | 'ls_nos') => {
    const cleanValue = value.replace(/[^a-zA-Z0-9-\s]/g, ''); 
    setFormData(prev => {
      const newArr = [...prev[field]];
      newArr[index] = cleanValue;
      return { ...prev, [field]: newArr };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formDataObj = new FormData();
    formDataObj.append('name_of_proj', formData.name_of_proj);
    formDataObj.append('proj_owner_dev', formData.proj_owner_dev || '');
    formDataObj.append('proj_type', formData.proj_type);
    formDataObj.append('type_of_application', formData.type_of_application);
    formDataObj.append('status_of_application', formData.status_of_application);
    formDataObj.append('main_or_compliance', formData.main_or_compliance);
    formDataObj.append('prov', formData.prov);
    formDataObj.append('mun_city', formData.mun_city);
    formDataObj.append('street_brgy', formData.street_brgy);
    
    if (formData.date_filed) formDataObj.append('date_filed', formData.date_filed);
    if (formData.date_issued) formDataObj.append('date_issued', formData.date_issued);
    if (formData.date_completion) formDataObj.append('date_completion', formData.date_completion);
    
    formDataObj.append('cr_no', formData.cr_nos.filter((v: string) => v.trim() !== '').join(', '));
    formDataObj.append('ls_no', formData.ls_nos.filter((v: string) => v.trim() !== '').join(', '));
    
    if (formData.crls_options) {
      formDataObj.append('crls_options', JSON.stringify(formData.crls_options));
    }
    
    if (uploadFile) {
      formDataObj.append('drive_file', uploadFile);
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' }
    };

    const apiCall = appToEdit 
      ? axios.patch(`${API_URL}${appToEdit.id}/`, formDataObj, config) 
      : axios.post(API_URL, formDataObj, config);

    apiCall.then(() => {
        showNotification(appToEdit ? "Project updated" : "Project created", "success");
        onSave();
      })
      .catch(() => showNotification("Action failed!", "error"));
  }

  const processImportFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'array' }); 
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws);

        if (jsonData.length === 0) {
          showNotification("Upload Failed: File is empty.", "error");
          return;
        }

        const validLocations = locationDB;
        const validData = [];

        for (const row of jsonData) {
          const prov = row['Prov']?.trim();
          const city = row['Mun/City']?.trim();
          
          if (validLocations[prov] && validLocations[prov][city]) {
            validData.push(row);
          }
        }

        if (validData.length === 0) {
          showNotification(`Import Blocked: All rows are outside NIR or invalid format.`, "error");
          return;
        }

        setPreviewData(validData);
        showNotification(`Preview Ready: ${validData.length} valid records found.`, "info");
      } catch (error) {
        showNotification("Critical Error: Ensure file is a valid .csv or .xlsx", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmBulkUpload = async () => {
    setIsUploading(true);
    const batchSize = 10;
    let successCount = 0;

    for (let i = 0; i < previewData.length; i += batchSize) {
      const batch = previewData.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(row => 
        axios.post(API_URL, {
          name_of_proj: row['Name of Proj'] || row['Project Name'] || 'Untitled',
          proj_owner_dev: row['Proj Owner Dev'] || '',
          proj_type: row['Proj Type'] || '',
          type_of_application: row['Type of Application'] || 'New Application',
          status_of_application: row['Status of Application'] || 'Ongoing',
          main_or_compliance: row['Main or Compliance'] || 'Main',
          prov: row['Prov'] || '',
          mun_city: row['Mun/City'] || '',
          street_brgy: row['Street/Brgy'] || '',
          cr_no: row['CR No.'] || '',
          ls_no: row['LS No.'] || '',
          crls_options: row['New or Amended CRLS'] ? String(row['New or Amended CRLS']).split(',').map(s => s.trim()) : []
        })
      )).then(results => {
        successCount += results.filter(r => r.status === 'fulfilled').length;
      });
    }

    setIsUploading(false);
    showNotification(`Successfully saved ${successCount} records!`, "success");
    onSave();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[100] animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-[24px] sm:rounded-[28px] shadow-2xl w-full max-w-5xl max-h-[96vh] sm:max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
          
          <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex flex-col gap-4 sm:gap-6 bg-white shadow-sm z-10">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">{appToEdit ? 'Update Project' : 'Project Management'}</h3>
                <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">{appToEdit ? 'Modify details for ' + appToEdit.name_of_proj : 'Manual entry or bulk data processing'}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-2xl transition-all">
                <CloseIcon />
              </button>
            </div>

            {!appToEdit && (
              <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
                <button onClick={() => {setActiveTab('form'); setPreviewData([]);}} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Manual Entry</button>
                <button onClick={() => setActiveTab('import')} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'import' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Bulk Import / Export</button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent mt-4">
            {activeTab === 'form' ? (
              <form id="app-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Project Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Name *</label>
                      <input required className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.name_of_proj} onChange={e => setFormData({...formData, name_of_proj: e.target.value})} />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Owner / Developer</label>
                      <input className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.proj_owner_dev} onChange={e => setFormData({...formData, proj_owner_dev: e.target.value})} />
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Type</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('projTypes', 'Project Type')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.proj_type && <button type="button" onClick={() => handleDeleteOption('projTypes', 'Project Type', formData.proj_type, 'proj_type')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.proj_type} onChange={e => setFormData({...formData, proj_type: e.target.value})}>
                        <option value="" disabled>Select Type...</option>
                        {formOptions.projTypes.map((type: string) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Application Type</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('appTypes', 'Application Type')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.type_of_application && <button type="button" onClick={() => handleDeleteOption('appTypes', 'Application Type', formData.type_of_application, 'type_of_application')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.type_of_application} onChange={e => setFormData({...formData, type_of_application: e.target.value})}>
                        {formOptions.appTypes.map((type: string) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Status</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('statusOptions', 'Status')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.status_of_application && <button type="button" onClick={() => handleDeleteOption('statusOptions', 'Status', formData.status_of_application, 'status_of_application')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.status_of_application} onChange={e => setFormData({...formData, status_of_application: e.target.value})}>
                        <option value="" disabled>Select Status...</option>
                        {formOptions.statusOptions.map((status: string) => (<option key={status} value={status}>{status}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Main or Compliance</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddOption('mainCompOptions', 'Category')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.main_or_compliance && <button type="button" onClick={() => handleDeleteOption('mainCompOptions', 'Category', formData.main_or_compliance, 'main_or_compliance')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.main_or_compliance} onChange={e => setFormData({...formData, main_or_compliance: e.target.value})}>
                        <option value="" disabled>Select Category...</option>
                        {formOptions.mainCompOptions.map((opt: string) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      Certifications
                    </h4>
                    <button type="button" onClick={() => handleAddOption('crlsOptions', 'Certification')} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg">+ Add Option</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {formOptions.crlsOptions.map((option: string) => (
                      <div key={option} className="flex items-center justify-between p-3 rounded-2xl border-2 border-slate-200 bg-slate-100 hover:border-blue-200 hover:bg-white transition-all group">
                        <label className="flex items-center space-x-3 cursor-pointer w-full">
                          <input type="checkbox" className="w-5 h-5 text-blue-600 rounded-lg border-slate-300 focus:ring-blue-500" checked={formData.crls_options?.includes(option) || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setFormData(prev => ({
                                ...prev, crls_options: isChecked ? [...(prev.crls_options || []), option] : (prev.crls_options || []).filter(item => item !== option)
                              }));
                            }}
                          />
                          <span className="text-slate-700 font-bold text-sm">{option}</span>
                        </label>
                        <button type="button" onClick={() => handleDeleteOption('crlsOptions', 'Certification', option, 'crls_options')} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− (Del)</button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CR No.</label>
                        <button type="button" onClick={() => setFormData(p => ({...p, cr_nos: [...p.cr_nos, '']}))} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+ Add New</button>
                      </div>
                      {formData.cr_nos.map((val: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={val} onChange={(e) => handleArrayInput(i, e.target.value, 'cr_nos')} />
                          {formData.cr_nos.length > 1 && <button type="button" onClick={() => setFormData(p => ({...p, cr_nos: p.cr_nos.filter((_, idx) => idx !== i)}))} className="text-red-500 px-3 hover:bg-red-50 rounded-xl transition-colors font-black">−</button>}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LS No.</label>
                        <button type="button" onClick={() => setFormData(p => ({...p, ls_nos: [...p.ls_nos, '']}))} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">+ Add New</button>
                      </div>
                      {formData.ls_nos.map((val: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={val} onChange={(e) => handleArrayInput(i, e.target.value, 'ls_nos')} />
                          {formData.ls_nos.length > 1 && <button type="button" onClick={() => setFormData(p => ({...p, ls_nos: p.ls_nos.filter((_, idx) => idx !== i)}))} className="text-red-500 px-3 hover:bg-red-50 rounded-xl transition-colors font-black">−</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Location Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Province</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddLocation('Province')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.prov && <button type="button" onClick={() => handleDeleteLocation('Province', formData.prov)} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select required className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={formData.prov} onChange={e => setFormData({...formData, prov: e.target.value, mun_city: '', street_brgy: ''})}>
                        <option value="" disabled>Select Province...</option>
                        {availableProvinces.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Municipality / City</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddLocation('City')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.mun_city && <button type="button" onClick={() => handleDeleteLocation('City', formData.mun_city)} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select required disabled={!formData.prov} className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50 text-slate-700" value={formData.mun_city} onChange={e => setFormData({...formData, mun_city: e.target.value, street_brgy: ''})}>
                        <option value="" disabled>Select City/Mun...</option>
                        {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Barangay</label>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => handleAddLocation('Barangay')} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">+ Add</button>
                          {formData.street_brgy && <button type="button" onClick={() => handleDeleteLocation('Barangay', formData.street_brgy)} className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">− Del</button>}
                        </div>
                      </div>
                      <select required disabled={!formData.mun_city} className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer disabled:opacity-50 text-slate-700" value={formData.street_brgy} onChange={e => setFormData({...formData, street_brgy: e.target.value})}>
                        <option value="" disabled>Select Barangay...</option>
                        {availableBarangays.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Timelines
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Filed</label>
                      <input type="date" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.date_filed || ''} onChange={e => setFormData({...formData, date_filed: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Issued</label>
                      <input type="date" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.date_issued || ''} onChange={e => setFormData({...formData, date_issued: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Completion</label>
                      <input type="date" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 bg-slate-100 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700" value={formData.date_completion || ''} onChange={e => setFormData({...formData, date_completion: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 sm:p-7 rounded-[20px] border border-slate-200 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 mb-5 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Attachments
                  </h4>
                  <div className="space-y-4">
                    <div className="p-6 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3">
                      <input type="file" className="hidden" id="drive-upload" onChange={(e) => { if(e.target.files && e.target.files[0]) { setUploadFile(e.target.files[0]); showNotification("File selected for upload", "info"); } }} />
                      <label htmlFor="drive-upload" className="flex flex-col items-center cursor-pointer group">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all shadow-sm mb-2">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <span className="font-bold text-slate-700">Upload to Google Drive</span>
                        <p className="text-xs text-slate-400 font-medium mt-1">Files will be automatically sorted into the '{formData.status_of_application}' folder in Drive.</p>
                      </label>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-8 py-4 animate-in slide-in-from-bottom-4 duration-300">
                {previewData.length > 0 ? (
                  <div className="bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[65vh]">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-black text-slate-800">Preview Data</h4>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">Found <span className="text-emerald-600 font-bold">{previewData.length} valid</span> records.</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setPreviewData([])} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-xl font-bold text-sm" disabled={isUploading}>Cancel</button>
                        <button onClick={confirmBulkUpload} disabled={isUploading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-sm">
                          {isUploading ? 'Uploading...' : 'Confirm Upload'}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 font-bold text-slate-600 border-b">Project Name</th>
                            <th className="px-4 py-2 font-bold text-slate-600 border-b">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewData.slice(0, 50).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-800">{row['Name of Proj'] || 'Untitled'}</td>
                              <td className="px-4 py-2 text-slate-600">{row['Mun/City']}, {row['Prov']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                      className={`relative group h-[40vh] border-4 border-dashed rounded-[32px] transition-all flex flex-col items-center justify-center gap-5 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.xlsx" onChange={(e) => { if(e.target.files && e.target.files[0]) processImportFile(e.target.files[0]); }} />
                      <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center transition-all ${isDragging ? 'bg-blue-500 text-white scale-110 shadow-xl' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500'}`}>
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-slate-800">Upload Database</p>
                        <p className="text-slate-500 font-medium text-sm mt-2">Drag and drop .csv or .xlsx file here</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => { handleExport('csv'); onClose(); }} className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group shadow-sm">
                        <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="font-black text-slate-800">Export as CSV</span>
                      </button>
                      <button onClick={() => { handleExport('xlsx'); onClose(); }} className="flex flex-col items-center p-6 bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group shadow-sm">
                        <svg className="w-8 h-8 mb-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="font-black text-slate-800">Export as Excel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {activeTab === 'form' && (
            <div className="px-6 sm:px-8 py-4 sm:py-6 border-t border-slate-200 bg-white flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={onClose} className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold transition-colors text-sm sm:text-base">Discard</button>
              <button type="submit" form="app-form" className="px-8 py-3 sm:px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm sm:text-base">
                {appToEdit ? 'Save Changes' : 'Confirm Entry'}
              </button>
            </div>
          )}
        </div>
      </div>

      {promptDialog.show && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[120]">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95">
             <h3 className="text-xl font-black text-slate-800 text-center mb-6">{promptDialog.title}</h3>
             <input autoFocus className="w-full mb-6 border-2 border-slate-100 rounded-2xl px-5 py-4 bg-slate-50 font-bold outline-none focus:border-blue-500" value={promptValue} onChange={(e) => setPromptValue(e.target.value)} />
             <button onClick={() => { promptDialog.action?.(promptValue); setPromptDialog({ ...promptDialog, show: false }); }} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black">Save</button>
          </div>
        </div>
      )}
    </>
  )
}

export default ProjectFormModal;

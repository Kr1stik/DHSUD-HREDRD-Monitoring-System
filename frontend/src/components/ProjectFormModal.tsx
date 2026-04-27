import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { CloseIcon } from './Icons';
import { initialOptions, type Application } from '../utils/constants';

// 🌐 API CONFIGURATION
const isDev = import.meta.env.DEV;
const rawUrl = import.meta.env.VITE_API_URL || 'https://dhsud-hredrd-monitoring-system.onrender.com';
const cleanBaseUrl = rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
const API_BASE_URL = isDev ? 'http://localhost:8000' : cleanBaseUrl;
const API_URL = `${API_BASE_URL}/api/applications/`;

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

  const [formOptions, setFormOptions] = useState(() => {
    const saved = localStorage.getItem('dhsud_custom_options');
    return saved ? JSON.parse(saved) : initialOptions;
  });

  // 🌍 API LOCATION STATES
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);
  const [actionModal, setActionModal] = useState<{isOpen: boolean, type: 'add'|'delete', title: string, targetId?: any, targetName?: string, actionFn: (val?: string) => Promise<void>}>({ isOpen: false, type: 'add', title: '', actionFn: async () => {} });
  const [modalInput, setModalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [promptDialog, setPromptDialog] = useState({ show: false, title: '', message: '', placeholder: '', action: null as any });
  const [promptValue, setPromptValue] = useState('');

  const fetchLocations = async () => {
    try {
      const [provRes, cityRes, brgyRes] = await Promise.all([ 
        axios.get(`${API_BASE_URL}/api/provinces/`), 
        axios.get(`${API_BASE_URL}/api/cities/`), 
        axios.get(`${API_BASE_URL}/api/barangays/`) 
      ]);
      setProvinces(provRes.data?.results || provRes.data);
      setCities(cityRes.data?.results || cityRes.data);
      setBarangays(brgyRes.data?.results || brgyRes.data);
    } catch (err) { 
      console.error("Error fetching locations:", err); 
    }
  };

  useEffect(() => { fetchLocations(); }, []);
  useEffect(() => { localStorage.setItem('dhsud_custom_options', JSON.stringify(formOptions)); }, [formOptions]);

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
    setModalInput("");
    if (type === 'City' && !formData.prov) { showNotification("Select a Province first", "error"); return; }
    if (type === 'Barangay' && !formData.mun_city) { showNotification("Select a City first", "error"); return; }

    setActionModal({
      isOpen: true,
      type: 'add',
      title: `Add New ${type}`,
      actionFn: async (val) => {
        if (type === 'Province') await axios.post(`${API_BASE_URL}/api/provinces/`, { name: val });
        else if (type === 'City') await axios.post(`${API_BASE_URL}/api/cities/`, { name: val, province: formData.prov });
        else if (type === 'Barangay') await axios.post(`${API_BASE_URL}/api/barangays/`, { name: val, city: formData.mun_city });
        await fetchLocations();
        showNotification(`Added ${val}`, "success");
      }
    });
  };

  const handleDeleteLocation = (type: 'Province' | 'City' | 'Barangay', valueId: string) => {
    if (!valueId) return;
    let targetName = "";
    if (type === 'Province') targetName = provinces.find(p => String(p.id) === String(valueId))?.name || "";
    else if (type === 'City') targetName = cities.find(c => String(c.id) === String(valueId))?.name || "";
    else if (type === 'Barangay') targetName = barangays.find(b => String(b.id) === String(valueId))?.name || "";

    setActionModal({
      isOpen: true,
      type: 'delete',
      title: `Delete ${type}`,
      targetName,
      actionFn: async () => {
        if (type === 'Province') {
          await axios.delete(`${API_BASE_URL}/api/provinces/${valueId}/`);
          setFormData(p => ({ ...p, prov: '', mun_city: '', street_brgy: '' }));
        } else if (type === 'City') {
          await axios.delete(`${API_BASE_URL}/api/cities/${valueId}/`);
          setFormData(p => ({ ...p, mun_city: '', street_brgy: '' }));
        } else if (type === 'Barangay') {
          await axios.delete(`${API_BASE_URL}/api/barangays/${valueId}/`);
          setFormData(p => ({ ...p, street_brgy: '' }));
        }
        await fetchLocations();
        showNotification(`Deleted ${targetName}`, "success");
      }
    });
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
    
    const provName = provinces.find(p => String(p.id) === String(formData.prov))?.name || formData.prov;
    const cityName = cities.find(c => String(c.id) === String(formData.mun_city))?.name || formData.mun_city;
    const brgyName = barangays.find(b => String(b.id) === String(formData.street_brgy))?.name || formData.street_brgy;

    const formDataObj = new FormData();
    formDataObj.append('name_of_proj', formData.name_of_proj);
    formDataObj.append('proj_owner_dev', formData.proj_owner_dev || '');
    formDataObj.append('proj_type', formData.proj_type);
    formDataObj.append('type_of_application', formData.type_of_application);
    formDataObj.append('status_of_application', formData.status_of_application);
    formDataObj.append('main_or_compliance', formData.main_or_compliance);
    formDataObj.append('prov', provName);
    formDataObj.append('mun_city', cityName);
    formDataObj.append('street_brgy', brgyName);
    
    if (formData.date_filed) formDataObj.append('date_filed', formData.date_filed);
    if (formData.date_issued) formDataObj.append('date_issued', formData.date_issued);
    if (formData.date_completion) formDataObj.append('date_completion', formData.date_completion);
    
    formDataObj.append('cr_no', formData.cr_nos.filter((v: string) => v.trim() !== '').join(', '));
    formDataObj.append('ls_no', formData.ls_nos.filter((v: string) => v.trim() !== '').join(', '));
    
    if (formData.crls_options) {
      formDataObj.append('crls_options', JSON.stringify(formData.crls_options));
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

        const validData = [];

        for (const row of jsonData) {
          const provName = row['Prov']?.trim();
          const cityName = row['Mun/City']?.trim();
          
          const province = provinces.find(p => p.name === provName);
          const city = cities.find(c => c.name === cityName && String(c.province) === String(province?.id));

          if (province && city) {
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
      <div className="fixed top-0 left-0 w-screen h-screen z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
          
          <div className="sticky top-0 bg-white px-6 sm:px-8 py-4 border-b flex flex-col gap-4 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                    {appToEdit ? 'Edit Project Details' : 'New Project Registration'}
                </h2>
                {!appToEdit && (
                  <div className="mt-2 flex p-1 bg-slate-100 rounded-lg w-fit">
                    <button onClick={() => {setActiveTab('form'); setPreviewData([]);}} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'form' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Form View</button>
                    <button onClick={() => setActiveTab('import')} className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'import' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Bulk Operations</button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <CloseIcon />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            {activeTab === 'form' ? (
              <form id="app-form" onSubmit={handleSubmit} className="space-y-8">
                {/* Project Details */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2 mb-4 mt-2">Project Basics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                      <input required className="w-full border border-slate-300 rounded-md px-3 py-2 text-base font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-800 focus:invalid:border-red-500 focus:invalid:ring-red-500/20" value={formData.name_of_proj} onChange={e => setFormData({...formData, name_of_proj: e.target.value})} />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner / Developer</label>
                      <input className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-800" value={formData.proj_owner_dev} onChange={e => setFormData({...formData, proj_owner_dev: e.target.value})} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Project Type</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddOption('projTypes', 'Project Type')} className="text-[10px] font-bold text-blue-600 hover:underline">Add</button>
                          {formData.proj_type && <button type="button" onClick={() => handleDeleteOption('projTypes', 'Project Type', formData.proj_type, 'proj_type')} className="text-[10px] font-bold text-red-500 hover:underline">Del</button>}
                        </div>
                      </div>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 transition-all text-gray-800" value={formData.proj_type} onChange={e => setFormData({...formData, proj_type: e.target.value})}>
                        <option value="" disabled>Select Type...</option>
                        {formOptions.projTypes.map((type: string) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Application Type</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddOption('appTypes', 'Application Type')} className="text-[10px] font-bold text-blue-600 hover:underline">Add</button>
                          {formData.type_of_application && <button type="button" onClick={() => handleDeleteOption('appTypes', 'Application Type', formData.type_of_application, 'type_of_application')} className="text-[10px] font-bold text-red-500 hover:underline">Del</button>}
                        </div>
                      </div>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 transition-all text-gray-800" value={formData.type_of_application} onChange={e => setFormData({...formData, type_of_application: e.target.value})}>
                        {formOptions.appTypes.map((type: string) => (<option key={type} value={type}>{type}</option>))}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Current Status</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddOption('statusOptions', 'Status')} className="text-[10px] font-bold text-blue-600 hover:underline">Add</button>
                          {formData.status_of_application && <button type="button" onClick={() => handleDeleteOption('statusOptions', 'Status', formData.status_of_application, 'status_of_application')} className="text-[10px] font-bold text-red-500 hover:underline">Del</button>}
                        </div>
                      </div>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 transition-all text-gray-800" value={formData.status_of_application} onChange={e => setFormData({...formData, status_of_application: e.target.value})}>
                        <option value="" disabled>Select Status...</option>
                        {formOptions.statusOptions.map((status: string) => (<option key={status} value={status}>{status}</option>))}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Main or Compliance</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddOption('mainCompOptions', 'Category')} className="text-[10px] font-bold text-blue-600 hover:underline">Add</button>
                          {formData.main_or_compliance && <button type="button" onClick={() => handleDeleteOption('mainCompOptions', 'Category', formData.main_or_compliance, 'main_or_compliance')} className="text-[10px] font-bold text-red-500 hover:underline">Del</button>}
                        </div>
                      </div>
                      <select className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 transition-all text-gray-800" value={formData.main_or_compliance} onChange={e => setFormData({...formData, main_or_compliance: e.target.value})}>
                        <option value="" disabled>Select Category...</option>
                        {formOptions.mainCompOptions.map((opt: string) => (<option key={opt} value={opt}>{opt}</option>))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Technical Credentials */}
                <div>
                  <div className="flex items-center justify-between border-b border-blue-200 pb-2 mb-4 mt-6">
                    <h3 className="text-lg font-semibold text-blue-600">Technical Credentials</h3>
                    <button type="button" onClick={() => handleAddOption('crlsOptions', 'Certification')} className="text-[10px] font-bold text-blue-600 hover:underline">+ New Type</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {formOptions.crlsOptions.map((option: string) => (
                      <div key={option} className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-all">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" checked={formData.crls_options?.includes(option) || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData(prev => ({
                              ...prev, crls_options: isChecked ? [...(prev.crls_options || []), option] : (prev.crls_options || []).filter(item => item !== option)
                            }));
                          }}
                        />
                        <span className="text-gray-700 font-medium text-sm">{option}</span>
                        <button type="button" onClick={() => handleDeleteOption('crlsOptions', 'Certification', option, 'crls_options')} className="text-[10px] font-bold text-red-500 hover:text-red-700 ml-1">×</button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">CR Numbers</label>
                        <button type="button" onClick={() => setFormData(p => ({...p, cr_nos: [...p.cr_nos, '']}))} className="text-[10px] font-bold text-blue-600 hover:underline">+ Add Entry</button>
                      </div>
                      {formData.cr_nos.map((val: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium text-gray-800" value={val} onChange={(e) => handleArrayInput(i, e.target.value, 'cr_nos')} />
                          {formData.cr_nos.length > 1 && <button type="button" onClick={() => setFormData(p => ({...p, cr_nos: p.cr_nos.filter((_, idx) => idx !== i)}))} className="text-red-500 hover:text-red-700 font-bold px-1">×</button>}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">LS Numbers</label>
                        <button type="button" onClick={() => setFormData(p => ({...p, ls_nos: [...p.ls_nos, '']}))} className="text-[10px] font-bold text-blue-600 hover:underline">+ Add Entry</button>
                      </div>
                      {formData.ls_nos.map((val: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium text-gray-800" value={val} onChange={(e) => handleArrayInput(i, e.target.value, 'ls_nos')} />
                          {formData.ls_nos.length > 1 && <button type="button" onClick={() => setFormData(p => ({...p, ls_nos: p.ls_nos.filter((_, idx) => idx !== i)}))} className="text-red-500 hover:text-red-700 font-bold px-1">×</button>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location Mapping */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2 mb-4 mt-6">Location Mapping</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Province</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddLocation('Province')} className="text-[10px] font-bold text-blue-600 hover:underline">Add</button>
                          {formData.prov && <button type="button" onClick={() => handleDeleteLocation('Province', formData.prov)} className="text-[10px] font-bold text-red-500 hover:underline">Del</button>}
                        </div>
                      </div>
                      <select required className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium text-gray-800" value={formData.prov} onChange={e => setFormData({...formData, prov: e.target.value, mun_city: '', street_brgy: ''})}>
                        <option value="" disabled>Select Province...</option>
                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">City / Municipality</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddLocation('City')} className="text-[10px] font-bold text-blue-600 hover:underline">Add</button>
                          {formData.mun_city && <button type="button" onClick={() => handleDeleteLocation('City', formData.mun_city)} className="text-[10px] font-bold text-red-500 hover:underline">Del</button>}
                        </div>
                      </div>
                      <select required disabled={!formData.prov} className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium text-gray-800 disabled:opacity-50" value={formData.mun_city} onChange={e => setFormData({...formData, mun_city: e.target.value, street_brgy: ''})}>
                        <option value="" disabled>Select City...</option>
                        {cities.filter(c => String(c.province) === String(formData.prov)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Barangay</label>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddLocation('Barangay')} className="text-[10px] font-bold text-blue-600 hover:underline">Add</button>
                          {formData.street_brgy && <button type="button" onClick={() => handleDeleteLocation('Barangay', formData.street_brgy)} className="text-[10px] font-bold text-red-500 hover:underline">Del</button>}
                        </div>
                      </div>
                      <select required disabled={!formData.mun_city} className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium text-gray-800 disabled:opacity-50" value={formData.street_brgy} onChange={e => setFormData({...formData, street_brgy: e.target.value})}>
                        <option value="" disabled>Select Barangay...</option>
                        {barangays.filter(b => String(b.city) === String(formData.mun_city)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Processing Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-200 pb-2 mb-4 mt-6">Processing Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Filed</label>
                      <input
                        type="date"
                        value={formData.date_filed || ''}
                        onChange={(e) => setFormData({...formData, date_filed: e.target.value})}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 transition-all text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                      <input
                        type="date"
                        value={formData.date_issued || ''}
                        onChange={(e) => setFormData({...formData, date_issued: e.target.value})}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 transition-all text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Completion</label>
                      <input
                        type="date"
                        value={formData.date_completion || ''}
                        onChange={(e) => setFormData({...formData, date_completion: e.target.value})}
                        className="w-full border border-slate-300 rounded-md px-3 py-2 font-medium outline-none focus:border-blue-500 transition-all text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 pb-2">
                  <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-all">Cancel</button>
                  <button type="submit" className="px-8 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md transition-all active:scale-95">
                    {appToEdit ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                {previewData.length > 0 ? (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[60vh]">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">Preview Import Data</h4>
                        <p className="text-gray-500 text-sm font-medium mt-0.5">Ready to upload <span className="text-emerald-600 font-bold">{previewData.length} valid</span> records.</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setPreviewData([])} className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-md font-bold text-sm" disabled={isUploading}>Cancel</button>
                        <button onClick={confirmBulkUpload} disabled={isUploading} className="px-4 py-2 bg-blue-600 text-white rounded-md font-black text-sm">
                          {isUploading ? 'Processing...' : 'Start Import'}
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 font-bold text-slate-600 border-b">Project Name</th>
                            <th className="px-4 py-2 font-bold text-slate-600 border-b">City/Mun, Province</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {previewData.slice(0, 50).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-all">
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
                      className={`relative group h-[40vh] border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-5 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'}`}
                    >
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv,.xlsx" onChange={(e) => { if(e.target.files && e.target.files[0]) processImportFile(e.target.files[0]); }} />
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:text-blue-500'}`}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-800">Bulk Database Upload</p>
                        <p className="text-gray-500 font-medium text-sm mt-2">Drop your .csv or .xlsx file here to begin</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => { handleExport('csv'); onClose(); }} className="flex flex-col items-center p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group shadow-sm">
                        <svg className="w-8 h-8 mb-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="font-bold text-gray-800">Download Template (CSV)</span>
                      </button>
                      <button onClick={() => { handleExport('xlsx'); onClose(); }} className="flex flex-col items-center p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group shadow-sm">
                        <svg className="w-8 h-8 mb-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        <span className="font-bold text-gray-800">Download Template (Excel)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100"><h3 className="text-xl font-bold text-slate-800">{actionModal.title}</h3></div>
            <div className="p-6">
              {actionModal.type === 'add' ? (
                <input type="text" autoFocus value={modalInput} onChange={(e) => setModalInput(e.target.value)} placeholder="Enter name..." className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-700" />
              ) : (
                <p className="text-slate-600">Are you sure you want to delete <span className="font-bold text-red-600">{actionModal.targetName}</span>? This action cannot be undone.</p>
              )}
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setActionModal({ ...actionModal, isOpen: false })} disabled={isProcessing} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">Cancel</button>
              <button type="button" onClick={async () => { setIsProcessing(true); try { await actionModal.actionFn(modalInput); setActionModal({ ...actionModal, isOpen: false }); } catch (e) { alert("Action failed."); } finally { setIsProcessing(false); } }} disabled={isProcessing || (actionModal.type === 'add' && !modalInput.trim())} className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 ${actionModal.type === 'add' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {isProcessing ? 'Processing...' : (actionModal.type === 'add' ? 'Save Location' : 'Yes, Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {promptDialog.show && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95">
             <h3 className="text-xl font-bold text-gray-800 text-center mb-6">{promptDialog.title}</h3>
             <input autoFocus className="w-full mb-6 border border-slate-300 rounded-md px-4 py-3 bg-slate-50 font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" value={promptValue} onChange={(e) => setPromptValue(e.target.value)} />
             <div className="flex gap-2">
                <button onClick={() => setPromptDialog({ ...promptDialog, show: false })} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-md transition-all">Cancel</button>
                <button onClick={() => { promptDialog.action?.(promptValue); setPromptDialog({ ...promptDialog, show: false }); }} className="flex-1 py-3 bg-blue-600 text-white rounded-md font-black shadow-md hover:bg-blue-700 transition-all">Save Option</button>
             </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProjectFormModal;

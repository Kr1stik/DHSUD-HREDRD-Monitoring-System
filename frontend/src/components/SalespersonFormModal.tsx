import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SalespersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  salesperson?: any;
  mode?: 'create' | 'edit' | 'view';
}

const SalespersonFormModal: React.FC<SalespersonFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  salesperson = null, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState<any>({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    sex: 'M',
    tin: '',
    phone_no: '',
    address_street: '',
    city_municipality: '',
    province: 'Negros Occidental',
    prc_accre_no: '',
    sp_prc_reg_validity: '',
    sn_certificate_of_reg: '',
    prn: '',
    broker_prn: '',
    broker_last_name: '',
    broker_first_name: '',
    broker_middle_name: '',
    broker_suffix: '',
    broker_date_of_reg: '',
    broker_place_of_reg: '',
    or_no_registration: '',
    amount_reg: '',
    or_date: '',
    surety_bond_validity: '',
    or_no_cash_bond: '',
    amount_cb: '',
    date_filed: '',
    date_of_registration: '',
    reg_month_year: '',
    date_released: '',
    released_month: '',
    released_date: '',
    released_year: '',
    is_renewal: false,
    valid_years: [],
    note: '',
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Cascading Address States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedBrgy, setSelectedBrgy] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");

  // Custom Modal States
  const [actionModal, setActionModal] = useState<{isOpen: boolean, type: 'add'|'delete', title: string, targetId?: any, targetName?: string, actionFn: (val?: string) => Promise<void>}>({ isOpen: false, type: 'add', title: '', actionFn: async () => {} });
  const [modalInput, setModalInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

  const fetchLocations = async () => {
    try {
      const [provRes, cityRes, brgyRes] = await Promise.all([ 
        axios.get(`${API_BASE_URL}/provinces/`), 
        axios.get(`${API_BASE_URL}/cities/`), 
        axios.get(`${API_BASE_URL}/barangays/`) 
      ]);
      setProvinces(provRes.data?.results || provRes.data);
      setCities(cityRes.data?.results || cityRes.data);
      setBarangays(brgyRes.data?.results || brgyRes.data);
    } catch (err) { 
      console.error("Error fetching locations:", err); 
    }
  };

  useEffect(() => { 
    if (isOpen) fetchLocations(); 
  }, [isOpen]);

  const handleAddProvince = () => { 
    setModalInput(""); 
    setActionModal({ 
      isOpen: true, 
      type: 'add', 
      title: 'Add New Province', 
      actionFn: async (val) => { 
        await axios.post(`${API_BASE_URL}/provinces/`, {name: val}); 
        await fetchLocations(); 
      } 
    }); 
  };
  
  const handleDeleteProvince = () => { 
    if(!selectedProvince) return; 
    const prov = provinces.find(p => String(p.id) === String(selectedProvince)); 
    setActionModal({ 
      isOpen: true, 
      type: 'delete', 
      title: 'Delete Province', 
      targetName: prov?.name, 
      actionFn: async () => { 
        await axios.delete(`${API_BASE_URL}/provinces/${selectedProvince}/`); 
        setSelectedProvince(""); 
        await fetchLocations(); 
      } 
    }); 
  };
  
  const handleAddCity = () => { 
    if(!selectedProvince) return;
    setModalInput(""); 
    setActionModal({ 
      isOpen: true, 
      type: 'add', 
      title: 'Add New City', 
      actionFn: async (val) => { 
        await axios.post(`${API_BASE_URL}/cities/`, {name: val, province: selectedProvince}); 
        await fetchLocations(); 
      } 
    }); 
  };
  
  const handleDeleteCity = () => { 
    if(!selectedCity) return; 
    const city = cities.find(c => String(c.id) === String(selectedCity)); 
    setActionModal({ 
      isOpen: true, 
      type: 'delete', 
      title: 'Delete City', 
      targetName: city?.name, 
      actionFn: async () => { 
        await axios.delete(`${API_BASE_URL}/cities/${selectedCity}/`); 
        setSelectedCity(""); 
        await fetchLocations(); 
      } 
    }); 
  };
  
  const handleAddBrgy = () => { 
    if(!selectedCity) return;
    setModalInput(""); 
    setActionModal({ 
      isOpen: true, 
      type: 'add', 
      title: 'Add New Barangay', 
      actionFn: async (val) => { 
        await axios.post(`${API_BASE_URL}/barangays/`, {name: val, city: selectedCity}); 
        await fetchLocations(); 
      } 
    }); 
  };
  
  const handleDeleteBrgy = () => { 
    if(!selectedBrgy) return; 
    const brgy = barangays.find(b => String(b.id) === String(selectedBrgy)); 
    setActionModal({ 
      isOpen: true, 
      type: 'delete', 
      title: 'Delete Barangay', 
      targetName: brgy?.name, 
      actionFn: async () => { 
        await axios.delete(`${API_BASE_URL}/barangays/${selectedBrgy}/`); 
        setSelectedBrgy(""); 
        await fetchLocations(); 
      } 
    }); 
  };

  useEffect(() => {
    if (salesperson) {
      setFormData({
        ...salesperson,
        first_name: salesperson.first_name || '',
        middle_name: salesperson.middle_name || '',
        last_name: salesperson.last_name || '',
        suffix: salesperson.suffix || '',
        tin: salesperson.tin || '',
        phone_no: salesperson.phone_no || '',
        address_street: salesperson.address_street || '',
        city_municipality: salesperson.city_municipality || '',
        province: salesperson.province || 'Negros Occidental',
        prc_accre_no: salesperson.prc_accre_no || '',
        sp_prc_reg_validity: salesperson.sp_prc_reg_validity || '',
        sn_certificate_of_reg: salesperson.sn_certificate_of_reg || '',
        prn: salesperson.prn || '',
        broker_prn: salesperson.broker_prn || '',
        broker_last_name: salesperson.broker_last_name || '',
        broker_first_name: salesperson.broker_first_name || '',
        broker_middle_name: salesperson.broker_middle_name || '',
        broker_suffix: salesperson.broker_suffix || '',
        broker_date_of_reg: salesperson.broker_date_of_reg || '',
        broker_place_of_reg: salesperson.broker_place_of_reg || '',
        or_no_registration: salesperson.or_no_registration || '',
        amount_reg: salesperson.amount_reg || '',
        or_date: salesperson.or_date || '',
        surety_bond_validity: salesperson.surety_bond_validity || '',
        or_no_cash_bond: salesperson.or_no_cash_bond || '',
        amount_cb: salesperson.amount_cb || '',
        date_filed: salesperson.date_filed || '',
        date_of_registration: salesperson.date_of_registration || '',
        reg_month_year: salesperson.reg_month_year || '',
        date_released: salesperson.date_released || '',
        released_month: salesperson.released_month || '',
        released_date: salesperson.released_date || '',
        released_year: salesperson.released_year || '',
        note: salesperson.note || '',
      });
      // Note: We might need to match names to IDs if salesperson data comes with names
      // For now, setting them directly as strings might cause select issues if IDs are expected
      setSelectedProvince(salesperson.province_id || salesperson.province || '');
      setSelectedCity(salesperson.city_id || salesperson.city_municipality || '');
      setSelectedBrgy(salesperson.barangay_id || salesperson.barangay || '');
      setSpecificAddress(salesperson.address_street || '');
    } else {
      // Reset form for create mode
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        sex: 'M',
        tin: '',
        phone_no: '',
        address_street: '',
        city_municipality: '',
        province: 'Negros Occidental',
        prc_accre_no: '',
        sp_prc_reg_validity: '',
        sn_certificate_of_reg: '',
        prn: '',
        broker_prn: '',
        broker_last_name: '',
        broker_first_name: '',
        broker_middle_name: '',
        broker_suffix: '',
        broker_date_of_reg: '',
        broker_place_of_reg: '',
        or_no_registration: '',
        amount_reg: '',
        or_date: '',
        surety_bond_validity: '',
        or_no_cash_bond: '',
        amount_cb: '',
        date_filed: '',
        date_of_registration: '',
        date_released: '',
        released_year: '',
        is_renewal: false,
        valid_years: [],
        note: '',
      });
      setPhoto(null);
      setSelectedProvince('');
      setSelectedCity('');
      setSelectedBrgy('');
      setSpecificAddress('');
    }
  }, [salesperson, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (mode === 'view') return;
    const { name, type } = e.target;
    let { value } = e.target;

    // Auto-capitalize names (First Name, Middle Name, Last Name, Broker Names)
    const nameFields = ['first_name', 'middle_name', 'last_name', 'broker_first_name', 'broker_middle_name', 'broker_last_name'];
    if (nameFields.includes(name) && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    // MI logic: if it's middle_name or broker_middle_name and length is 1, append a dot
    // However, it's better to do this on blur or specialized logic to allow backspace.
    // User asked "in MI should have '.' static". 
    // Let's implement it such that if they type 'A', it becomes 'A.'
    if ((name === 'middle_name' || name === 'broker_middle_name') && value.length === 1 && /^[a-zA-Z]$/.test(value)) {
      value = value + ".";
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleYearChange = (year: number) => {
    if (mode === 'view') return;
    const currentYears = [...(formData.valid_years || [])];
    if (currentYears.includes(year)) {
      setFormData({ ...formData, valid_years: currentYears.filter(y => y !== year) });
    } else {
      setFormData({ ...formData, valid_years: [...currentYears, year].sort() });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'view') return;
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return;
    setLoading(true);

    const submissionData = {
      ...formData,
      province: provinces.find(p => String(p.id) === String(selectedProvince))?.name || selectedProvince,
      city_municipality: cities.find(c => String(c.id) === String(selectedCity))?.name || selectedCity,
      barangay: barangays.find(b => String(b.id) === String(selectedBrgy))?.name || selectedBrgy,
      address_street: specificAddress
    };

    const data = new FormData();
    Object.keys(submissionData).forEach(key => {
      if (key === 'valid_years') {
        data.append(key, JSON.stringify(submissionData[key]));
      } else if (key === 'photo') {
        // Skip current photo string if it exists
      } else {
        data.append(key, submissionData[key] === null ? '' : submissionData[key]);
      }
    });

    if (photo) {
      data.append('photo', photo);
    }

    try {
      const url = mode === 'edit' && salesperson?.id 
        ? `${API_BASE_URL}/salespersons/${salesperson.id}/` 
        : `${API_BASE_URL}/salespersons/`;
      
      const response = await fetch(url, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        body: data
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving salesperson:', error);
      alert('Failed to save salesperson data.');
    } finally {
      setLoading(false);
    }
  };

  const isView = mode === 'view';

  // Computed Full Name and Address
  const fullName = `${formData.first_name} ${formData.middle_name ? formData.middle_name + ' ' : ''}${formData.last_name}${formData.suffix ? ' ' + formData.suffix : ''}`.trim();
  
  const provName = provinces.find(p => String(p.id) === String(selectedProvince))?.name || "";
  const cityName = cities.find(c => String(c.id) === String(selectedCity))?.name || "";
  const brgyName = barangays.find(b => String(b.id) === String(selectedBrgy))?.name || "";
  const fullAddress = [specificAddress, brgyName, cityName, provName].filter(Boolean).join(', ');

  // Generate Years
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2015; y <= currentYear + 2; y++) {
    years.push(y);
  }

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[9998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-[90%] max-w-5xl max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-none p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'view' ? 'Salesperson Details' : mode === 'edit' ? 'Edit Salesperson Registration' : 'New Salesperson Registration'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Body */}
          <div className="flex-1 p-6 space-y-8 overflow-y-auto min-h-0">
            {/* Section: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Personal Information</h3>
              
              {isView && (
                <div className="flex justify-center mb-6">
                  {salesperson.photo ? (
                    <img src={salesperson.photo} alt="Salesperson" className="w-32 h-32 object-cover rounded-xl shadow-sm border border-slate-200" />
                  ) : (
                    <div className="w-32 h-32 bg-slate-100 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 text-sm font-medium">No Photo</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input disabled={isView} required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500 focus:invalid:border-red-500 focus:invalid:ring-red-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input disabled={isView} type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input disabled={isView} required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500 focus:invalid:border-red-500 focus:invalid:ring-red-500/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suffix</label>
                  <input disabled={isView} type="text" name="suffix" value={formData.suffix} onChange={handleChange} placeholder="Jr., III, etc." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sex</label>
                  <select disabled={isView} name="sex" value={formData.sex} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">TIN</label>
                  <input disabled={isView} type="text" name="tin" value={formData.tin} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone No. <span className="text-[10px] text-gray-400 font-normal">(Min 9 digits)</span></label>
                  <input disabled={isView} required type="text" name="phone_no" value={formData.phone_no} onChange={handleChange} minLength={9} pattern="[0-9]*" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500 focus:invalid:border-red-500 focus:invalid:ring-red-500/20" />
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Province</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={handleAddProvince} className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-1">+ Add</button>
                      <button type="button" onClick={handleDeleteProvince} className="text-[10px] text-red-600 hover:text-red-800 font-bold px-1">× Del</button>
                    </div>
                  </div>
                  <select disabled={isView} value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedCity(""); setSelectedBrgy(""); setSpecificAddress(""); }} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500">
                    <option value="">Select Province...</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-500 uppercase">City / Municipality</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={handleAddCity} className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-1">+ Add</button>
                      <button type="button" onClick={handleDeleteCity} className="text-[10px] text-red-600 hover:text-red-800 font-bold px-1">× Del</button>
                    </div>
                  </div>
                  <select disabled={isView || !selectedProvince} value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); setSelectedBrgy(""); setSpecificAddress(""); }} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100">
                    <option value="">Select City...</option>
                    {cities.filter(c => String(c.province) === String(selectedProvince)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Barangay</label>
                    <div className="flex gap-1">
                      <button type="button" onClick={handleAddBrgy} className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-1">+ Add</button>
                      <button type="button" onClick={handleDeleteBrgy} className="text-[10px] text-red-600 hover:text-red-800 font-bold px-1">× Del</button>
                    </div>
                  </div>
                  <select disabled={isView || !selectedCity} value={selectedBrgy} onChange={(e) => setSelectedBrgy(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100">
                    <option value="">Select Brgy...</option>
                    {barangays.filter(b => String(b.city) === String(selectedCity)).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                {selectedBrgy && (
                  <div className="col-span-1 sm:col-span-3 flex flex-col gap-1.5 mt-2 animate-in slide-in-from-top-2">
                    <label className="text-xs font-semibold text-blue-600 uppercase">Specific Address (Optional)</label>
                    <input disabled={isView} type="text" value={specificAddress} onChange={(e) => setSpecificAddress(e.target.value)} placeholder="House/Block No., Street Name, Subdivision..." className="w-full px-4 py-2.5 rounded-lg border border-blue-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500" />
                  </div>
                )}
              </div>

              {!isView && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Photo</label>
                  <input type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
              )}
            </div>

            {/* Section: Broker Affiliation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Broker Affiliation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input disabled={isView} type="text" name="broker_last_name" value={formData.broker_last_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input disabled={isView} type="text" name="broker_first_name" value={formData.broker_first_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">MI</label>
                  <input disabled={isView} type="text" name="broker_middle_name" value={formData.broker_middle_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suffix</label>
                  <input disabled={isView} type="text" name="broker_suffix" value={formData.broker_suffix} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Broker PRN</label>
                  <input disabled={isView} type="text" name="broker_prn" value={formData.broker_prn} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Registration</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.broker_date_of_reg || ''}
                    onChange={(e) => setFormData({...formData, broker_date_of_reg: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Place of Registration</label>
                  <input disabled={isView} type="text" name="broker_place_of_reg" value={formData.broker_place_of_reg} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>
            </div>

            {/* Section: Valid Years */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Valid Years</h3>
              <div className="flex flex-wrap gap-3">
                {years.map(year => (
                  <label key={year} className={`flex items-center space-x-2 p-2 rounded-md border ${formData.valid_years?.includes(year) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'} cursor-pointer hover:bg-blue-50 transition-colors`}>
                    <input 
                      disabled={isView}
                      type="checkbox" 
                      checked={formData.valid_years?.includes(year)} 
                      onChange={() => handleYearChange(year)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">{year}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section: Registration & Payments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Registration & Payments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">PRC Accre No.</label>
                  <input disabled={isView} type="text" name="prc_accre_no" value={formData.prc_accre_no} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PRC Validity</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.sp_prc_reg_validity || ''}
                    onChange={(e) => setFormData({...formData, sp_prc_reg_validity: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SN Cert of Reg</label>
                  <input disabled={isView} type="text" name="sn_certificate_of_reg" value={formData.sn_certificate_of_reg} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PRN</label>
                  <input disabled={isView} type="text" name="prn" value={formData.prn} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">OR No. (Reg)</label>
                  <input disabled={isView} type="text" name="or_no_registration" value={formData.or_no_registration} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (Reg)</label>
                  <input disabled={isView} type="number" step="0.01" name="amount_reg" value={formData.amount_reg} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">OR Date</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.or_date || ''}
                    onChange={(e) => setFormData({...formData, or_date: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Surety Bond Validity</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.surety_bond_validity || ''}
                    onChange={(e) => setFormData({...formData, surety_bond_validity: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">OR No. (Cash Bond)</label>
                  <input disabled={isView} type="text" name="or_no_cash_bond" value={formData.or_no_cash_bond} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (CB)</label>
                  <input disabled={isView} type="number" step="0.01" name="amount_cb" value={formData.amount_cb} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>
            </div>

            {/* System Dates & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Date Filed</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.date_filed || ''}
                    onChange={(e) => setFormData({...formData, date_filed: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Registration</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.date_of_registration || ''}
                    onChange={(e) => setFormData({...formData, date_of_registration: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div className="flex items-center mt-6">
                  <input disabled={isView} type="checkbox" name="is_renewal" checked={formData.is_renewal} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50" />
                  <label className="ml-2 block text-sm text-gray-900">Renewal Application</label>
                </div>
            </div>

            {/* Release Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Release Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reg. Month/Year</label>
                  <input disabled={isView} type="text" name="reg_month_year" value={formData.reg_month_year} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Released</label>
                  <input
                    type="date"
                    disabled={isView}
                    value={formData.date_released || ''}
                    onChange={(e) => setFormData({...formData, date_released: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Released Month</label>
                  <input disabled={isView} type="text" name="released_month" value={formData.released_month} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Released Date (Day)</label>
                  <input disabled={isView} type="text" name="released_date" value={formData.released_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Released Year</label>
                  <input disabled={isView} type="text" name="released_year" value={formData.released_year} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>
            </div>

            {/* Computed Info Display */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Preview Details</span>
                <span className="text-[10px] text-blue-300">Read-only computed information</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-blue-700 uppercase">Full Name</label>
                  <div className="text-sm font-semibold text-blue-900">{fullName || '---'}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-blue-700 uppercase">Full Address</label>
                  <div className="text-sm font-semibold text-blue-900">{fullAddress || '---'}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea disabled={isView} name="note" value={formData.note} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
            </div>
          </div>

          {/* Pinned Footer */}
          <div className="flex-none p-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button type="submit" disabled={loading} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Salesperson'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Custom Mini-Modal for Location Management */}
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">{actionModal.title}</h3>
              </div>
              <div className="p-6">
                {actionModal.type === 'add' ? (
                  <input type="text" autoFocus value={modalInput} onChange={(e) => setModalInput(e.target.value)} placeholder="Enter name..." className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-700" />
                ) : (
                  <p className="text-slate-600">Are you sure you want to delete <span className="font-bold text-red-600">{actionModal.targetName}</span>? This action cannot be undone.</p>
                )}
              </div>
              <div className="p-4 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setActionModal({...actionModal, isOpen: false})} disabled={isProcessing} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={async () => { setIsProcessing(true); try { await actionModal.actionFn(modalInput); setActionModal({...actionModal, isOpen: false}); } catch(e) { alert("Action failed. Check dependencies."); } finally { setIsProcessing(false); } }} disabled={isProcessing || (actionModal.type === 'add' && !modalInput.trim())} className={`px-5 py-2.5 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 ${actionModal.type === 'add' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {isProcessing ? 'Processing...' : (actionModal.type === 'add' ? 'Save Location' : 'Yes, Delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalespersonFormModal;

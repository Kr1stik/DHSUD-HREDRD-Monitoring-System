import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { nirLocations } from '../utils/constants';

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
    broker_name: '',
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

  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (salesperson) {
      setFormData(salesperson);
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
        broker_name: '',
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
    }
  }, [salesperson, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (mode === 'view') return;
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
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

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'valid_years') {
        data.append(key, JSON.stringify(formData[key]));
      } else if (key === 'photo') {
        // Skip current photo string if it exists
      } else {
        data.append(key, formData[key] === null ? '' : formData[key]);
      }
    });

    if (photo) {
      data.append('photo', photo);
    }

    try {
      if (mode === 'edit' && salesperson?.id) {
        await axios.patch(`/api/salespersons/${salesperson.id}/`, data);
      } else {
        await axios.post('/api/salespersons/', data);
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

  const provinces = Object.keys(nirLocations);
  const cities = nirLocations[formData.province as keyof typeof nirLocations] || [];
  const isView = mode === 'view';

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
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

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Section: Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Personal Information</h3>
              
              {isView && salesperson?.photo && (
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-xl border-4 border-slate-100 overflow-hidden shadow-lg">
                    <img 
                      src={salesperson.photo.startsWith('http') ? salesperson.photo : `http://localhost:8000${salesperson.photo}`} 
                      alt="Salesperson" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input disabled={isView} required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                  <input disabled={isView} type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input disabled={isView} required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suffix</label>
                  <input disabled={isView} type="text" name="suffix" value={formData.suffix} onChange={handleChange} placeholder="Jr., III, etc." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700">Phone No.</label>
                  <input disabled={isView} type="text" name="phone_no" value={formData.phone_no} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Province</label>
                  <select disabled={isView} name="province" value={formData.province} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500">
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City/Municipality</label>
                  <select disabled={isView} name="city_municipality" value={formData.city_municipality} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500">
                    <option value="">Select City/Municipality</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street / Specific Address</label>
                  <input disabled={isView} type="text" name="address_street" value={formData.address_street} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Broker Name</label>
                  <input disabled={isView} type="text" name="broker_name" value={formData.broker_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Broker PRN</label>
                  <input disabled={isView} type="text" name="broker_prn" value={formData.broker_prn} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Registration</label>
                  <input disabled={isView} type="date" name="broker_date_of_reg" value={formData.broker_date_of_reg} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Place of Registration</label>
                  <input disabled={isView} type="text" name="broker_place_of_reg" value={formData.broker_place_of_reg} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>
            </div>

            {/* Section: Registration & Payments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-700 border-b pb-2">Registration & Payments</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">PRC Accre No.</label>
                  <input disabled={isView} type="text" name="prc_accre_no" value={formData.prc_accre_no} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PRC Validity</label>
                  <input disabled={isView} type="date" name="sp_prc_reg_validity" value={formData.sp_prc_reg_validity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <input disabled={isView} type="date" name="or_date" value={formData.or_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Surety Bond Validity</label>
                  <input disabled={isView} type="date" name="surety_bond_validity" value={formData.surety_bond_validity} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Date Filed</label>
                  <input disabled={isView} type="date" name="date_filed" value={formData.date_filed} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Registration</label>
                  <input disabled={isView} type="date" name="date_of_registration" value={formData.date_of_registration} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
                </div>
                <div className="flex items-center mt-6">
                  <input disabled={isView} type="checkbox" name="is_renewal" checked={formData.is_renewal} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50" />
                  <label className="ml-2 block text-sm text-gray-900">Renewal Application</label>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea disabled={isView} name="note" value={formData.note} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500" />
            </div>
          </div>

          {/* Pinned Footer */}
          <div className="flex-none p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
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
      </div>
    </div>
  );
};

export default SalespersonFormModal;

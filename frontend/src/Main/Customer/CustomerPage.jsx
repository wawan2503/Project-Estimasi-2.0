import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Users, X, Save, Edit2, Trash2, Search, Building2, Phone, Mail, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import MobileHeader from '../../components/MobileHeader';
import { api } from '../../lib/api';

const ITEMS_PER_PAGE = 20;

const CustomerPage = ({ setSidebarOpen }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const emptyForm = { name: '', contact: '', phone: '', email: '', address: '', type: 'Corporate' };
  const [formData, setFormData] = useState(emptyForm);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/customers?limit=500&offset=0');
      setCustomers(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers().catch((e) => alert(e.message));
  }, []);

  const openAddModal = () => { setEditingCustomer(null); setFormData(emptyForm); setIsModalOpen(true); };
  const openEditModal = (customer) => { setEditingCustomer(customer); setFormData({ ...customer }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingCustomer(null); setFormData(emptyForm); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      if (editingCustomer?.id) {
        const res = await api.patch(`/api/customers/${editingCustomer.id}`, formData);
        const updated = res.data;
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const res = await api.post('/api/customers', formData);
        const created = res.data;
        setCustomers((prev) => [created, ...prev]);
      }
      closeModal();
    })().catch((err) => alert(err.message));
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus customer ini?')) {
      api
        .delete(`/api/customers/${id}`)
        .then(() => setCustomers((prev) => prev.filter((c) => c.id !== id)))
        .catch((err) => alert(err.message));
    }
  };

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.contact.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.address.toLowerCase().includes(search)
    );
  }, [customers, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <MobileHeader setSidebarOpen={setSidebarOpen} title="Customers" />
      
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <Users size={28} className="text-blue-600" /> Customer Database
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {loading ? 'Loading...' : `${filteredCustomers.length} of ${customers.length} customers`}
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-[250px]">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button onClick={openAddModal} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg font-semibold shadow flex items-center gap-2">
                <Plus size={18} /> <span className="hidden sm:inline">Add Customer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto py-6">
          
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {paginatedCustomers.map((c) => (
              <div key={c.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{c.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.type === 'Corporate' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{c.type}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(c)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16}/></button>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400 mt-3">
                  <p className="flex items-center gap-2"><User size={14}/> {c.contact}</p>
                  <p className="flex items-center gap-2"><Phone size={14}/> {c.phone}</p>
                  <p className="flex items-center gap-2"><Mail size={14}/> {c.email}</p>
                  <p className="flex items-center gap-2 text-xs"><MapPin size={14}/> {c.address}</p>
                </div>
              </div>
            ))}
            {paginatedCustomers.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users size={32} className="mx-auto mb-2" />
                <p>No customers found</p>
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-xl shadow-sm overflow-hidden bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Contact Person</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-600 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-white">{c.name}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[200px]">{c.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.contact}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{c.phone}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{c.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.type === 'Corporate' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => openEditModal(c)} className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 size={16}/></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedCustomers.length === 0 && (
                    <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-400"><Users size={24} className="mx-auto mb-2" />No customers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
              <span className="text-xs text-slate-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} of {filteredCustomers.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={14}/> Prev
                </button>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <input type="number" min="1" max={totalPages} value={currentPage} onChange={(e) => { const val = parseInt(e.target.value) || 1; setCurrentPage(Math.min(Math.max(1, val), totalPages)); }} className="w-10 text-center text-xs font-bold bg-transparent text-blue-700 dark:text-blue-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300">/ {totalPages}</span>
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  Next <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {editingCustomer ? <Edit2 size={22} className="text-orange-500" /> : <Users size={22} className="text-blue-600" />}
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><Building2 size={16} className="text-blue-500"/> Company Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="PT Example" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><User size={16} className="text-green-500"/> Contact Person *</label>
                <input type="text" name="contact" required value={formData.contact} onChange={handleInputChange} placeholder="John Doe" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><Phone size={16} className="text-orange-500"/> Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="021-1234567" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><Mail size={16} className="text-purple-500"/> Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@company.com" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2"><MapPin size={16} className="text-red-500"/> Address</label>
                <textarea name="address" rows="2" value={formData.address} onChange={handleInputChange} placeholder="Jl. Example No. 123, Jakarta" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Corporate">Corporate</option>
                  <option value="Retail">Retail</option>
                  <option value="Government">Government</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className={`px-5 py-2.5 rounded-lg font-semibold text-white flex items-center gap-2 shadow ${editingCustomer ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  <Save size={18} /> {editingCustomer ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPage;

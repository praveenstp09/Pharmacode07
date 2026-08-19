import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  DollarSign,
  FileCheck,
  Plus,
  Trash2,
  Edit,
  Tag,
  Clock,
  BookOpen,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'series', 'papers', 'coupons', 'orders', 'students', 'contacts'
  const [stats, setStats] = useState(null);
  const [seriesList, setSeriesList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [students, setStudents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Test Series Form State
  const [newSeries, setNewSeries] = useState({
    title: '',
    slug: '',
    examType: 'GSSSB',
    category: 'Competitive Exam',
    price: 499,
    discountPrice: 199,
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
    totalTests: 1,
    totalQuestions: 120,
  });

  // New Coupon Form State
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: 10,
    maxDiscount: 100,
    minOrderValue: 99,
    expiryDays: 30,
  });

  // New Question Form State
  const [selectedSeriesForPaper, setSelectedSeriesForPaper] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [paperNumber, setPaperNumber] = useState(1);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctOptionIndex: 0,
    explanation: '',
    subject: 'Pharmacology',
  });
  const [paperQuestions, setPaperQuestions] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [isAdmin, activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats' || !stats) {
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success) setStats(statsRes.data.data);
      }

      if (activeTab === 'series' || activeTab === 'papers') {
        const sRes = await api.get('/test-series');
        if (sRes.data.success) {
          setSeriesList(sRes.data.data);
          if (!selectedSeriesForPaper && sRes.data.data.length > 0) {
            setSelectedSeriesForPaper(sRes.data.data[0]._id);
          }
        }
      }

      if (activeTab === 'coupons') {
        const cRes = await api.get('/admin/coupons');
        if (cRes.data.success) setCoupons(cRes.data.data);
      }

      if (activeTab === 'orders') {
        const oRes = await api.get('/admin/orders');
        if (oRes.data.success) setOrders(oRes.data.data);
      }

      if (activeTab === 'students') {
        const uRes = await api.get('/admin/students');
        if (uRes.data.success) setStudents(uRes.data.data);
      }

      if (activeTab === 'contacts') {
        const cntRes = await api.get('/admin/contacts');
        if (cntRes.data.success) setContacts(cntRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/test-series', {
        ...newSeries,
        slug: newSeries.slug || newSeries.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      });
      if (res.data.success) {
        alert('Test Series created successfully!');
        fetchAdminData();
        setNewSeries({
          title: '',
          slug: '',
          examType: 'GSSSB',
          category: 'Competitive Exam',
          price: 499,
          discountPrice: 199,
          description: '',
          thumbnail: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80',
          totalTests: 1,
          totalQuestions: 120,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating test series');
    }
  };

  const handleDeleteSeries = async id => {
    if (!window.confirm('Are you sure you want to delete this test series and all its papers?')) return;
    try {
      await api.delete(`/admin/test-series/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete series');
    }
  };

  const handleCreateCoupon = async e => {
    e.preventDefault();
    try {
      const expiryDate = new Date(Date.now() + newCoupon.expiryDays * 24 * 60 * 60 * 1000);
      const res = await api.post('/admin/coupons', {
        code: newCoupon.code.toUpperCase(),
        discountPercent: Number(newCoupon.discountPercent),
        maxDiscount: Number(newCoupon.maxDiscount),
        minOrderValue: Number(newCoupon.minOrderValue),
        expiryDate,
      });
      if (res.data.success) {
        alert('Coupon created successfully!');
        fetchAdminData();
        setNewCoupon({
          code: '',
          discountPercent: 10,
          maxDiscount: 100,
          minOrderValue: 99,
          expiryDays: 30,
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating coupon');
    }
  };

  const handleDeleteCoupon = async id => {
    try {
      await api.delete(`/admin/coupons/${id}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  const handleAddQuestionToQueue = e => {
    e.preventDefault();
    if (!newQuestion.questionText || !newQuestion.optA || !newQuestion.optB) {
      alert('Please enter question text and at least options A and B');
      return;
    }

    const qObj = {
      questionText: newQuestion.questionText,
      options: [newQuestion.optA, newQuestion.optB, newQuestion.optC, newQuestion.optD],
      correctOptionIndex: Number(newQuestion.correctOptionIndex),
      explanation: newQuestion.explanation,
      subject: newQuestion.subject,
    };

    setPaperQuestions(prev => [...prev, qObj]);
    setNewQuestion({
      questionText: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      correctOptionIndex: 0,
      explanation: '',
      subject: newQuestion.subject,
    });
  };

  const handleSavePaper = async () => {
    if (!selectedSeriesForPaper) {
      alert('Please select a Test Series first');
      return;
    }
    if (!paperTitle) {
      alert('Please provide a title for the Mock Paper (e.g. GSSSB Model Paper 2)');
      return;
    }
    if (paperQuestions.length === 0) {
      alert('Please add at least 1 question to this paper');
      return;
    }

    try {
      const res = await api.post('/admin/test-papers', {
        testSeriesId: selectedSeriesForPaper,
        title: paperTitle,
        paperNumber: Number(paperNumber),
        durationMinutes: 120,
        totalMarks: paperQuestions.length,
        positiveMarks: 1,
        negativeMarks: 0.25,
        difficulty: 'Medium',
        questions: paperQuestions,
        published: true,
      });

      if (res.data.success) {
        alert(`Mock Paper "${paperTitle}" with ${paperQuestions.length} MCQs saved successfully!`);
        setPaperTitle('');
        setPaperQuestions([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save test paper');
    }
  };

  return (
    <div className="min-h-screen py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Pharmacode07Exams Admin Panel
          </h1>
          <p className="text-xs text-slate-400">
            Manage 120 MCQ Model Papers, Question Bank, Coupons, and Student Sales.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-200 scrollbar-none">
        {[
          { id: 'stats', name: 'Dashboard Stats', icon: ShieldCheck },
          { id: 'series', name: 'Test Series Packages', icon: FileCheck },
          { id: 'papers', name: '120 MCQ Question Builder', icon: Plus },
          { id: 'coupons', name: 'Discount Coupons', icon: Tag },
          { id: 'orders', name: 'Sales & Orders', icon: DollarSign },
          { id: 'students', name: 'Registered Students', icon: Users },
          { id: 'contacts', name: 'Student Inquiries', icon: Mail },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD STATS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Total Revenue</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                ₹{stats.totalRevenue}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Paid Orders</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {stats.totalOrders}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Registered Students</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                {stats.totalStudents}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-500">Tests Attempted</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                {stats.totalAttempts}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Student Purchases</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Item</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentOrders?.map(ord => (
                    <tr key={ord._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{ord.userId?.name || 'Guest'}</div>
                        <div className="text-xs text-slate-400">{ord.userId?.mobile}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 truncate max-w-[200px]">
                        {ord.items?.[0]?.title || 'Test Series'}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        ₹{ord.totalAmount}
                      </td>
                      <td className="py-3 px-4 uppercase text-xs font-bold text-blue-600">
                        {ord.paymentMethod}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                          {ord.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEST SERIES PACKAGES */}
      {activeTab === 'series' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Add New Test Series Package</h3>
            <form onSubmit={handleCreateSeries} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700">Package Title</label>
                <input
                  type="text"
                  required
                  value={newSeries.title}
                  onChange={e => setNewSeries({ ...newSeries, title: e.target.value })}
                  placeholder="e.g. GSSSB Junior Pharmacist 120 MCQ Series"
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Exam Type</label>
                  <input
                    type="text"
                    required
                    value={newSeries.examType}
                    onChange={e => setNewSeries({ ...newSeries, examType: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Total Questions</label>
                  <input
                    type="number"
                    value={newSeries.totalQuestions}
                    onChange={e => setNewSeries({ ...newSeries, totalQuestions: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">MRP Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newSeries.price}
                    onChange={e => setNewSeries({ ...newSeries, price: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newSeries.discountPrice}
                    onChange={e => setNewSeries({ ...newSeries, discountPrice: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newSeries.description}
                  onChange={e => setNewSeries({ ...newSeries, description: e.target.value })}
                  className="w-full mt-1 p-2.5 border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
              >
                Create Package
              </button>
            </form>
          </div>

          {/* List of existing series */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Active Test Series ({seriesList.length})</h3>
            <div className="space-y-3">
              {seriesList.map(s => (
                <div
                  key={s._id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase">
                      {s.examType}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                    <div className="text-xs text-slate-500">
                      ₹{s.discountPrice} (MRP: ₹{s.price}) • {s.totalQuestions} Questions
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSeries(s._id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Delete Series"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 120 MCQ QUESTION BUILDER */}
      {activeTab === 'papers' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                120 MCQ Test Paper Builder
              </h3>
              <p className="text-xs text-slate-500">
                Create new mock test papers with questions, options, and explanations.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">
                Queue: {paperQuestions.length} Questions Ready
              </span>
              <button
                type="button"
                onClick={handleSavePaper}
                disabled={paperQuestions.length === 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow disabled:opacity-50"
              >
                Save Paper to DB
              </button>
            </div>
          </div>

          {/* Paper Meta Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl">
            <div>
              <label className="text-xs font-bold text-slate-700">Select Test Series</label>
              <select
                value={selectedSeriesForPaper}
                onChange={e => setSelectedSeriesForPaper(e.target.value)}
                className="w-full mt-1 p-2 bg-white border rounded-xl text-xs font-semibold"
              >
                {seriesList.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Mock Paper Title</label>
              <input
                type="text"
                value={paperTitle}
                onChange={e => setPaperTitle(e.target.value)}
                placeholder="e.g. GSSSB Junior Pharmacist Mock Paper 2"
                className="w-full mt-1 p-2 bg-white border rounded-xl text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Paper Number</label>
              <input
                type="number"
                value={paperNumber}
                onChange={e => setPaperNumber(e.target.value)}
                className="w-full mt-1 p-2 bg-white border rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Add Single Question Form */}
          <form onSubmit={handleAddQuestionToQueue} className="space-y-4 border border-slate-200 p-5 rounded-2xl">
            <h4 className="font-bold text-slate-900 text-sm">
              Add Question #{paperQuestions.length + 1}
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-700">Question Text</label>
              <textarea
                required
                rows={2}
                value={newQuestion.questionText}
                onChange={e => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                placeholder="Enter the pharmacy MCQ question text..."
                className="w-full mt-1 p-2.5 border rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Option A</label>
                <input
                  type="text"
                  required
                  value={newQuestion.optA}
                  onChange={e => setNewQuestion({ ...newQuestion, optA: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Option B</label>
                <input
                  type="text"
                  required
                  value={newQuestion.optB}
                  onChange={e => setNewQuestion({ ...newQuestion, optB: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Option C</label>
                <input
                  type="text"
                  required
                  value={newQuestion.optC}
                  onChange={e => setNewQuestion({ ...newQuestion, optC: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Option D</label>
                <input
                  type="text"
                  required
                  value={newQuestion.optD}
                  onChange={e => setNewQuestion({ ...newQuestion, optD: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Correct Option</label>
                <select
                  value={newQuestion.correctOptionIndex}
                  onChange={e => setNewQuestion({ ...newQuestion, correctOptionIndex: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-xs font-bold bg-white"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Subject</label>
                <select
                  value={newQuestion.subject}
                  onChange={e => setNewQuestion({ ...newQuestion, subject: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-xl text-xs font-bold bg-white"
                >
                  <option value="Pharmacology">Pharmacology</option>
                  <option value="Pharmaceutics">Pharmaceutics</option>
                  <option value="Pharmaceutical Chemistry">Pharmaceutical Chemistry</option>
                  <option value="Pharmacognosy">Pharmacognosy</option>
                  <option value="Human Anatomy & Physiology">Human Anatomy & Physiology</option>
                  <option value="Pharmaceutical Jurisprudence">Pharmaceutical Jurisprudence</option>
                  <option value="Hospital & Clinical Pharmacy">Hospital & Clinical Pharmacy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Detailed Solution / Explanation</label>
              <textarea
                rows={2}
                value={newQuestion.explanation}
                onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                placeholder="Explain why this option is correct..."
                className="w-full mt-1 p-2.5 border rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow"
            >
              + Add Question to Queue
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Create Discount Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-700">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  placeholder="e.g. PHARMA20"
                  className="w-full mt-1 p-2.5 border rounded-xl uppercase font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700">Discount %</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountPercent}
                    onChange={e => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={e => setNewCoupon({ ...newCoupon, maxDiscount: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow"
              >
                Create Promo Code
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Active Coupons ({coupons.length})</h3>
            {coupons.map(c => (
              <div
                key={c._id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-extrabold text-sm text-indigo-700">{c.code}</div>
                  <div className="text-xs text-slate-500">
                    {c.discountPercent}% OFF (Max: ₹{c.maxDiscount}) • Used {c.usedCount} times
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCoupon(c._id)}
                  className="p-2 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS & SALES */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">All Transactions ({orders.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Purchased Test Series</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{o.userId?.name}</td>
                    <td className="py-3 px-4 text-slate-700">{o.items?.[0]?.title}</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">₹{o.totalAmount}</td>
                    <td className="py-3 px-4 uppercase text-xs font-bold text-blue-600">
                      {o.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded">
                        {o.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REGISTERED STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Registered Students ({students.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Purchased Tests</th>
                  <th className="py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(st => (
                  <tr key={st._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3 px-4 text-slate-600">{st.email}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">+91 {st.mobile}</td>
                    <td className="py-3 px-4 font-bold text-blue-600">
                      {st.purchasedTests?.length || 0} Series
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(st.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Contact Inquiries ({contacts.length})</h3>
          {contacts.map(c => (
            <div key={c._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-900 text-sm">{c.name} ({c.email})</span>
                <span className="text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-xs font-bold text-blue-600">Subject: {c.subject}</div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

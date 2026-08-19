import React from 'react';
import { ShieldCheck, Target, Award, Heart, BookOpen, Users, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <img
          src="/logo.jpg"
          alt="PharmaCode07 Exams"
          className="w-20 h-20 rounded-3xl object-contain mx-auto shadow-lg border border-slate-100"
        />
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About Pharmacode<span className="text-blue-600">07</span><span className="text-indigo-600">Exams</span>
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          India's dedicated testing and examination preparation platform for pharmacy graduates, diploma holders, and competitive pharmacist aspirants.
        </p>
      </div>

      {/* Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To provide high-quality, exam-standard 120 MCQ model papers and digital revision resources at the most affordable price point, ensuring that every student in India can prepare with confidence and secure their dream government pharmacist job.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Exam-Oriented Accuracy</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our question papers are strictly mapped to the latest syllabus of GSSSB Junior Pharmacist, UPSSSC Pharmacist, RRB, AIIMS, and GPAT examinations with negative marking (-0.25) simulation and clinical explanations.
          </p>
        </div>
      </div>

      {/* Direct Contact Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Have Questions or Need Help?</h3>
          <p className="text-xs sm:text-sm text-blue-100">
            Our support team is available via Phone & WhatsApp at +91 9336331163.
          </p>
        </div>
        <Link
          to="/contact"
          className="px-6 py-3 bg-white text-blue-900 font-bold text-xs sm:text-sm rounded-xl shadow hover:bg-yellow-300 transition whitespace-nowrap self-start sm:self-auto"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
};

export default About;

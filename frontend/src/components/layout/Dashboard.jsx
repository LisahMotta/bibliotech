import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, studentService, loanService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, bgColor, iconColor, subtitle }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: bgColor }}
    >
      <svg className="w-7 h-7" fill="none" stroke={iconColor} viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{title}</div>
      <div className="text-3xl font-extrabold text-slate-800 leading-none">
        {value !== null ? value : <span className="text-slate-300">—</span>}
      </div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </div>
  </div>
);

const QuickAction = ({ to, label, description, bgColor, textColor, icon }) => (
  <Link
    to={to}
    className="group block bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    style={{ textDecoration: 'none' }}
  >
    <div className="flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
        style={{ background: bgColor }}
      >
        <svg className="w-5 h-5" fill="none" stroke={textColor} viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <div>
        <div className="font-semibold text-slate-800 text-sm">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ books: null, students: null, loans: null, overdue: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [booksRes, studentsRes, loansRes] = await Promise.all([
          bookService.getAll().catch(() => ({ data: [] })),
          studentService.getAll().catch(() => ({ data: [] })),
          loanService.getActive().catch(() => ({ data: [] })),
        ]);
        const loans = loansRes.data || [];
        setStats({
          books: booksRes.data?.length ?? 0,
          students: studentsRes.data?.length ?? 0,
          loans: loans.length,
          overdue: loans.filter(l => l.status === 'overdue').length,
        });
      } catch {
        // stats remain null
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-indigo-200 text-sm font-medium mb-1">{greeting()},</div>
            <h2 className="text-2xl font-bold mb-1">{user?.name || 'Usuário'}</h2>
            <p className="text-indigo-200 text-sm">Bem-vindo ao Bibliotech — Sistema de Gerenciamento de Biblioteca</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-indigo-500 bg-opacity-50 flex items-center justify-center flex-shrink-0 hidden sm:flex">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 h-24 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-7 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Livros"
            value={stats.books}
            bgColor="#ede9fe"
            iconColor="#7c3aed"
            subtitle="no acervo"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
          />
          <StatCard
            title="Total de Alunos"
            value={stats.students}
            bgColor="#dbeafe"
            iconColor="#1d4ed8"
            subtitle="cadastrados"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
          />
          <StatCard
            title="Empréstimos Ativos"
            value={stats.loans}
            bgColor="#d1fae5"
            iconColor="#047857"
            subtitle="em andamento"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
          />
          <StatCard
            title="Em Atraso"
            value={stats.overdue}
            bgColor={stats.overdue > 0 ? '#fee2e2' : '#f1f5f9'}
            iconColor={stats.overdue > 0 ? '#b91c1c' : '#94a3b8'}
            subtitle="precisam de atenção"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Acesso Rápido</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            to="/books"
            label="Livros"
            description="Gerenciar acervo"
            bgColor="#ede9fe"
            textColor="#7c3aed"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
          />
          <QuickAction
            to="/students"
            label="Alunos"
            description="Gerenciar alunos"
            bgColor="#dbeafe"
            textColor="#1d4ed8"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
          />
          <QuickAction
            to="/loans"
            label="Empréstimos"
            description="Registrar empréstimo"
            bgColor="#d1fae5"
            textColor="#047857"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
          />
          <QuickAction
            to="/reports"
            label="Relatórios"
            description="Ver estatísticas"
            bgColor="#fef3c7"
            textColor="#b45309"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

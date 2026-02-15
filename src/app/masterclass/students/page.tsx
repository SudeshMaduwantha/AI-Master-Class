'use client';

import { useState, useEffect } from 'react';
import { getStudentsAction, addStudentAction, deleteStudentAction, getClassesAction, addClassAction, Student, ClassItem } from './actions';
import { Loader2, Plus, Trash2, Search, DollarSign, Users, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentManagementPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [isAddingClass, setIsAddingClass] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Forms
    const [studentForm, setStudentForm] = useState({
        name: '', email: '', classId: '', discount: 0, status: 'Paid' as 'Paid' | 'Pending'
    });
    const [classForm, setClassForm] = useState({ name: '', fee: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [studentRes, classRes] = await Promise.all([
            getStudentsAction(),
            getClassesAction()
        ]);
        if (studentRes.students) setStudents(studentRes.students);
        if (classRes.classes) setClasses(classRes.classes);
        setLoading(false);
    };

    // --- CLASS HANDLERS ---
    const handleAddClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classForm.name || !classForm.fee) return;
        setIsAddingClass(true);
        const res = await addClassAction(classForm.name, parseFloat(classForm.fee));
        if (res.success && res.newClass) {
            setClasses(prev => [...prev, res.newClass!]);
            setClassForm({ name: '', fee: '' });
        } else {
            alert('Failed to add class');
        }
        setIsAddingClass(false);
    };

    // --- STUDENT HANDLERS ---
    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedClass = classes.find(c => c.id === studentForm.classId);
        if (!selectedClass) return alert("Please select a class");

        setIsAddingStudent(true);
        const fee = selectedClass.fee;
        const discount = Number(studentForm.discount) || 0;

        const res = await addStudentAction({
            name: studentForm.name,
            email: studentForm.email,
            classId: selectedClass.id,
            className: selectedClass.name,
            fee: fee,
            discount: discount,
            status: studentForm.status
        });

        if (res.success && res.student) {
            setStudents(prev => [...prev, res.student!]);
            setStudentForm({ name: '', email: '', classId: '', discount: 0, status: 'Paid' });
        } else {
            alert('Failed to add student');
        }
        setIsAddingStudent(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const res = await deleteStudentAction(id);
        if (res.success) {
            setStudents(prev => prev.filter(s => s.id !== id));
        }
    };

    // --- DERIVED DATA ---
    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = students
        .filter(s => s.status === 'Paid')
        .reduce((sum, s) => sum + (s.finalFee || 0), 0);

    const selectedClassForForm = classes.find(c => c.id === studentForm.classId);
    const estimatedFee = selectedClassForForm ? selectedClassForForm.fee - (Number(studentForm.discount) || 0) : 0;

    return (
        <div style={{ padding: '0 20px', maxWidth: '1400px', margin: '0 auto', paddingBottom: '50px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}
            >
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Management</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Overview of students, classes, and revenue.</p>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(124, 58, 237, 0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: '#a78bfa' }}>Total Students</span>
                        <Users color="#a78bfa" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{students.length}</h2>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: '#34d399' }}>Total Revenue</span>
                        <DollarSign color="#34d399" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>LKR {totalRevenue}</h2>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ color: '#fbbf24' }}>Active Classes</span>
                        <BookOpen color="#fbbf24" />
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{classes.length}</h2>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexDirection: 'column', lg: 'row' } as any}>

                {/* LEFT COLUMN: Lists */}
                <div style={{ flex: 3 }}>
                    {/* Roster Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.5rem' }}>Student Roster</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ background: 'rgba(20, 20, 35, 0.6)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>Name / Email</th>
                                    <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>Class</th>
                                    <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>Fee Breakdown</th>
                                    <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>Status</th>
                                    <th style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }} />
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {loading ? (
                                        <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></td></tr>
                                    ) : filteredStudents.map((student) => (
                                        <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '20px' }}>
                                                <div style={{ fontWeight: 'bold' }}>{student.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{student.email}</div>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>{student.className || 'Unknown'}</span>
                                            </td>
                                            <td style={{ padding: '20px', fontSize: '0.9rem' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>LKR {student.fee}</span>
                                                    {student.discount > 0 && <span style={{ color: '#f87171', fontSize: '0.8rem' }}>- LKR {student.discount}</span>}
                                                    <span style={{ fontWeight: 'bold', color: '#34d399' }}>= LKR {student.finalFee}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <span style={{
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem',
                                                    background: student.status === 'Paid' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: student.status === 'Paid' ? '#34d399' : '#f87171',
                                                    display: 'inline-flex', alignItems: 'center', gap: '5px'
                                                }}>
                                                    {student.status === 'Paid' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px' }}>
                                                <button onClick={() => handleDelete(student.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(239, 68, 68, 0.7)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {!loading && filteredStudents.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No students found. Add one to get started.</div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Forms */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '320px' }}>

                    {/* Add Class Form */}
                    <div style={{ background: 'rgba(20, 20, 35, 0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BookOpen size={18} /> Create Class
                        </h2>
                        <form onSubmit={handleAddClass} style={{ display: 'grid', gap: '10px' }}>
                            <input
                                placeholder="Class Name (e.g. Physics 2024)"
                                value={classForm.name}
                                onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                                required
                                style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 'bold' }}>LKR</span>
                                <input
                                    type="number"
                                    placeholder="Fee Amount"
                                    value={classForm.fee}
                                    onChange={e => setClassForm({ ...classForm, fee: e.target.value })}
                                    required
                                    style={{ padding: '10px 10px 10px 45px', width: '100%', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }}
                                />
                            </div>
                            <button disabled={isAddingClass} style={{ padding: '10px', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.4)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {isAddingClass ? 'Saving...' : 'Save Class'}
                            </button>
                        </form>

                        {/* Mini Class List */}
                        <div style={{ marginTop: '15px', maxHeight: '150px', overflowY: 'auto' }}>
                            {classes.map(c => (
                                <div key={c.id} style={{ fontSize: '0.85rem', padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{c.name}</span>
                                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>LKR {c.fee}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add Student Form */}
                    <div style={{ background: 'rgba(20, 20, 35, 0.8)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Register Student</h2>
                        <form onSubmit={handleAddStudent} style={{ display: 'grid', gap: '15px' }}>
                            <input
                                placeholder="Student Name"
                                value={studentForm.name}
                                onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                                required
                                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={studentForm.email}
                                onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                                required
                                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />

                            <select
                                value={studentForm.classId}
                                onChange={e => setStudentForm({ ...studentForm, classId: e.target.value })}
                                required
                                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                <option value="" style={{ color: 'gray' }}>Select Class</option>
                                {classes.map(c => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name} (LKR {c.fee})</option>)}
                            </select>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>Discount</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={studentForm.discount}
                                        onChange={e => setStudentForm({ ...studentForm, discount: Number(e.target.value) })}
                                        style={{ padding: '10px', width: '100%', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', display: 'block' }}>Status</label>
                                    <select
                                        value={studentForm.status}
                                        onChange={e => setStudentForm({ ...studentForm, status: e.target.value as any })}
                                        style={{ padding: '10px', width: '100%', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    >
                                        <option value="Paid" style={{ color: 'black' }}>Paid</option>
                                        <option value="Pending" style={{ color: 'black' }}>Pending</option>
                                    </select>
                                </div>
                            </div>

                            {selectedClassForForm && (
                                <div style={{ padding: '10px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '8px', fontSize: '0.9rem', color: '#34d399', textAlign: 'center' }}>
                                    Net Fee: <span style={{ fontWeight: 'bold' }}>LKR {Math.max(0, estimatedFee)}</span>
                                </div>
                            )}

                            <button disabled={isAddingStudent} style={{ padding: '12px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {isAddingStudent ? <Loader2 className="animate-spin" /> : 'Register'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

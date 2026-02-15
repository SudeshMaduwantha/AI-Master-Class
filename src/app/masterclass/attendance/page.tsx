'use client';

import { useState, useEffect } from 'react';
import { getClassesAction, getStudentsAction, Student, ClassItem } from '../students/actions';
import { getAttendanceAction, saveAttendanceAction } from './actions';
import { Loader2, Calendar, Check, Save, UserCheck, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection State
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [presentStudentIds, setPresentStudentIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedDate) {
            loadAttendance();
        }
    }, [selectedClassId, selectedDate]);

    const loadData = async () => {
        setLoading(true);
        const [studentRes, classRes] = await Promise.all([
            getStudentsAction(),
            getClassesAction()
        ]);
        if (studentRes.students) setStudents(studentRes.students);
        if (classRes.classes) {
            setClasses(classRes.classes);
            if (classRes.classes.length > 0) setSelectedClassId(classRes.classes[0].id);
        }
        setLoading(false);
    };

    const loadAttendance = async () => {
        const res = await getAttendanceAction(selectedDate, selectedClassId);
        if (res.presentStudentIds) {
            setPresentStudentIds(res.presentStudentIds);
        } else {
            setPresentStudentIds([]);
        }
    };

    const toggleStudent = (id: string) => {
        setPresentStudentIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await saveAttendanceAction(selectedDate, selectedClassId, presentStudentIds);
        if (res.success) {
            alert('Attendance Saved!');
        } else {
            alert('Failed to save attendance');
        }
        setIsSaving(false);
    };

    const classStudents = students.filter(s => s.classId === selectedClassId);

    return (
        <div style={{ padding: '0 20px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Attendance</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>Mark daily attendance for your classes.</p>
                </div>
            </motion.div>

            {/* Controls */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Select Class</label>
                    <div style={{ position: 'relative' }}>
                        <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            {classes.map(c => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Date</label>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                <div style={{ alignSelf: 'center', marginTop: 'auto' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !selectedClassId}
                        style={{
                            padding: '12px 24px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            opacity: (!selectedClassId) ? 0.5 : 1,
                            height: '42px', // Match input height roughly
                            marginTop: '24px' // Align with inputs (label height + gap)
                        }}
                    >
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                        Save Record
                    </button>
                </div>
            </div>

            {/* Student Checklist */}
            <div style={{ background: 'rgba(20, 20, 35, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.2rem' }}>Students ({classStudents.length})</h2>
                    <div style={{ fontSize: '0.9rem', color: '#10b981' }}>Present: {presentStudentIds.length}</div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" style={{ margin: '0 auto' }} /></div>
                ) : classStudents.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No students enrolled in this class.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                        {classStudents.map(student => {
                            const isPresent = presentStudentIds.includes(student.id);
                            return (
                                <div
                                    key={student.id}
                                    onClick={() => toggleStudent(student.id)}
                                    style={{
                                        background: 'var(--background)', // Fallback to theme bg? Using hex for now to be safe
                                        backgroundColor: '#0a0a0a',
                                        padding: '20px',
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '15px',
                                        transition: 'background 0.2s'
                                    }}
                                    className="hover:bg-white/5" // Tailwind fallback
                                >
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '6px',
                                        border: `2px solid ${isPresent ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                                        background: isPresent ? '#10b981' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}>
                                        {isPresent && <Check size={16} color="white" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', color: isPresent ? 'white' : 'rgba(255,255,255,0.7)' }}>{student.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{student.status}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

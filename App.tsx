
import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import type { PageView } from './types';

import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';

const App = () => {
    const [page, setPage] = useState<PageView>({ name: 'home' });

    const renderPage = () => {
        switch (page.name) {
            case 'home':
                return <HomePage setPage={setPage} />;
            case 'profile':
                return <ProfilePage profileId={page.profileId} setPage={setPage} />;
            case 'editProfile':
                return <EditProfilePage profileId={page.profileId} setPage={setPage} />;
            case 'login':
                return <LoginPage setPage={setPage} />;
            case 'signup':
                return <SignUpPage setPage={setPage} />;
            default:
                return <HomePage setPage={setPage} />;
        }
    };

    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="min-h-screen flex flex-col dark:bg-slate-900 transition-colors duration-200">
                    <Header setPage={setPage} />
                    <main className="flex-grow">
                        {renderPage()}
                    </main>
                    <footer className="bg-white dark:bg-slate-800 mt-auto border-t dark:border-slate-700 transition-colors duration-200">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">เกี่ยวกับเรา</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        TechPro E-Portfolio คือแพลตฟอร์มสำหรับผู้เชี่ยวชาญด้านเทคโนโลยีในการแสดงผลงาน ทักษะ และประวัติการทำงาน 
                                        เพื่อเชื่อมต่อกับโอกาสทางอาชีพและสร้างเครือข่ายกับผู้ประกอบวิชาชีพในอุตสาหกรรมเดียวกัน 
                                        เรามุ่งมั่นที่จะเป็นพื้นที่ที่ช่วยให้ความสามารถของคุณโดดเด่นอย่างแท้จริง
                                    </p>
                                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                                        <p className="font-semibold text-gray-800 dark:text-white">ผู้จัดทำ:</p>
                                        <p>นายปัณณวัฒฒ์ กาแก้ว</p>
                                        <p>นายอัษฎาวุธ เดชาสุริยานนท์</p>
                                        <p>นายธัญวิศิษฎ์ กำนนมาศ</p>
                                        <p className="mt-2">นักศึกษาชั้นปีที่ 2 มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</p>
                                        <p className="mt-2"><span className="font-semibold">ติดต่อ:</span> pannawattam@gmail.com</p>
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                                        &copy; {new Date().getFullYear()} TechPro E-Portfolio. สงวนลิขสิทธิ์
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;

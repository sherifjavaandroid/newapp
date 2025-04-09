// src/App.js - ملف التطبيق الرئيسي
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// المكونات
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// الصفحات
import Dashboard from './pages/Dashboard';
import ReportDetail from './pages/ReportDetail';
import AnalyzeRepo from './pages/AnalyzeRepo';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// األنماط
import './styles/tailwind.css';

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow bg-gray-50">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/report/:reportId" element={<ReportDetail />} />
                            <Route path="/analyze" element={<AnalyzeRepo />} />
                        </Route>

                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
                <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            </div>
        </Router>
    );
}

export default App;

// src/pages/Login.js - صفحة تسجيل الدخول
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { login } from '../services/auth';
import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('الرجاء إدخال جميع الحقول المطلوبة');
            return;
        }

        try {
            setLoading(true);
            await login(email, password);

            toast.success('تم تسجيل الدخول بنجاح');

            // التوجيه إلى الصفحة المطلوبة أو لوحة التحكم
            const redirectPath = location.state?.from?.pathname || '/dashboard';
            navigate(redirectPath);
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
            setError(
                error.response?.data?.error ||
                'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div dir="rtl" className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">تسجيل الدخول</h1>

                {error && (
                    <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-6 flex items-start">
                        <AlertCircle size={20} className="ml-2 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                            البريد الإلكتروني
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Mail size={20} className="text-gray-500" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Lock size={20} className="text-gray-500" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center justify-center disabled:bg-blue-300"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                جاري تسجيل الدخول...
                            </>
                        ) : (
                            'تسجيل الدخول'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        ليس لديك حساب؟{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-800">
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

// src/pages/Register.js - صفحة إنشاء حساب جديد
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';
import { register } from '../services/auth';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { username, email, password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !confirmPassword) {
            setError('الرجاء إدخال جميع الحقول المطلوبة');
            return;
        }

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        if (password.length < 6) {
            setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
            return;
        }

        try {
            setLoading(true);
            await register(username, email, password);

            toast.success('تم إنشاء الحساب بنجاح');
            navigate('/dashboard');
        } catch (error) {
            console.error('خطأ في إنشاء الحساب:', error);
            setError(
                error.response?.data?.error ||
                'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div dir="rtl" className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">إنشاء حساب جديد</h1>

                {error && (
                    <div className="bg-red-100 border-r-4 border-red-500 text-red-700 p-4 mb-6 flex items-start">
                        <AlertCircle size={20} className="ml-2 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                            اسم المستخدم
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <User size={20} className="text-gray-500" />
                            </div>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                                placeholder="اسم المستخدم"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                            البريد الإلكتروني
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Mail size={20} className="text-gray-500" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Lock size={20} className="text-gray-500" />
                            </div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                            تأكيد كلمة المرور
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Lock size={20} className="text-gray-500" />
                            </div>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center justify-center disabled:bg-blue-300"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                جاري إنشاء الحساب...
                            </>
                        ) : (
                            'إنشاء حساب'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        لديك حساب بالفعل؟{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-800">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

// src/pages/NotFound.js - صفحة 404
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound = () => {
    return (
        <div dir="rtl" className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
                <AlertCircle size={64} className="mx-auto text-red-500 mb-4" />
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">الصفحة غير موجودة</h2>
                <p className="text-gray-600 mb-8">
                    عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها.
                </p>
                <Link
                    to="/dashboard"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm inline-flex items-center"
                >
                    <Home size={16} className="ml-1" />
                    العودة إلى الصفحة الرئيسية
                </Link>
            </div>
        </div>
    );
};

export default NotFound;

// src/components/Header.js - مكون الهيدر
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { isAuthenticated, logout, getUser } from '../services/auth';
import logo from '../assets/logo.svg';

const Header = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const authenticated = isAuthenticated();
    const user = getUser();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header dir="rtl" className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img src={logo} alt="Code Analyzer" className="h-8 ml-2" />
                            <span className="text-xl font-bold text-gray-900">تحليل الكود</span>
                        </Link>
                    </div>

                    {authenticated && (
                        <>
                            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                                <Link
                                    to="/dashboard"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    لوحة التحكم
                                </Link>
                                <Link
                                    to="/analyze"
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    تحليل مستودع
                                </Link>
                            </div>

                            <div className="hidden md:flex items-center">
                                <div className="relative group">
                                    <button className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                        <User size={16} className="ml-1" />
                                        {user?.username || 'المستخدم'}
                                    </button>
                                    <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-150 ease-in-out z-10">
                                        <div className="py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut size={16} className="ml-2" />
                                                تسجيل الخروج
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="text-gray-700 hover:text-blue-600 focus:outline-none"
                                >
                                    {isMenuOpen ? (
                                        <X size={24} />
                                    ) : (
                                        <Menu size={24} />
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {!authenticated && (
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <Link
                                to="/login"
                                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                تسجيل الدخول
                            </Link>
                            <Link
                                to="/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                إنشاء حساب
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* القائمة المتنقلة */}
            {authenticated && isMenuOpen && (
                <div className="md:hidden bg-white">
                    <div className="container mx-auto px-4 py-2 border-t">
                        <Link
                            to="/dashboard"
                            className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            لوحة التحكم
                        </Link>
                        <Link
                            to="/analyze"
                            className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            تحليل مستودع
                        </Link>
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full text-right text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <LogOut size={16} className="ml-2" />
                            تسجيل الخروج
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;

// src/components/Footer.js - مكون التذييل
import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer dir="rtl" className="bg-white border-t">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-sm text-gray-600">
                            &copy; {currentYear} نظام تحليل جودة الكود. جميع الحقوق محفوظة.
                        </p>
                    </div>
                    <div className="flex space-x-6 space-x-reverse">
                        <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                            سياسة الخصوصية
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                            شروط الاستخدام
                        </a>
                        <a href="#" className="text-gray-600 hover:text-blue-600 text-sm">
                            اتصل بنا
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

// src/index.js - نقطة الدخول للتطبيق
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);




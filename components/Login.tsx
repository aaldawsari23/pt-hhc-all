import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { AuthService } from '../utils/firebase';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await AuthService.signIn(email, password);
      if (result.success) {
        setSuccess('تم تسجيل الدخول بنجاح');
        setTimeout(() => {
          onLoginSuccess(result.user);
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginOptions = [
    { email: 'salshahrani173@moh.gov.sa', name: 'سعد - مدير', role: 'مدير' },
    { email: 'amemahmoud@mog.gov.sa', name: 'أماني - طبيب', role: 'طبيب' },
    { email: 'aaldawsari23@moh.gov.sa', name: 'عبدالكريم - علاج طبيعي', role: 'علاج طبيعي' },
    { email: 'relbarahamtoshy@moh.gov.sa', name: 'راجيا - ممرض', role: 'ممرض' },
    { email: 'yalbishe@moh.gov.sa', name: 'يوسف - اجتماعي', role: 'اجتماعي' },
    { email: 'thamralshhrany188@gmail.com', name: 'ثامر - سائق', role: 'سائق' }
  ];

  const handleQuickLogin = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('12345');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">KA</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Home Healthcare</h1>
            <p className="text-blue-200 mt-2">مستشفى الملك عبدالله - بيشه</p>
            <p className="text-blue-300 text-sm mt-1">الرعاية الصحية المنزلية</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
            <p className="text-gray-600 mt-2">أدخل بيانات دخولك للنظام</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                  placeholder="أدخل البريد الإلكتروني"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">كلمة المرور الافتراضية: 12345</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Quick Login Options */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3 text-center">تسجيل دخول سريع:</p>
            <div className="grid grid-cols-1 gap-2">
              {quickLoginOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickLogin(option.email)}
                  disabled={loading}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{option.name}</span>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded-full">{option.role}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              في حالة مواجهة مشاكل في تسجيل الدخول، يرجى التواصل مع الدعم الفني
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-200 text-sm">
          <p>© 2024 مستشفى الملك عبدالله - بيشه</p>
          <p>نظام الرعاية الصحية المنزلية</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
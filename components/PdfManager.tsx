import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Plus,
  PrinterIcon,
  FileDown,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { PdfService, PdfFile } from '../utils/pdfService';
import { useFirebase } from '../context/FirebaseContext';

interface PdfManagerProps {
  patientId?: string; // If provided, show PDFs for specific patient
  showUpload?: boolean;
  showGenerate?: boolean;
}

const PdfManager: React.FC<PdfManagerProps> = ({ 
  patientId, 
  showUpload = true, 
  showGenerate = true 
}) => {
  const { currentUser } = useFirebase();
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    { value: '', label: 'جميع الفئات' },
    { value: 'assessment', label: 'تقييمات' },
    { value: 'visit', label: 'زيارات' },
    { value: 'document', label: 'وثائق' },
    { value: 'report', label: 'تقارير' },
    { value: 'general', label: 'عام' }
  ];

  useEffect(() => {
    loadPdfs();
  }, [patientId, searchTerm, selectedCategory]);

  const loadPdfs = async () => {
    try {
      setLoading(true);
      let result;
      
      if (patientId) {
        result = await NetlifyDbService.getPdfsByPatient(patientId);
      } else if (searchTerm || selectedCategory) {
        result = await NetlifyDbService.searchPdfs(searchTerm, selectedCategory);
      } else {
        result = await NetlifyDbService.getAllPdfs();
      }
      
      setPdfs(result);
    } catch (error) {
      console.error('Error loading PDFs:', error);
      setMessage({ type: 'error', text: 'فشل في تحميل ملفات PDF' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    
    try {
      setUploading(true);
      
      // Convert file to bytes
      const arrayBuffer = await uploadFile.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);
      
      const pdfFile: PdfFile = {
        filename: `${Date.now()}_${uploadFile.name}`,
        originalFilename: uploadFile.name,
        fileType: uploadFile.type,
        fileSize: uploadFile.size,
        content,
        patientId,
        category: 'document',
        description: `Uploaded by ${currentUser?.name || 'user'}`,
        uploadedBy: currentUser?.email || 'unknown'
      };
      
      await NetlifyDbService.savePdf(pdfFile);
      setMessage({ type: 'success', text: 'تم رفع الملف بنجاح' });
      setUploadFile(null);
      loadPdfs();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setMessage({ type: 'error', text: 'فشل في رفع الملف' });
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePatientCard = async () => {
    if (!patientId) return;
    
    try {
      setGenerating(true);
      await NetlifyDbService.generatePatientCard(patientId, currentUser?.name);
      setMessage({ type: 'success', text: 'تم إنشاء بطاقة المريض بنجاح' });
      loadPdfs();
    } catch (error) {
      console.error('Error generating patient card:', error);
      setMessage({ type: 'error', text: 'فشل في إنشاء بطاقة المريض' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async (pdfId: number, filename: string) => {
    try {
      const pdfFile = await PdfService.getPdfFile(pdfId);
      if (!pdfFile) return;
      
      // Create blob and download
      const blob = new Blob([pdfFile.content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setMessage({ type: 'error', text: 'فشل في تحميل الملف' });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryLabel = (category: string): string => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <FileText size={20} className="text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">
          {patientId ? 'ملفات PDF للمريض' : 'إدارة ملفات PDF'}
        </h2>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="mr-auto text-sm">×</button>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4 mb-6">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في ملفات PDF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {showUpload && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload size={16} />
                اختيار ملف PDF
              </label>
              {uploadFile && (
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                  رفع الملف
                </button>
              )}
            </div>
          )}

          {showGenerate && patientId && (
            <button
              onClick={handleGeneratePatientCard}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {generating ? <Loader size={16} className="animate-spin" /> : <PrinterIcon size={16} />}
              إنشاء بطاقة المريض
            </button>
          )}
        </div>

        {uploadFile && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              ملف محدد: {uploadFile.name} ({formatFileSize(uploadFile.size)})
            </p>
          </div>
        )}
      </div>

      {/* PDF List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader size={24} className="animate-spin text-blue-600" />
          <span className="mr-2">جاري التحميل...</span>
        </div>
      ) : pdfs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>لا توجد ملفات PDF</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pdfs.map((pdf) => (
            <div key={pdf.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-red-600" />
                <div>
                  <h3 className="font-medium text-gray-800">{pdf.originalFilename}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>الفئة: {getCategoryLabel(pdf.category)}</span>
                    <span>الحجم: {formatFileSize(pdf.fileSize)}</span>
                    {pdf.uploadedAt && (
                      <span>تاريخ الرفع: {new Date(pdf.uploadedAt).toLocaleDateString('ar-SA')}</span>
                    )}
                  </div>
                  {pdf.description && (
                    <p className="text-sm text-gray-500 mt-1">{pdf.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(pdf.id!, pdf.originalFilename)}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="تحميل"
                >
                  <Download size={16} />
                </button>
                <button
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="عرض"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfManager;
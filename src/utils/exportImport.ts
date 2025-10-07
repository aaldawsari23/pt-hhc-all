import { repo } from '../data/local/repo';

export async function exportData() {
  try {
    const jsonData = await repo.exportAll();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `mhhc5-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('فشل في تصدير البيانات');
  }
}

export async function importData(file: File) {
  try {
    const text = await file.text();
    await repo.importAll(text);
    return true;
  } catch (error) {
    console.error('Import error:', error);
    throw new Error('فشل في استيراد البيانات');
  }
}
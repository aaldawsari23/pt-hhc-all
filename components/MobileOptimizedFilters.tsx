import React, { useState, useEffect } from 'react';
import { Filter, Search, MapPin, Users, ShieldCheck, X, ChevronDown, ChevronUp, Settings, SlidersHorizontal, UserCheck } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Role } from '../types';

interface MobileOptimizedFiltersProps {
  isVisible: boolean;
  onClose: () => void;
}

const MobileOptimizedFilters: React.FC<MobileOptimizedFiltersProps> = ({
  isVisible,
  onClose
}) => {
  const { state, dispatch } = useHomeHealthcare();
  const [expandedSection, setExpandedSection] = useState<string | null>('search');
  const [localFilters, setLocalFilters] = useState({
    search: state.filters.search,
    areas: state.filters.areas,
    tags: state.filters.tags,
    sex: state.filters.sex,
    risk: state.filters.risk
  });

  // Sync local filters with global state
  useEffect(() => {
    setLocalFilters({
      search: state.filters.search,
      areas: state.filters.areas,
      tags: state.filters.tags,
      sex: state.filters.sex,
      risk: state.filters.risk
    });
  }, [state.filters]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateLocalFilter = (filterType: keyof typeof localFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    // Apply search
    if (localFilters.search !== state.filters.search) {
      dispatch({ type: 'SET_SEARCH', payload: localFilters.search });
    }

    // Apply area filters
    const currentAreas = new Set(state.filters.areas);
    const newAreas = new Set(localFilters.areas);
    
    // Remove unchecked areas
    currentAreas.forEach(area => {
      if (!newAreas.has(area)) {
        dispatch({ type: 'TOGGLE_AREA_FILTER', payload: area });
      }
    });
    
    // Add newly checked areas
    newAreas.forEach(area => {
      if (!currentAreas.has(area)) {
        dispatch({ type: 'TOGGLE_AREA_FILTER', payload: area });
      }
    });

    // Apply tag filters
    const currentTags = new Set(state.filters.tags);
    const newTags = new Set(localFilters.tags);
    
    currentTags.forEach(tag => {
      if (!newTags.has(tag)) {
        dispatch({ type: 'TOGGLE_TAG_FILTER', payload: tag });
      }
    });
    
    newTags.forEach(tag => {
      if (!currentTags.has(tag)) {
        dispatch({ type: 'TOGGLE_TAG_FILTER', payload: tag });
      }
    });

    // Apply sex filters
    const currentSex = new Set(state.filters.sex);
    const newSex = new Set(localFilters.sex);
    
    currentSex.forEach(sex => {
      if (!newSex.has(sex)) {
        dispatch({ type: 'TOGGLE_SEX_FILTER', payload: sex });
      }
    });
    
    newSex.forEach(sex => {
      if (!currentSex.has(sex)) {
        dispatch({ type: 'TOGGLE_SEX_FILTER', payload: sex });
      }
    });

    // Apply risk filters
    const currentRisk = new Set(state.filters.risk);
    const newRisk = new Set(localFilters.risk);
    
    currentRisk.forEach(risk => {
      if (!newRisk.has(risk)) {
        dispatch({ type: 'TOGGLE_RISK_FILTER', payload: risk });
      }
    });
    
    newRisk.forEach(risk => {
      if (!currentRisk.has(risk)) {
        dispatch({ type: 'TOGGLE_RISK_FILTER', payload: risk });
      }
    });

    onClose();
  };

  const clearAllFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
    setLocalFilters({
      search: '',
      areas: [],
      tags: [],
      sex: [],
      risk: []
    });
  };

  const getActiveFilterCount = () => {
    return localFilters.areas.length + 
           localFilters.tags.length + 
           localFilters.sex.length + 
           localFilters.risk.length +
           (localFilters.search ? 1 : 0);
  };

  // Get unique values from patients
  const uniqueAreas = [...new Set(state.patients.map(p => p.areaId).filter(Boolean))].sort();
  const uniqueTags = [...new Set(state.patients.flatMap(p => p.tags))].sort();
  const uniqueSex = ['Male', 'Female'];
  const riskLevels = ['green', 'yellow', 'red'];

  const renderFilterSection = (
    key: string,
    title: string,
    titleAr: string,
    icon: React.ElementType,
    color: string,
    children: React.ReactNode
  ) => {
    const Icon = icon;
    const isExpanded = expandedSection === key;
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className={`w-full p-4 bg-${color}-50 hover:bg-${color}-100 transition-all flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-${color}-500 rounded-lg flex items-center justify-center text-white`}>
              <Icon size={16} />
            </div>
            <div className="text-left">
              <h3 className={`font-medium text-${color}-900`}>{title}</h3>
              <p className={`text-sm text-${color}-700`}>{titleAr}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {key !== 'search' && (
              <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 text-xs rounded-full`}>
                {key === 'areas' ? localFilters.areas.length :
                 key === 'tags' ? localFilters.tags.length :
                 key === 'sex' ? localFilters.sex.length :
                 key === 'risk' ? localFilters.risk.length : 0}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp size={16} className={`text-${color}-700`} />
            ) : (
              <ChevronDown size={16} className={`text-${color}-700`} />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  const renderCheckboxFilter = (
    items: string[],
    selectedItems: string[],
    filterKey: 'areas' | 'tags' | 'sex' | 'risk',
    getDisplayName?: (item: string) => string
  ) => {
    return (
      <div className="space-y-3">
        {items.map(item => (
          <label key={item} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => {
                const newItems = selectedItems.includes(item)
                  ? selectedItems.filter(i => i !== item)
                  : [...selectedItems, item];
                updateLocalFilter(filterKey, newItems);
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 flex-1">
              {getDisplayName ? getDisplayName(item) : item}
            </span>
            <span className="text-xs text-gray-500">
              ({state.patients.filter(p => {
                if (filterKey === 'areas') return p.areaId === item;
                if (filterKey === 'tags') return p.tags.includes(item);
                if (filterKey === 'sex') return p.sex === item;
                if (filterKey === 'risk') {
                  // Calculate risk level for patient
                  const admissionDate = p.admissionDate ? new Date(p.admissionDate) : new Date();
                  const daysSinceAdmission = Math.floor((Date.now() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
                  const riskLevel = daysSinceAdmission > 90 ? 'red' : daysSinceAdmission > 30 ? 'yellow' : 'green';
                  return riskLevel === item;
                }
                return false;
              }).length})
            </span>
          </label>
        ))}
      </div>
    );
  };

  const getRiskDisplayName = (risk: string) => {
    switch (risk) {
      case 'green': return 'Low Risk | منخفض';
      case 'yellow': return 'Medium Risk | متوسط';
      case 'red': return 'High Risk | عالي';
      default: return risk;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full md:max-w-2xl md:rounded-xl shadow-2xl max-h-[90vh] flex flex-col md:m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">Advanced Filters</h2>
              <p className="text-sm text-blue-700">المرشحات المتقدمة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                {getActiveFilterCount()} active
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Search Section */}
          {renderFilterSection(
            'search',
            'Search Patients',
            'البحث عن المرضى',
            Search,
            'blue',
            <div className="space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={localFilters.search}
                  onChange={(e) => updateLocalFilter('search', e.target.value)}
                  placeholder="Search by name or ID..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                Search by patient name (Arabic) or national ID
              </p>
            </div>
          )}

          {/* Areas Section */}
          {renderFilterSection(
            'areas',
            'Filter by Area',
            'تصفية حسب المنطقة',
            MapPin,
            'green',
            renderCheckboxFilter(uniqueAreas, localFilters.areas, 'areas')
          )}

          {/* Medical Conditions Section */}
          {renderFilterSection(
            'tags',
            'Medical Conditions',
            'الحالات الطبية',
            ShieldCheck,
            'red',
            renderCheckboxFilter(uniqueTags, localFilters.tags, 'tags')
          )}

          {/* Gender Section */}
          {renderFilterSection(
            'sex',
            'Gender',
            'الجنس',
            Users,
            'purple',
            renderCheckboxFilter(uniqueSex, localFilters.sex, 'sex', (sex) => 
              sex === 'Male' ? 'Male | ذكر' : 'Female | أنثى'
            )
          )}

          {/* Risk Level Section */}
          {renderFilterSection(
            'risk',
            'Risk Level',
            'مستوى الخطر',
            Filter,
            'orange',
            renderCheckboxFilter(riskLevels, localFilters.risk, 'risk', getRiskDisplayName)
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
            >
              Clear All | مسح الكل
            </button>
            
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Filter size={16} />
              Apply Filters | تطبيق
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              {state.patients.length} total patients | إجمالي المرضى
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOptimizedFilters;
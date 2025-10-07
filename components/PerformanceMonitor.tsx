/**
 * Performance Monitor Component
 * Monitors app performance and provides real-time feedback for production optimization
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Zap, Clock, AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
    renderTime: number;
    memoryUsage: number;
    loadTime: number;
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    cls: number; // Cumulative Layout Shift
    fid: number; // First Input Delay
}

interface PerformanceMonitorProps {
    enabled?: boolean;
    showOverlay?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
    enabled = process.env.NODE_ENV === 'development',
    showOverlay = false 
}) => {
    const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
    const [isVisible, setIsVisible] = useState(showOverlay);
    const [warnings, setWarnings] = useState<string[]>([]);

    // Collect performance metrics
    const collectMetrics = useCallback(() => {
        if (!enabled) return;

        try {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const paintEntries = performance.getEntriesByType('paint');
            
            const newMetrics: Partial<PerformanceMetrics> = {
                loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
                renderTime: performance.now(),
            };

            // First Contentful Paint
            const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
                newMetrics.fcp = fcpEntry.startTime;
            }

            // Memory usage (if available)
            if ('memory' in performance) {
                const memory = (performance as any).memory;
                newMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
            }

            // Web Vitals using PerformanceObserver
            if ('PerformanceObserver' in window) {
                // Largest Contentful Paint
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    newMetrics.lcp = lastEntry.startTime;
                    setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
                });
                
                try {
                    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {
                    console.warn('LCP observer not supported');
                }

                // Cumulative Layout Shift
                const clsObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    for (const entry of list.getEntries()) {
                        if (!(entry as any).hadRecentInput) {
                            clsValue += (entry as any).value;
                        }
                    }
                    newMetrics.cls = clsValue;
                    setMetrics(prev => ({ ...prev, cls: clsValue }));
                });

                try {
                    clsObserver.observe({ entryTypes: ['layout-shift'] });
                } catch (e) {
                    console.warn('CLS observer not supported');
                }

                // First Input Delay
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        newMetrics.fid = (entry as any).processingStart - entry.startTime;
                        setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
                    }
                });

                try {
                    fidObserver.observe({ entryTypes: ['first-input'] });
                } catch (e) {
                    console.warn('FID observer not supported');
                }
            }

            setMetrics(prev => ({ ...prev, ...newMetrics }));
        } catch (error) {
            console.warn('Performance metrics collection failed:', error);
        }
    }, [enabled]);

    // Analyze performance and generate warnings
    const analyzePerformance = useCallback(() => {
        const newWarnings: string[] = [];

        if (metrics.fcp && metrics.fcp > 2500) {
            newWarnings.push('First Contentful Paint is slow (>2.5s)');
        }

        if (metrics.lcp && metrics.lcp > 4000) {
            newWarnings.push('Largest Contentful Paint is slow (>4s)');
        }

        if (metrics.cls && metrics.cls > 0.25) {
            newWarnings.push('Cumulative Layout Shift is high (>0.25)');
        }

        if (metrics.fid && metrics.fid > 300) {
            newWarnings.push('First Input Delay is high (>300ms)');
        }

        if (metrics.memoryUsage && metrics.memoryUsage > 50) {
            newWarnings.push('Memory usage is high (>50MB)');
        }

        setWarnings(newWarnings);
    }, [metrics]);

    useEffect(() => {
        if (!enabled) return;

        collectMetrics();
        
        const interval = setInterval(collectMetrics, 5000); // Collect every 5 seconds
        
        // Listen for visibility changes
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                collectMetrics();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, collectMetrics]);

    useEffect(() => {
        analyzePerformance();
    }, [metrics, analyzePerformance]);

    // Log performance metrics to console in development
    useEffect(() => {
        if (enabled && Object.keys(metrics).length > 0) {
            console.log('📊 Performance Metrics:', metrics);
            if (warnings.length > 0) {
                console.warn('⚠️ Performance Warnings:', warnings);
            }
        }
    }, [enabled, metrics, warnings]);

    if (!enabled || !isVisible) {
        return null;
    }

    const formatTime = (time?: number) => {
        if (!time) return 'N/A';
        return `${time.toFixed(0)}ms`;
    };

    const formatMemory = (memory?: number) => {
        if (!memory) return 'N/A';
        return `${memory.toFixed(1)}MB`;
    };

    const getScoreColor = (metric: keyof PerformanceMetrics, value?: number) => {
        if (!value) return 'text-gray-400';
        
        switch (metric) {
            case 'fcp':
                return value <= 1800 ? 'text-green-600' : value <= 3000 ? 'text-yellow-600' : 'text-red-600';
            case 'lcp':
                return value <= 2500 ? 'text-green-600' : value <= 4000 ? 'text-yellow-600' : 'text-red-600';
            case 'cls':
                return value <= 0.1 ? 'text-green-600' : value <= 0.25 ? 'text-yellow-600' : 'text-red-600';
            case 'fid':
                return value <= 100 ? 'text-green-600' : value <= 300 ? 'text-yellow-600' : 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Performance Monitor
                    </h3>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                    >
                        ✕
                    </button>
                </div>

                {/* Core Web Vitals */}
                <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            FCP
                        </span>
                        <span className={`text-xs font-mono ${getScoreColor('fcp', metrics.fcp)}`}>
                            {formatTime(metrics.fcp)}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            LCP
                        </span>
                        <span className={`text-xs font-mono ${getScoreColor('lcp', metrics.lcp)}`}>
                            {formatTime(metrics.lcp)}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">CLS</span>
                        <span className={`text-xs font-mono ${getScoreColor('cls', metrics.cls)}`}>
                            {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">FID</span>
                        <span className={`text-xs font-mono ${getScoreColor('fid', metrics.fid)}`}>
                            {formatTime(metrics.fid)}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Memory</span>
                        <span className="text-xs font-mono text-gray-600">
                            {formatMemory(metrics.memoryUsage)}
                        </span>
                    </div>
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                        <h4 className="text-xs font-semibold text-orange-600 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Warnings
                        </h4>
                        <ul className="space-y-1">
                            {warnings.map((warning, index) => (
                                <li key={index} className="text-xs text-orange-600">
                                    • {warning}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                    <button
                        onClick={collectMetrics}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                        Refresh Metrics
                    </button>
                </div>
            </div>
        </div>
    );
};

// Hook for accessing performance metrics in components
export const usePerformanceMetrics = () => {
    const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});

    useEffect(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
            setMetrics({
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                renderTime: performance.now(),
            });
        }
    }, []);

    return metrics;
};

export default PerformanceMonitor;
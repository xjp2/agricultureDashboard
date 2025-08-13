import React from 'react';
import { X, FileText, Printer, Download } from 'lucide-react';
import { WorkerDebtSummary } from '../../lib/debtTypes';

interface WorkerPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: WorkerDebtSummary;
  darkMode: boolean;
}

const WorkerPayslipModal: React.FC<WorkerPayslipModalProps> = ({
  isOpen,
  onClose,
  worker,
  darkMode
}) => {
  const formatMonthYear = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrint = () => {
    const monthYear = formatMonthYear(worker.month_year);
    
    const printContent = `
      <div style="padding: 30px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 28px; color: #333;">PAYSLIP</h1>
          <p style="margin: 5px 0; color: #666; font-size: 16px;">AgriSmart Management System</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Worker Information</h2>
            <div style="line-height: 1.6;">
              <p><strong>Name:</strong> ${worker.worker_name}</p>
              <p><strong>Employee ID:</strong> ${worker.eid}</p>
              <p><strong>Pay Period:</strong> ${monthYear}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #333; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Summary</h2>
            <div style="line-height: 1.6;">
              <p><strong>Earnings Entries:</strong> ${worker.earningsEntries}</p>
              <p><strong>Debt Entries:</strong> ${worker.debtEntries}</p>
              <p style="color: ${worker.netAmount >= 0 ? '#059669' : '#dc2626'};">
                <strong>Net Status:</strong> ${worker.netAmount >= 0 ? 'Credit' : 'Debit'}
              </p>
            </div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #059669; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Earnings</h2>
            <div style="line-height: 1.8;">
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                <span>Total Earnings:</span>
                <span style="font-weight: bold; color: #059669;">$${worker.totalEarnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #dc2626; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Deductions</h2>
            <div style="line-height: 1.8;">
              ${Object.entries(worker.debtsByCategory).map(([category, amount]) => 
                `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                  <span>${category}:</span>
                  <span style="font-weight: bold; color: #dc2626;">$${amount.toFixed(2)}</span>
                </div>`
              ).join('')}
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #ddd; margin-top: 10px;">
                <span style="font-weight: bold;">Total Deductions:</span>
                <span style="font-weight: bold; color: #dc2626;">$${worker.totalDebt.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div style="border: 3px solid #333; padding: 25px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
          <h2 style="margin-top: 0; color: #333; font-size: 24px;">NET AMOUNT</h2>
          <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: ${worker.netAmount >= 0 ? '#059669' : '#dc2626'};">
            $${worker.netAmount.toFixed(2)}
          </p>
          <p style="margin: 0; color: #666; font-size: 14px;">
            ${worker.netAmount >= 0 ? 'Amount to be paid to worker' : 'Amount owed by worker'}
          </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>This payslip is generated automatically by AgriSmart Management System</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payslip - ${worker.worker_name} - ${monthYear}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              @media print { 
                body { margin: 0; padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const monthYear = formatMonthYear(worker.month_year);
    
    // Create a simple text version for download
    const textContent = `
PAYSLIP
AgriSmart Management System

Worker Information:
Name: ${worker.worker_name}
Employee ID: ${worker.eid}
Pay Period: ${monthYear}
Generated: ${new Date().toLocaleDateString()}

Earnings:
Total Earnings: $${worker.totalEarnings.toFixed(2)}

Deductions:
${Object.entries(worker.debtsByCategory).map(([category, amount]) => 
  `${category}: $${amount.toFixed(2)}`
).join('\n')}
Total Deductions: $${worker.totalDebt.toFixed(2)}

NET AMOUNT: $${worker.netAmount.toFixed(2)}
${worker.netAmount >= 0 ? 'Amount to be paid to worker' : 'Amount owed by worker'}

Generated on ${new Date().toLocaleString()}
    `;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${worker.worker_name.replace(/\s+/g, '_')}_${monthYear.replace(/\s+/g, '_')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} mr-4`}>
              <FileText size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Payslip - {worker.worker_name}
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatMonthYear(worker.month_year)} • EID: {worker.eid}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <Download size={16} className="mr-1" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
            >
              <Printer size={16} className="mr-1" />
              Print
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div className={`border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-6 space-y-6`}>
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>PAYSLIP</h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>AgriSmart Management System</p>
          </div>

          {/* Worker Info and Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Worker Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Name:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{worker.worker_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Employee ID:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{worker.eid}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Pay Period:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatMonthYear(worker.month_year)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Generated:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Earnings Entries:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{worker.earningsEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Debt Entries:</span>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{worker.debtEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Net Status:</span>
                  <span className={`font-medium ${
                    worker.netAmount >= 0 
                      ? darkMode ? 'text-green-400' : 'text-green-600'
                      : darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {worker.netAmount >= 0 ? 'Credit' : 'Debit'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings and Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-green-900/10 border-green-900/20' : 'bg-green-50 border-green-200'}`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-green-400' : 'text-green-800'}`}>Earnings</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-green-200 dark:border-green-800">
                  <span className={darkMode ? 'text-green-300' : 'text-green-700'}>Total Earnings:</span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${worker.totalEarnings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/10 border-red-900/20' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-4 ${darkMode ? 'text-red-400' : 'text-red-800'}`}>Deductions</h3>
              <div className="space-y-2">
                {Object.entries(worker.debtsByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-1">
                    <span className={darkMode ? 'text-red-300' : 'text-red-700'}>{category}:</span>
                    <span className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                      ${amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-t-2 border-red-300 dark:border-red-700 mt-3">
                  <span className={`font-bold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>Total Deductions:</span>
                  <span className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    ${worker.totalDebt.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Amount */}
          <div className={`p-6 rounded-lg border-2 text-center ${
            worker.netAmount >= 0 
              ? darkMode ? 'bg-green-900/20 border-green-500' : 'bg-green-50 border-green-300'
              : darkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-300'
          }`}>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>NET AMOUNT</h3>
            <p className={`text-3xl font-bold mb-2 ${
              worker.netAmount >= 0 
                ? darkMode ? 'text-green-400' : 'text-green-600'
                : darkMode ? 'text-red-400' : 'text-red-600'
            }`}>
              ${worker.netAmount.toFixed(2)}
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {worker.netAmount >= 0 ? 'Amount to be paid to worker' : 'Amount owed by worker'}
            </p>
          </div>

          {/* Footer */}
          <div className={`text-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} border-t pt-4`}>
            <p>This payslip is generated automatically by AgriSmart Management System</p>
            <p>Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerPayslipModal;
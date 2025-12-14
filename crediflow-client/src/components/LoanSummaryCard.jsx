import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaCheckCircle, FaMoneyBillWave, FaPercent, FaCalendarAlt } from 'react-icons/fa';

const LoanSummaryCard = ({ loanDetails, applicationId }) => {
  const { approvedAmount, interestRate, tenure, status } = loanDetails;
  const [isDownloading, setIsDownloading] = useState(false);

  const calculateEMI = () => {
    if (!approvedAmount || !interestRate || !tenure) return 0;
    const P = parseFloat(approvedAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseInt(tenure);
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return emi.toFixed(2);
  };

  const handleDownloadSanctionLetter = async () => {
    if (!applicationId) {
      alert('Application ID not found');
      return;
    }

    try {
      setIsDownloading(true);
      const response = await fetch(`https://credifloww.onrender.com/api/applications/${applicationId}/sanction-letter`);
      
      if (!response.ok) {
        throw new Error('Failed to download sanction letter');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sanction-Letter-${applicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading sanction letter:', error);
      alert('Failed to download sanction letter. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (status !== 'approved') return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 dark:border-gray-700">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaCheckCircle className="text-green-500 text-xl" />
        </motion.div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Loan Approved!
        </h3>
      </div>

      {/* Approved Amount - Big Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-md"
      >
        <div className="flex items-center space-x-2 mb-2">
          <FaMoneyBillWave className="text-white/80" />
          <p className="text-xs font-semibold text-white/80 uppercase">Approved Amount</p>
        </div>
        <p className="text-3xl font-bold">₹{approvedAmount?.toLocaleString()}</p>
      </motion.div>

      {/* Grid - Interest & Tenure */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-800/50"
        >
          <div className="flex items-center space-x-1 mb-1">
            <FaPercent className="text-blue-600 dark:text-blue-400 text-sm" />
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Interest Rate</p>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{interestRate}% p.a.</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200/50 dark:border-purple-800/50"
        >
          <div className="flex items-center space-x-1 mb-1">
            <FaCalendarAlt className="text-purple-600 dark:text-purple-400 text-sm" />
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Tenure</p>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{tenure} months</p>
        </motion.div>
      </div>

      {/* EMI */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
      >
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">Monthly EMI</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{calculateEMI().toLocaleString()}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">*Approximate</p>
      </motion.div>

      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownloadSanctionLetter}
        disabled={isDownloading}
        className={`w-full ${
          isDownloading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
        } text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2`}
      >
        <FaDownload />
        <span>{isDownloading ? 'Downloading...' : 'Download Letter'}</span>
      </motion.button>
    </motion.div>
  );
};

export default LoanSummaryCard;

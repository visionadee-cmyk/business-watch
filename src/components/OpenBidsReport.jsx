import { useState, useRef, useMemo } from 'react';
import { Printer, Download, X, FileText, Calendar, Building2, DollarSign, Clock, Hash, User, Mail, Phone, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OpenBidsReport = ({ bids, onClose }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const reportRef = useRef(null);

  // Filter open/pending bids
  const openBids = useMemo(() => {
    let filtered = bids.filter(bid => 
      !bid.result || bid.result === 'Pending' || bid.result === 'Under Evaluation'
    );
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bid => bid.status === filterStatus);
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.submissionDeadline || a.created_at || 0);
      const dateB = new Date(b.submissionDeadline || b.created_at || 0);
      return dateA - dateB;
    });
  }, [bids, filterStatus]);

  const stats = useMemo(() => {
    const totalValue = openBids.reduce((sum, b) => sum + (parseFloat(b.bidAmount) || 0), 0);
    const totalCost = openBids.reduce((sum, b) => sum + (parseFloat(b.costEstimate) || 0), 0);
    const urgent = openBids.filter(b => {
      const deadline = new Date(b.submissionDeadline || b.submissionDate);
      const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 3 && daysLeft >= 0;
    });
    return { totalValue, totalCost, urgentCount: urgent.length };
  }, [openBids]);

  const handlePrint = () => {
    document.body.classList.add('printing-open-bids');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-open-bids');
      }, 100);
    }, 100);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      let heightLeft = imgHeight * ratio;
      let position = 0;
      let pageHeight = pdfHeight - 20;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * ratio * 0.95, imgHeight * ratio * 0.95);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight * ratio;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth * ratio * 0.95, imgHeight * ratio * 0.95);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Open_Bids_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try using the Print button instead.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return 'N/A';
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    return `${days} days`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'text-green-600';
      case 'Draft': return 'text-yellow-600';
      case 'Under Review': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-auto">
      <div className="min-h-screen bg-gray-100 py-8">
        {/* Controls */}
        <div className="max-w-5xl mx-auto mb-4 flex flex-wrap gap-3 items-center justify-between print:hidden px-4">
          <div className="flex gap-3 items-center">
            <h2 className="text-xl font-bold text-gray-900">Open Bids Report</h2>
            <span className="text-sm text-gray-600">({openBids.length} bids)</span>
          </div>
          
          <div className="flex gap-3 items-center flex-wrap">
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
            </select>

            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn-secondary flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>

            <button
              onClick={onClose}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div ref={reportRef} className="max-w-5xl mx-auto bg-white shadow-lg print:shadow-none">
          <style>{`
            body.printing-open-bids > div:not(.fixed),
            body.printing-open-bids nav,
            body.printing-open-bids header,
            body.printing-open-bids .sidebar,
            body.printing-open-bids #root > div:first-child {
              display: none !important;
            }
            body.printing-open-bids .fixed.inset-0 {
              position: static !important;
              overflow: visible !important;
            }
            body.printing-open-bids {
              background: white !important;
            }
            @media print {
              @page {
                size: A4 landscape;
                margin: 10mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .bid-page {
                page-break-after: always;
              }
              .bid-page:last-child {
                page-break-after: avoid;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>

          {/* Header */}
          <div className="p-8 border-b-2 border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">Business Watch</span>
                  <span className="text-lg text-gray-600">Private Limited</span>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>Reg No: C0006/2025 | TIN: 1169863/GST/T/501</p>
                  <p>Gulfamge, Lh.Hinnavaru</p>
                  <p>businesswatchmv@gmail.com | (960) 7786629, (960) 9829050</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900 border-2 border-gray-800 px-4 py-2 inline-block">
                  OPEN BIDS REPORT
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  Generated: {format(new Date(), 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total Open Bids</p>
                <p className="text-2xl font-bold text-gray-900">{openBids.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total Bid Value</p>
                <p className="text-2xl font-bold text-green-600">MVR {stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Total Cost Estimate</p>
                <p className="text-2xl font-bold text-red-600">MVR {stats.totalCost.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Urgent (≤3 days)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.urgentCount}</p>
              </div>
            </div>
          </div>

          {/* Bids Table */}
          <div className="p-6">
            {openBids.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No open bids found</p>
                <p className="text-sm">All bids have been resolved or there are no pending bids</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-800 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-800 px-3 py-2 text-left w-12">#</th>
                      <th className="border border-gray-800 px-3 py-2 text-left">Tender Details</th>
                      <th className="border border-gray-800 px-3 py-2 text-left">Client/Authority</th>
                      <th className="border border-gray-800 px-3 py-2 text-left">Deadline</th>
                      <th className="border border-gray-800 px-3 py-2 text-right">Bid Amount</th>
                      <th className="border border-gray-800 px-3 py-2 text-right">Cost</th>
                      <th className="border border-gray-800 px-3 py-2 text-center">Profit</th>
                      <th className="border border-gray-800 px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openBids.map((bid, index) => {
                      const bidAmount = parseFloat(bid.bidAmount) || 0;
                      const costEstimate = parseFloat(bid.costEstimate) || 0;
                      const profit = bidAmount - costEstimate;
                      const profitPercent = costEstimate > 0 ? ((profit / costEstimate) * 100).toFixed(1) : 0;
                      const daysLeft = getDaysLeft(bid.submissionDeadline || bid.submissionDate);
                      const isUrgent = daysLeft !== 'N/A' && (daysLeft === 'Today' || daysLeft.includes('days') && parseInt(daysLeft) <= 3);
                      
                      return (
                        <tr key={bid.id} className="hover:bg-gray-50">
                          <td className="border border-gray-800 px-3 py-2 text-center">{index + 1}</td>
                          <td className="border border-gray-800 px-3 py-2">
                            <div className="font-medium text-gray-900">{bid.title || bid.tenderTitle || 'Untitled'}</div>
                            {bid.tenderNo && (
                              <div className="text-xs text-gray-500">Ref: {bid.tenderNo}</div>
                            )}
                            {bid.category && (
                              <div className="text-xs text-gray-500">{bid.category}</div>
                            )}
                          </td>
                          <td className="border border-gray-800 px-3 py-2">
                            <div className="font-medium">{bid.authority || bid.clientName || 'N/A'}</div>
                            {bid.contactEmail && (
                              <div className="text-xs text-gray-500">{bid.contactEmail}</div>
                            )}
                          </td>
                          <td className="border border-gray-800 px-3 py-2">
                            <div className={`font-medium ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                              {bid.submissionDeadline || bid.submissionDate 
                                ? format(parseISO(bid.submissionDeadline || bid.submissionDate), 'dd MMM yyyy')
                                : 'N/A'
                              }
                            </div>
                            <div className={`text-xs ${isUrgent ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {daysLeft}
                            </div>
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-right font-medium">
                            {bidAmount > 0 ? `MVR ${bidAmount.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-right">
                            {costEstimate > 0 ? `MVR ${costEstimate.toLocaleString()}` : '-'}
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-center">
                            {profit !== 0 ? (
                              <span className={`${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profit > 0 ? '+' : ''}{profitPercent}%
                              </span>
                            ) : '-'}
                          </td>
                          <td className="border border-gray-800 px-3 py-2 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              bid.status === 'Submitted' ? 'bg-green-100 text-green-800' :
                              bid.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              bid.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {bid.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan="4" className="border border-gray-800 px-3 py-3 text-right">TOTALS</td>
                      <td className="border border-gray-800 px-3 py-3 text-right text-green-700">
                        MVR {stats.totalValue.toLocaleString()}
                      </td>
                      <td className="border border-gray-800 px-3 py-3 text-right text-red-700">
                        MVR {stats.totalCost.toLocaleString()}
                      </td>
                      <td colSpan="2" className="border border-gray-800 px-3 py-3 text-center">
                        Net: MVR {(stats.totalValue - stats.totalCost).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Business Watch Pvt Ltd - Open Bids Report</p>
            <p>Generated on {format(new Date(), 'dd MMMM yyyy')} at {format(new Date(), 'HH:mm')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenBidsReport;

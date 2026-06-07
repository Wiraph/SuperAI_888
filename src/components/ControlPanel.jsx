'use client';
import { useState, useRef } from 'react';
import { Users, Trophy, Upload, Plus, Trash2, Download, Edit2, Search } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
export default function ControlPanel({ 
  names, 
  winners, 
  addNames, 
  removeName, 
  editName,
  clearWinners,
  removeWinner,
  clearNames
}) {
  const [activeTab, setActiveTab] = useState('names'); // 'names' or 'winners'
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (results) => {
          extractNamesAndAdd(results.data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please check the format.');
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON array of arrays
        const results = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        extractNamesAndAdd(results);
      } catch (error) {
         console.error('Error parsing Excel:', error);
         alert('Error parsing Excel file. Please check the format.');
      }
    } else {
      alert('Unsupported file format. Please upload a .csv or .xlsx file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const extractNamesAndAdd = (data) => {
    const extractedNames = [];
    data.forEach(row => {
      if (Array.isArray(row)) {
        const rowString = row
          .filter(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
          .map(cell => String(cell).trim())
          .join(' ');
          
        if (rowString) {
          extractedNames.push(rowString);
        }
      } else if (typeof row === 'object' && row !== null) {
        const rowString = Object.values(row)
          .filter(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
          .map(cell => String(cell).trim())
          .join(' ');
          
        if (rowString) {
          extractedNames.push(rowString);
        }
      }
    });
    
    // Automatically remove header row if detected
    if (extractedNames.length > 0 && (extractedNames[0].includes('ชื่อ') || extractedNames[0].includes('Name') || extractedNames[0].includes('รหัส'))) {
      extractedNames.shift();
    }
    
    // Shuffle the array to completely randomize the order upon import
    for (let i = extractedNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [extractedNames[i], extractedNames[j]] = [extractedNames[j], extractedNames[i]];
    }
    
    if (extractedNames.length > 0) {
      let shouldReplace = false;
      if (names.length > 0) {
        shouldReplace = window.confirm('มีรายชื่ออยู่ในระบบอยู่แล้ว คุณต้องการ "แทนที่" รายชื่อทั้งหมดด้วยไฟล์ใหม่หรือไม่?\n\n- กด OK: ลบรายชื่อเก่าทั้งหมดแล้วใช้ไฟล์ใหม่\n- กด Cancel: นำไฟล์ใหม่ไปต่อท้ายรายชื่อเดิม');
      }
      addNames(extractedNames, shouldReplace);
    } else {
      alert("No names found in the file.");
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddManualName = (e) => {
    if (e) e.preventDefault();
    const trimmedNewName = newName.trim();
    if (trimmedNewName) {
      // Check for exact duplicate
      if (names.some(n => n.trim().toLowerCase() === trimmedNewName.toLowerCase())) {
        alert("มีรายชื่อนี้อยู่ในระบบแล้วครับ");
        return;
      }
      
      // Check for same ID (assuming first word is ID)
      const parts = trimmedNewName.split(/\s+/);
      if (parts.length > 1) {
        const id = parts[0];
        const existingWithId = names.find(n => n.trim().split(/\s+/)[0] === id);
        
        if (existingWithId) {
          if (window.confirm(`พบรหัส ${id} ซ้ำกับข้อมูลเดิม:\n"${existingWithId}"\n\nคุณต้องการ "แทนที่" ข้อมูลเดิมด้วยข้อมูลใหม่นี้หรือไม่?`)) {
             editName(existingWithId, trimmedNewName);
             setNewName('');
          }
          return;
        }
      }

      addNames([trimmedNewName]);
      setNewName('');
    }
  };

  const handleExportWinners = () => {
    if (winners.length === 0) {
      alert("No winners to export.");
      return;
    }
    
    // Format for CSV
    const csvData = winners.map((winner, index) => ({
      Rank: index + 1,
      Name: winner
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'superai_888_winners.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${
            activeTab === 'names' 
              ? 'text-slate-900 border-b-2 border-slate-900 bg-slate-50' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
          onClick={() => setActiveTab('names')}
        >
          <Users size={20} />
          <span>Manage Names ({names.length})</span>
        </button>
        <button
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${
            activeTab === 'winners' 
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
          onClick={() => setActiveTab('winners')}
        >
          <Trophy size={20} />
          <span>Winners ({winners.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {activeTab === 'names' ? (
          <>
            <div className="space-y-4 mb-4 flex-shrink-0">
              {/* CSV Upload */}
              <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center relative group hover:border-slate-400 hover:bg-slate-100 transition-all">
                <input 
                  type="file" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-slate-500 group-hover:text-blue-600 transition-colors">
                  <Upload size={24} />
                  <span className="font-semibold text-slate-700 group-hover:text-blue-700">Import File (.csv, .xlsx)</span>
                  <span className="text-xs text-slate-400">Click or drag & drop</span>
                </div>
              </div>

              {/* Search or Manual Add */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Search or add a name..."
                    className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                  />
                </div>
                <button 
                  type="button"
                  onClick={handleAddManualName}
                  disabled={!newName.trim()}
                  className="bg-slate-900 text-white px-3 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                  title="Add name manually"
                >
                  <Plus size={24} />
                </button>
              </div>
              
              <div className="flex justify-between items-center px-1">
                 <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Current Pool</span>
                 {names.length > 0 && (
                   <button 
                     onClick={() => { if(confirm('Are you sure you want to clear all names?')) clearNames() }}
                     className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                   >
                     <Trash2 size={12} /> Clear All
                   </button>
                 )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {names.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 italic">
                  No names in the pool yet.
                </div>
              ) : (
                (newName.trim() ? names.filter(n => n.toLowerCase().includes(newName.toLowerCase())) : names).length === 0 ? (
                  <div className="text-center text-slate-500 italic py-4">No names match "{newName}"</div>
                ) : (
                  (newName.trim() ? names.filter(n => n.toLowerCase().includes(newName.toLowerCase())) : names).map((name, index) => (
                    <div 
                      key={`${name}-${index}`} 
                      className="flex justify-between items-center bg-white border border-slate-200 p-3 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <span className="text-slate-700 truncate flex-1 font-medium" title={name}>{name}</span>
                      <div className="flex gap-1 ml-2">
                        <button 
                          onClick={() => {
                            const updatedName = prompt("Edit name:", name);
                            if (updatedName) editName(name, updatedName);
                          }}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => removeName(name)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4 flex-shrink-0 px-1">
              <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Hall of Fame</span>
              <div className="flex gap-3">
                {winners.length > 0 && (
                  <>
                    <button 
                      onClick={() => { if(confirm('Are you sure you want to clear all winners?')) clearWinners() }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                    <button 
                      onClick={handleExportWinners}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Download size={12} /> Export CSV
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Winners List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {winners.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 italic">
                  No winners yet. Spin the slot!
                </div>
              ) : (
                winners.map((winner, index) => (
                  <div 
                    key={`winner-${index}`} 
                    className="flex items-center gap-4 bg-blue-50 border border-blue-100 p-3 rounded-xl shadow-sm group"
                  >
                    <div className="flex items-center justify-center bg-blue-600 text-white w-8 h-8 rounded-full font-bold shadow-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-slate-900 font-bold text-lg truncate flex-1" title={winner}>{winner}</span>
                    <button 
                      onClick={() => { if(confirm(`Remove ${winner.split(/\s+/)[0]} from winners and return to pool?`)) removeWinner(winner) }}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 flex-shrink-0"
                      title="Remove from winners and return to pool"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Trophy size={20} className="text-yellow-500 flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

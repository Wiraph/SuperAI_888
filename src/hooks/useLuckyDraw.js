'use client';
import { useState, useEffect } from 'react';

export function useLuckyDraw() {
  const [names, setNames] = useState([]);
  const [winners, setWinners] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const storedNames = localStorage.getItem('luckyDrawNames');
    const storedWinners = localStorage.getItem('luckyDrawWinners');
    
    if (storedNames) setNames(JSON.parse(storedNames));
    if (storedWinners) setWinners(JSON.parse(storedWinners));
    setIsLoaded(true);
  }, []);

  // Save to local storage whenever changes occur
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('luckyDrawNames', JSON.stringify(names));
    }
  }, [names, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('luckyDrawWinners', JSON.stringify(winners));
    }
  }, [winners, isLoaded]);

  const addNames = (newNames, replace = false) => {
    setNames(prev => {
      if (replace) {
        // Just use the new names, keeping them unique
        return Array.from(new Set(newNames.filter(n => n.trim() !== '')));
      }
      // Prevent duplicates by checking trimmed lowercase values
      const existingNamesSet = new Set(prev.map(n => n.trim().toLowerCase()));
      const uniqueNewNames = newNames.filter(n => {
        const normalized = n.trim().toLowerCase();
        return normalized !== '' && !existingNamesSet.has(normalized);
      });
      return [...prev, ...uniqueNewNames];
    });
  };

  const removeName = (nameToRemove) => {
    setNames(prev => prev.filter(n => n !== nameToRemove));
  };

  const addWinner = (winnerName) => {
    setWinners(prev => [...prev, winnerName]);
    removeName(winnerName);
  };

  const clearWinners = () => {
    if (winners.length > 0) {
      addNames(winners);
    }
    setWinners([]);
  };

  const removeWinner = (winnerToRemove) => {
    setWinners(prev => prev.filter(w => w !== winnerToRemove));
    addNames([winnerToRemove]); // Return to the pool
  };

  const clearNames = () => {
    setNames([]);
  };

  const editName = (oldName, newName) => {
    if (!newName || !newName.trim() || oldName === newName) return;
    
    setNames(prev => {
      const normalizedNew = newName.trim().toLowerCase();
      // Check if the new name already exists (excluding the one being edited)
      const exists = prev.some(n => n.trim().toLowerCase() === normalizedNew && n !== oldName);
      if (exists) {
        alert("This name already exists in the pool.");
        return prev;
      }
      return prev.map(n => n === oldName ? newName.trim() : n);
    });
  };

  return {
    names,
    winners,
    addNames,
    removeName,
    editName,
    addWinner,
    clearWinners,
    removeWinner,
    clearNames,
    isLoaded
  };
}

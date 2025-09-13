// src/hooks/useKeyboardNavigation.js
import { useEffect } from 'react';

export const useKeyboardNavigation = ({
  containerRef,
  dropdownRef,
  showDropdown,
  selectedIndex,
  setSelectedIndex,
  itemCount,
  onSelect
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showDropdown || itemCount === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < itemCount - 1 ? prev + 1 : 0
          );
          scrollToSelectedItem();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : itemCount - 1);
          scrollToSelectedItem();
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            onSelect();
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          containerRef.current?.querySelector('input')?.blur();
          break;
      }
    };

    const scrollToSelectedItem = () => {
      if (dropdownRef.current && selectedIndex >= 0) {
        const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, selectedIndex, itemCount, setSelectedIndex, onSelect, containerRef, dropdownRef]);
};
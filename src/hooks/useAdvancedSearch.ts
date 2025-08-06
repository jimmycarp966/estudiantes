'use client';

import { useState, useMemo } from 'react';
import { Note, SearchFilters } from '@/types';

export const useAdvancedSearch = (notes: Note[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'rating' | 'title'>('recent');

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = notes;

    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.description?.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        note.subject.toLowerCase().includes(searchLower) ||
        note.career?.toLowerCase().includes(searchLower) ||
        note.university?.toLowerCase().includes(searchLower)
      );
    }

    // Subject filter
    if (filters.subject) {
      filtered = filtered.filter(note => 
        note.subject.toLowerCase().includes(filters.subject!.toLowerCase())
      );
    }

    // University filter
    if (filters.university) {
      filtered = filtered.filter(note => 
        note.university?.toLowerCase().includes(filters.university!.toLowerCase())
      );
    }

    // Career filter
    if (filters.career) {
      filtered = filtered.filter(note => 
        note.career?.toLowerCase().includes(filters.career!.toLowerCase())
      );
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(note => note.year === filters.year);
    }

    // File type filter
    if (filters.fileType) {
      filtered = filtered.filter(note => 
        note.fileType.toLowerCase() === filters.fileType!.toLowerCase()
      );
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter(note => note.rating >= filters.rating!);
    }

    // Uploaded by filter
    if (filters.uploadedBy) {
      // This would require user data lookup in a real implementation
      // For now, we'll skip this filter
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(note => {
        const noteDate = new Date(note.uploadedAt);
        if (start && noteDate < start) return false;
        if (end && noteDate > end) return false;
        return true;
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return b.ratingCount - a.ratingCount;
        case 'recent':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    return filtered;
  }, [notes, searchTerm, filters, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
  };

  const updateFilter = (key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const searchStats = useMemo(() => {
    return {
      totalResults: filteredAndSortedNotes.length,
      totalNotes: notes.length,
      averageRating: filteredAndSortedNotes.length > 0 
        ? filteredAndSortedNotes.reduce((sum, note) => sum + note.rating, 0) / filteredAndSortedNotes.length
        : 0,
      totalDownloads: filteredAndSortedNotes.reduce((sum, note) => sum + note.downloads, 0),
      uniqueSubjects: new Set(filteredAndSortedNotes.map(note => note.subject)).size,
      fileTypes: Array.from(new Set(filteredAndSortedNotes.map(note => note.fileType)))
    };
  }, [filteredAndSortedNotes, notes]);

  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    const searchLower = searchTerm.toLowerCase();
    const suggestions = new Set<string>();

    // Add matching subjects
    notes.forEach(note => {
      if (note.subject.toLowerCase().includes(searchLower)) {
        suggestions.add(note.subject);
      }
      // Add matching tags
      note.tags.forEach(tag => {
        if (tag.toLowerCase().includes(searchLower)) {
          suggestions.add(tag);
        }
      });
      // Add matching universities
      if (note.university?.toLowerCase().includes(searchLower)) {
        suggestions.add(note.university);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }, [searchTerm, notes]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    sortBy,
    setSortBy,
    filteredAndSortedNotes,
    clearFilters,
    searchStats,
    suggestions
  };
};
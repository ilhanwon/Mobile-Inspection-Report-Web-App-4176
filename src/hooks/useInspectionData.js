import { useCallback } from 'react';
import { useInspection } from '../context/InspectionContext';

export const useInspectionData = () => {
  const { sites, inspections, getInspectionsBySite, getSortedIssueHistory, getSortedLocationHistory } = useInspection();

  const getInspectionStats = useCallback((siteId) => {
    const siteInspections = getInspectionsBySite(siteId);
    return {
      total: siteInspections.length
    };
  }, [getInspectionsBySite]);

  const getRecentHistory = useCallback((limit = 10) => ({
    issues: getSortedIssueHistory().slice(0, limit),
    locations: getSortedLocationHistory().slice(0, limit)
  }), [getSortedIssueHistory, getSortedLocationHistory]);

  return {
    sites,
    inspections,
    getInspectionStats,
    getRecentHistory,
    getInspectionsBySite
  };
};
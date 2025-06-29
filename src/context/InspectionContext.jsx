import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { formatDateOnly } from '../utils/dateUtils';

const InspectionContext = createContext();

const initialState = {
  sites: [],
  inspections: [],
  currentSite: null,
  currentInspection: null,
  issueHistory: [],
  locationHistory: [],
  loading: false,
  error: null,
};

const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_SITES: 'LOAD_SITES',
  LOAD_INSPECTIONS: 'LOAD_INSPECTIONS',
  LOAD_ISSUE_HISTORY: 'LOAD_ISSUE_HISTORY',
  LOAD_LOCATION_HISTORY: 'LOAD_LOCATION_HISTORY',
  ADD_SITE: 'ADD_SITE',
  UPDATE_SITE: 'UPDATE_SITE',
  DELETE_SITE: 'DELETE_SITE',
  ADD_INSPECTION: 'ADD_INSPECTION',
  UPDATE_INSPECTION: 'UPDATE_INSPECTION',
  DELETE_INSPECTION: 'DELETE_INSPECTION',
  SET_CURRENT_SITE: 'SET_CURRENT_SITE',
  SET_CURRENT_INSPECTION: 'SET_CURRENT_INSPECTION',
};

function inspectionReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actionTypes.LOAD_SITES:
      return { ...state, sites: action.payload };
    case actionTypes.LOAD_INSPECTIONS:
      return { ...state, inspections: action.payload };
    case actionTypes.LOAD_ISSUE_HISTORY:
      return { ...state, issueHistory: action.payload };
    case actionTypes.LOAD_LOCATION_HISTORY:
      return { ...state, locationHistory: action.payload };
    case actionTypes.ADD_SITE:
      return { ...state, sites: [action.payload, ...state.sites] };
    case actionTypes.UPDATE_SITE:
      return {
        ...state,
        sites: state.sites.map(site =>
          site.id === action.payload.id ? action.payload : site
        ),
        currentSite: state.currentSite?.id === action.payload.id ? action.payload : state.currentSite,
      };
    case actionTypes.DELETE_SITE:
      return {
        ...state,
        sites: state.sites.filter(site => site.id !== action.payload),
        currentSite: state.currentSite?.id === action.payload ? null : state.currentSite,
      };
    case actionTypes.ADD_INSPECTION:
      return {
        ...state,
        inspections: [action.payload, ...state.inspections],
        currentInspection: action.payload
      };
    case actionTypes.UPDATE_INSPECTION:
      const updatedInspections = state.inspections.map(inspection =>
        inspection.id === action.payload.id ? action.payload : inspection
      );
      return {
        ...state,
        inspections: updatedInspections,
        currentInspection: state.currentInspection?.id === action.payload.id ? action.payload : state.currentInspection
      };
    case actionTypes.DELETE_INSPECTION:
      return {
        ...state,
        inspections: state.inspections.filter(inspection => inspection.id !== action.payload),
        currentInspection: state.currentInspection?.id === action.payload ? null : state.currentInspection,
      };
    case actionTypes.SET_CURRENT_SITE:
      return { ...state, currentSite: action.payload };
    case actionTypes.SET_CURRENT_INSPECTION:
      return { ...state, currentInspection: action.payload };
    default:
      return state;
  }
}

export function InspectionProvider({ children }) {
  const [state, dispatch] = useReducer(inspectionReducer, initialState);

  // 설비별 정렬 순서 정의
  const facilityOrder = useMemo(() => ({
    '소화설비': 1,
    '경보설비': 2,
    '피난구조설비': 3,
    '소화용수설비': 4,
    '소화활동설비': 5,
    '안전시설등': 6,
    '권고사항': 7,
    '기타': 8
  }), []);

  // 데이터 로드 (로컬 스토리지만 사용)
  useEffect(() => {
    loadLocalData();
  }, []);

  const loadLocalData = () => {
    try {
      const sites = JSON.parse(localStorage.getItem('fire_inspection_sites') || '[]');
      const inspections = JSON.parse(localStorage.getItem('fire_inspection_inspections') || '[]');
      const issueHistory = JSON.parse(localStorage.getItem('fire_inspection_issue_history') || '[]');
      const locationHistory = JSON.parse(localStorage.getItem('fire_inspection_location_history') || '[]');

      dispatch({ type: actionTypes.LOAD_SITES, payload: sites });
      dispatch({ type: actionTypes.LOAD_INSPECTIONS, payload: inspections });
      dispatch({ type: actionTypes.LOAD_ISSUE_HISTORY, payload: issueHistory });
      dispatch({ type: actionTypes.LOAD_LOCATION_HISTORY, payload: locationHistory });
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const createSite = async (siteData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const newSite = {
        ...siteData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };

      const updatedSites = [newSite, ...state.sites];
      saveToLocalStorage('fire_inspection_sites', updatedSites);
      dispatch({ type: actionTypes.ADD_SITE, payload: newSite });
      return newSite;
    } catch (error) {
      console.error('Error creating site:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const updateSite = async (siteId, siteData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const updatedSite = {
        ...state.sites.find(s => s.id === siteId),
        ...siteData,
        updated_at: new Date().toISOString()
      };

      const updatedSites = state.sites.map(site =>
        site.id === siteId ? updatedSite : site
      );
      saveToLocalStorage('fire_inspection_sites', updatedSites);
      dispatch({ type: actionTypes.UPDATE_SITE, payload: updatedSite });
      return updatedSite;
    } catch (error) {
      console.error('Error updating site:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const deleteSite = async (siteId) => {
    try {
      const updatedSites = state.sites.filter(site => site.id !== siteId);
      const updatedInspections = state.inspections.filter(inspection => inspection.site_id !== siteId);

      saveToLocalStorage('fire_inspection_sites', updatedSites);
      saveToLocalStorage('fire_inspection_inspections', updatedInspections);

      dispatch({ type: actionTypes.DELETE_SITE, payload: siteId });
      dispatch({ type: actionTypes.LOAD_INSPECTIONS, payload: updatedInspections });
    } catch (error) {
      console.error('Error deleting site:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const createInspection = async (inspectionData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const newInspection = {
        id: Date.now().toString(),
        site_id: inspectionData.siteId,
        inspector: inspectionData.inspector,
        inspection_type: inspectionData.inspectionType,
        notes: inspectionData.notes,
        issues: [],
        created_at: new Date().toISOString()
      };

      const updatedInspections = [newInspection, ...state.inspections];
      saveToLocalStorage('fire_inspection_inspections', updatedInspections);
      dispatch({ type: actionTypes.ADD_INSPECTION, payload: newInspection });
      return newInspection;
    } catch (error) {
      console.error('Error creating inspection:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const updateInspection = async (inspectionId, inspectionData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const updatedInspection = {
        ...state.inspections.find(i => i.id === inspectionId),
        ...inspectionData,
        updated_at: new Date().toISOString()
      };

      const updatedInspections = state.inspections.map(inspection =>
        inspection.id === inspectionId ? updatedInspection : inspection
      );
      saveToLocalStorage('fire_inspection_inspections', updatedInspections);
      dispatch({ type: actionTypes.UPDATE_INSPECTION, payload: updatedInspection });
      return updatedInspection;
    } catch (error) {
      console.error('Error updating inspection:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const addIssueToInspection = async (inspectionId, issueData) => {
    try {
      const inspection = state.inspections.find(i => i.id === inspectionId);
      if (!inspection) throw new Error('Inspection not found');

      const newIssue = {
        id: Date.now().toString(),
        inspection_id: inspectionId,
        facility_type: issueData.facilityType,
        description: issueData.description,
        location: issueData.location,
        detail_location: issueData.detailLocation,
        created_at: new Date().toISOString()
      };

      const updatedInspection = {
        ...inspection,
        issues: [...(inspection.issues || []), newIssue]
      };

      const updatedInspections = state.inspections.map(insp =>
        insp.id === inspectionId ? updatedInspection : insp
      );

      saveToLocalStorage('fire_inspection_inspections', updatedInspections);
      dispatch({ type: actionTypes.UPDATE_INSPECTION, payload: updatedInspection });

      updateIssueHistory(issueData.description);
      updateLocationHistory(issueData.location);

      return newIssue;
    } catch (error) {
      console.error('Error adding issue:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateIssue = async (issueId, issueData) => {
    try {
      const inspection = state.inspections.find(insp =>
        insp.issues?.some(issue => issue.id === issueId)
      );
      if (!inspection) throw new Error('Issue not found');

      const updatedIssues = inspection.issues.map(issue =>
        issue.id === issueId
          ? {
              ...issue,
              facility_type: issueData.facilityType,
              description: issueData.description,
              location: issueData.location,
              detail_location: issueData.detailLocation,
              updated_at: new Date().toISOString()
            }
          : issue
      );

      const updatedInspection = { ...inspection, issues: updatedIssues };
      const updatedInspections = state.inspections.map(insp =>
        insp.id === inspection.id ? updatedInspection : insp
      );

      saveToLocalStorage('fire_inspection_inspections', updatedInspections);
      dispatch({ type: actionTypes.UPDATE_INSPECTION, payload: updatedInspection });

      updateIssueHistory(issueData.description);
      updateLocationHistory(issueData.location);

      return updatedIssues.find(issue => issue.id === issueId);
    } catch (error) {
      console.error('Error updating issue:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateIssueHistory = (description) => {
    const existing = state.issueHistory.find(item => item.description === description);
    let updatedHistory;

    if (existing) {
      updatedHistory = state.issueHistory.map(item =>
        item.description === description
          ? { ...item, count: item.count + 1, last_used: new Date().toISOString() }
          : item
      );
    } else {
      updatedHistory = [
        ...state.issueHistory,
        { description, count: 1, last_used: new Date().toISOString() }
      ];
    }

    saveToLocalStorage('fire_inspection_issue_history', updatedHistory);
    dispatch({ type: actionTypes.LOAD_ISSUE_HISTORY, payload: updatedHistory });
  };

  const updateLocationHistory = (location) => {
    const existing = state.locationHistory.find(item => item.location === location);
    let updatedHistory;

    if (existing) {
      updatedHistory = state.locationHistory.map(item =>
        item.location === location
          ? { ...item, count: item.count + 1, last_used: new Date().toISOString() }
          : item
      );
    } else {
      updatedHistory = [
        ...state.locationHistory,
        { location, count: 1, last_used: new Date().toISOString() }
      ];
    }

    saveToLocalStorage('fire_inspection_location_history', updatedHistory);
    dispatch({ type: actionTypes.LOAD_LOCATION_HISTORY, payload: updatedHistory });
  };

  const deleteIssue = async (inspectionId, issueId) => {
    try {
      const inspection = state.inspections.find(i => i.id === inspectionId);
      if (!inspection) throw new Error('Inspection not found');

      const updatedInspection = {
        ...inspection,
        issues: inspection.issues.filter(issue => issue.id !== issueId)
      };

      const updatedInspections = state.inspections.map(insp =>
        insp.id === inspectionId ? updatedInspection : insp
      );

      saveToLocalStorage('fire_inspection_inspections', updatedInspections);
      dispatch({ type: actionTypes.UPDATE_INSPECTION, payload: updatedInspection });
    } catch (error) {
      console.error('Error deleting issue:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteInspection = async (inspectionId) => {
    try {
      const updatedInspections = state.inspections.filter(inspection => inspection.id !== inspectionId);
      saveToLocalStorage('fire_inspection_inspections', updatedInspections);
      dispatch({ type: actionTypes.DELETE_INSPECTION, payload: inspectionId });
    } catch (error) {
      console.error('Error deleting inspection:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const setCurrentSite = (site) => {
    dispatch({ type: actionTypes.SET_CURRENT_SITE, payload: site });
  };

  const setCurrentInspection = (inspection) => {
    dispatch({ type: actionTypes.SET_CURRENT_INSPECTION, payload: inspection });
  };

  const getInspectionsBySite = (siteId) => {
    return state.inspections.filter(inspection => inspection.site_id === siteId);
  };

  const getSortedIssueHistory = () => {
    return [...state.issueHistory].sort((a, b) => b.count - a.count);
  };

  const getSortedLocationHistory = () => {
    return [...state.locationHistory].sort((a, b) => new Date(b.last_used) - new Date(a.last_used));
  };

  // 보고서 내용 생성 함수
  const generateReportContent = (inspection, site) => {
    const date = formatDateOnly(inspection.created_at);

    // 설비별 지적사항 그룹핑 및 정렬
    const groupedIssues = (inspection.issues || []).reduce((acc, issue) => {
      if (!acc[issue.facility_type]) {
        acc[issue.facility_type] = {};
      }

      const key = `${issue.description}_${issue.location}`;
      if (!acc[issue.facility_type][key]) {
        acc[issue.facility_type][key] = {
          description: issue.description,
          location: issue.location,
          detailLocations: []
        };
      }

      if (issue.detail_location && issue.detail_location.trim()) {
        const trimmedDetailLocation = issue.detail_location.trim();
        if (!acc[issue.facility_type][key].detailLocations.includes(trimmedDetailLocation)) {
          acc[issue.facility_type][key].detailLocations.push(trimmedDetailLocation);
        }
      }

      return acc;
    }, {});

    const sortedFacilities = Object.keys(groupedIssues).sort((a, b) => {
      return (facilityOrder[a] || 99) - (facilityOrder[b] || 99);
    });

    return `===소방시설등 불량세부사항===

[ ${site?.name || 'Unknown'} ]

점검일: ${date}

${sortedFacilities.map(facilityType => {
  const facilityIssues = Object.values(groupedIssues[facilityType]);
  const sectionTitle = facilityType === '권고사항' ? '권고사항' : `설비명: ${facilityType}`;
  
  return `
${sectionTitle}

${facilityIssues.map((issue, index) => {
  let locationText = issue.location;
  if (issue.detailLocations.length > 0) {
    locationText += ` ${issue.detailLocations.join(', ')}`;
  }
  return `${index + 1}. ${issue.description}
위치: ${locationText}`;
}).join('\n')}

`;
}).join('')}

${inspection.notes ? `점검 특이사항: ${inspection.notes}\n` : ''}${site?.notes ? `현장 특이사항: ${site.notes}\n` : ''}

--- 보고서 끝 ---`.trim();
  };

  const contextValue = useMemo(() => ({
    ...state,
    createSite,
    updateSite,
    setCurrentSite,
    deleteSite,
    createInspection,
    updateInspection,
    setCurrentInspection,
    addIssueToInspection,
    updateIssue,
    deleteIssue,
    deleteInspection,
    getInspectionsBySite,
    getSortedIssueHistory,
    getSortedLocationHistory,
    generateReportContent,
    facilityOrder,
  }), [state, facilityOrder]);

  return (
    <InspectionContext.Provider value={contextValue}>
      {children}
    </InspectionContext.Provider>
  );
}

export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within an InspectionProvider');
  }
  return context;
};
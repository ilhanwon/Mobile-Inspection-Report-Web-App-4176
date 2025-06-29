import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import supabase from '../lib/supabase';
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

  // 설비별 정렬 순서 정의 (권고사항 추가)
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

  // 데이터 로드
  useEffect(() => {
    loadSites();
    loadInspections();
    loadIssueHistory();
    loadLocationHistory();
  }, []);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('sites_fire_inspection_v2')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: actionTypes.LOAD_SITES, payload: data || [] });
    } catch (error) {
      console.error('Error loading sites:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    }
  };

  const loadInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('inspections_fire_v2')
        .select(`
          *,
          site:sites_fire_inspection_v2(*),
          issues:issues_fire_v2(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: actionTypes.LOAD_INSPECTIONS, payload: data || [] });
    } catch (error) {
      console.error('Error loading inspections:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    }
  };

  const loadIssueHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('issue_history_fire_v2')
        .select('*')
        .order('count', { ascending: false })
        .limit(20);

      if (error) throw error;
      dispatch({ type: actionTypes.LOAD_ISSUE_HISTORY, payload: data || [] });
    } catch (error) {
      console.error('Error loading issue history:', error);
    }
  };

  const loadLocationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('location_history_fire_v2')
        .select('*')
        .order('last_used', { ascending: false })
        .limit(10);

      if (error) throw error;
      dispatch({ type: actionTypes.LOAD_LOCATION_HISTORY, payload: data || [] });
    } catch (error) {
      console.error('Error loading location history:', error);
    }
  };

  const createSite = async (siteData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      // 데이터 정리
      const cleanedData = { ...siteData };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') {
          cleanedData[key] = null;
        }
      });

      const { data, error } = await supabase
        .from('sites_fire_inspection_v2')
        .insert([cleanedData])
        .select()
        .single();

      if (error) throw error;
      dispatch({ type: actionTypes.ADD_SITE, payload: data });
      return data;
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

      // 모든 필드 업데이트 허용
      const allowedFields = [
        'name', 
        'address', 
        'phone', 
        'manager_name', 
        'manager_phone', 
        'manager_email', 
        'approval_date', 
        'notes'
      ];
      
      const updateData = {};
      
      allowedFields.forEach(field => {
        if (siteData[field] !== undefined) {
          updateData[field] = siteData[field] === '' ? null : siteData[field];
        }
      });

      console.log('Updating site with data:', updateData);

      const { data, error } = await supabase
        .from('sites_fire_inspection_v2')
        .update(updateData)
        .eq('id', siteId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Site updated successfully:', data);
      dispatch({ type: actionTypes.UPDATE_SITE, payload: data });
      return data;
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
      const { error } = await supabase
        .from('sites_fire_inspection_v2')
        .delete()
        .eq('id', siteId);

      if (error) throw error;
      dispatch({ type: actionTypes.DELETE_SITE, payload: siteId });
    } catch (error) {
      console.error('Error deleting site:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const createInspection = async (inspectionData) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });

      const { data, error } = await supabase
        .from('inspections_fire_v2')
        .insert([{
          site_id: inspectionData.siteId,
          inspector: inspectionData.inspector,
          inspection_type: inspectionData.inspectionType,
          notes: inspectionData.notes,
        }])
        .select(`
          *,
          site:sites_fire_inspection_v2(*),
          issues:issues_fire_v2(*)
        `)
        .single();

      if (error) throw error;

      dispatch({ type: actionTypes.ADD_INSPECTION, payload: { ...data, issues: [] } });
      return data;
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

      const { data, error } = await supabase
        .from('inspections_fire_v2')
        .update(inspectionData)
        .eq('id', inspectionId)
        .select(`
          *,
          site:sites_fire_inspection_v2(*),
          issues:issues_fire_v2(*)
        `)
        .single();

      if (error) throw error;

      dispatch({ type: actionTypes.UPDATE_INSPECTION, payload: data });
      return data;
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
      const { data: issueResult, error: issueError } = await supabase
        .from('issues_fire_v2')
        .insert([{
          inspection_id: inspectionId,
          facility_type: issueData.facilityType,
          description: issueData.description,
          location: issueData.location,
          detail_location: issueData.detailLocation,
        }])
        .select()
        .single();

      if (issueError) throw issueError;

      await updateIssueHistory(issueData.description);
      await updateLocationHistory(issueData.location);
      await loadInspections();

      return issueResult;
    } catch (error) {
      console.error('Error adding issue:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateIssue = async (issueId, issueData) => {
    try {
      const { data, error } = await supabase
        .from('issues_fire_v2')
        .update({
          facility_type: issueData.facilityType,
          description: issueData.description,
          location: issueData.location,
          detail_location: issueData.detailLocation,
        })
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;

      await updateIssueHistory(issueData.description);
      await updateLocationHistory(issueData.location);
      await loadInspections();

      return data;
    } catch (error) {
      console.error('Error updating issue:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const updateIssueHistory = async (description) => {
    try {
      const { data: existing } = await supabase
        .from('issue_history_fire_v2')
        .select('*')
        .eq('description', description)
        .single();

      if (existing) {
        await supabase
          .from('issue_history_fire_v2')
          .update({
            count: existing.count + 1,
            last_used: new Date().toISOString()
          })
          .eq('description', description);
      } else {
        await supabase
          .from('issue_history_fire_v2')
          .insert({
            description,
            count: 1,
            last_used: new Date().toISOString(),
          });
      }

      await loadIssueHistory();
    } catch (error) {
      console.error('Error updating issue history:', error);
    }
  };

  const updateLocationHistory = async (location) => {
    try {
      const { data: existing } = await supabase
        .from('location_history_fire_v2')
        .select('*')
        .eq('location', location)
        .single();

      if (existing) {
        await supabase
          .from('location_history_fire_v2')
          .update({
            count: existing.count + 1,
            last_used: new Date().toISOString()
          })
          .eq('location', location);
      } else {
        await supabase
          .from('location_history_fire_v2')
          .insert({
            location,
            count: 1,
            last_used: new Date().toISOString(),
          });
      }

      await loadLocationHistory();
    } catch (error) {
      console.error('Error updating location history:', error);
    }
  };

  const deleteIssue = async (inspectionId, issueId) => {
    try {
      const { error } = await supabase
        .from('issues_fire_v2')
        .delete()
        .eq('id', issueId);

      if (error) throw error;
      await loadInspections();
    } catch (error) {
      console.error('Error deleting issue:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const deleteInspection = async (inspectionId) => {
    try {
      const { error } = await supabase
        .from('inspections_fire_v2')
        .delete()
        .eq('id', inspectionId);

      if (error) throw error;
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 지적사항 그룹핑 함수 - 상세위치를 콤마로 구분
  const groupIssuesByDescriptionAndLocation = (issues) => {
    return issues.reduce((acc, issue) => {
      const key = `${issue.description}_${issue.location}`;
      
      if (!acc[key]) {
        acc[key] = {
          description: issue.description,
          location: issue.location,
          detailLocations: []
        };
      }
      
      // 상세위치가 있고 중복되지 않는 경우만 추가
      if (issue.detail_location && issue.detail_location.trim()) {
        const trimmedDetailLocation = issue.detail_location.trim();
        if (!acc[key].detailLocations.includes(trimmedDetailLocation)) {
          acc[key].detailLocations.push(trimmedDetailLocation);
        }
      }
      
      return acc;
    }, {});
  };

  // 간소화된 보고서 내용 생성 함수 (권고사항 구분, 상세위치 콤마 구분)
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

      // 상세위치가 있고 중복되지 않는 경우만 추가
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
        
        // 상세위치들을 콤마로 구분하여 연결
        if (issue.detailLocations.length > 0) {
          locationText += ` (${issue.detailLocations.join(', ')})`;
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
    groupIssuesByDescriptionAndLocation,
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
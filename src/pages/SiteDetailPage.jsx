import React from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import SiteDetail from '../components/SiteDetail';
import { useInspection } from '../context/InspectionContext';

function SiteDetailPage() {
  const { id } = useParams();
  const { sites } = useInspection();
  
  const site = sites.find(s => s.id === id);

  const headerConfig = {
    title: site?.name || '현장 상세',
    subtitle: '현장 정보 및 점검 기록',
    showBack: true,
    backUrl: '/sites',
    showAdd: true,
    addLabel: '점검하기',
    addUrl: `/create-inspection?siteId=${id}`
  };

  return (
    <AppLayout headerConfig={headerConfig}>
      <SiteDetail />
    </AppLayout>
  );
}

export default SiteDetailPage;
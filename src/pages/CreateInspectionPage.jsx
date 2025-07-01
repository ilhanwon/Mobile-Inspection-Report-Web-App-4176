import React from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import CreateInspection from '../components/CreateInspection';
import { useInspection } from '../context/InspectionContext';

function CreateInspectionPage() {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const { sites } = useInspection();
  
  const selectedSite = sites.find(s => s.id === siteId);

  const headerConfig = {
    title: '새 점검 시작',
    subtitle: selectedSite?.name || '점검 정보를 입력하세요',
    showBack: true,
    backUrl: siteId ? `/site/${siteId}` : '/sites'
  };

  return (
    <AppLayout headerConfig={headerConfig}>
      <CreateInspection />
    </AppLayout>
  );
}

export default CreateInspectionPage;
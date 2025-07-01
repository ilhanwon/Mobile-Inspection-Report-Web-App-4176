import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import ImprovedSiteList from '../components/ImprovedSiteList';
import { useInspectionData } from '../hooks/useInspectionData';

function SitesPage() {
  const navigate = useNavigate();
  const { sites } = useInspectionData();
  const [searchQuery, setSearchQuery] = useState('');

  const headerConfig = {
    title: '현장 관리',
    subtitle: `${sites.length}개 현장`,
    showSearch: true,
    showAdd: true,
    addUrl: '/create-site',
    addLabel: '새 현장',
    onSearchChange: setSearchQuery
  };

  return (
    <AppLayout headerConfig={headerConfig}>
      <ImprovedSiteList searchQuery={searchQuery} />
    </AppLayout>
  );
}

export default SitesPage;
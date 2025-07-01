import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import CreateSite from '../components/CreateSite';

function CreateSitePage() {
  const headerConfig = {
    title: '새 현장 등록',
    subtitle: '현장 정보를 입력하세요',
    showBack: true,
    backUrl: '/sites'
  };

  return (
    <AppLayout headerConfig={headerConfig}>
      <CreateSite />
    </AppLayout>
  );
}

export default CreateSitePage;
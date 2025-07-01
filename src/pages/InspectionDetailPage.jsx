import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import ImprovedInspectionDetail from '../components/ImprovedInspectionDetail';
import ReportModal from '../components/ReportModal';
import { useInspection } from '../context/InspectionContext';
import * as FiIcons from 'react-icons/fi';

const { FiShare } = FiIcons;

function InspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { inspections, sites } = useInspection();
  const [showReportModal, setShowReportModal] = useState(false);
  
  const inspection = inspections.find(p => p.id === id);
  const site = inspection?.site || sites.find(s => s.id === inspection?.site_id);

  const headerConfig = {
    title: site?.name || '점검 상세',
    subtitle: `${(inspection?.issues || []).length}건 지적사항`,
    showBack: true,
    backUrl: `/site/${inspection?.site_id}`,
    customActions: [
      {
        icon: FiShare,
        label: '보고서',
        onClick: () => setShowReportModal(true),
        className: 'bg-white/20 hover:bg-white/30'
      }
    ]
  };

  return (
    <AppLayout headerConfig={headerConfig}>
      <ImprovedInspectionDetail />
      
      {/* 보고서 모달 */}
      {showReportModal && inspection && site && (
        <ReportModal
          inspection={inspection}
          site={site}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </AppLayout>
  );
}

export default InspectionDetailPage;
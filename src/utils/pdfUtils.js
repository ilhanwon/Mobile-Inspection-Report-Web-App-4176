import jsPDF from 'jspdf';

// 한글 폰트 인코딩 함수
const encodeKoreanText = (text) => {
  // UTF-8 인코딩을 위한 처리
  return text;
};

// PDF 생성을 위한 텍스트 분할 함수
const splitTextToLines = (doc, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

export const generatePDF = (inspection, site) => {
  const doc = new jsPDF();
  
  // 페이지 설정
  let yPosition = 20;
  const lineHeight = 8;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const maxWidth = pageWidth - (margin * 2);

  // 새 페이지 추가 함수
  const addNewPageIfNeeded = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  try {
    // 제목
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const title = '소방시설등 불량세부사항';
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // 현장 정보
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const siteTitle = `[ ${site?.name || 'Unknown'} ]`;
    doc.text(siteTitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += lineHeight * 2;

    // 기본 정보
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const infoLines = [
      `현장명: ${site?.name || 'Unknown'}`,
      `소재지: ${site?.address || 'Unknown'}`,
      `점검일시: ${new Date(inspection.created_at).toLocaleDateString('ko-KR')}`,
      `점검자: ${inspection.inspector}`,
      `점검유형: ${inspection.inspection_type}`
    ];

    infoLines.forEach(line => {
      addNewPageIfNeeded(lineHeight);
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    yPosition += lineHeight;

    // 설비별 지적사항 정렬
    const facilityOrder = {
      '소화설비': 1,
      '경보설비': 2,
      '피난구조설비': 3,
      '소화용수설비': 4,
      '소화활동설비': 5,
      '안전시설등': 6,
      '권고사항': 7,
      '기타': 8
    };

    // 설비별 그룹핑 - 상세위치 콤마 구분
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

    // 지적사항 출력
    sortedFacilities.forEach(facilityType => {
      addNewPageIfNeeded(lineHeight * 3);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      
      const sectionTitle = facilityType === '권고사항' ? '권고사항' : `설비명: ${facilityType}`;
      doc.text(sectionTitle, margin, yPosition);
      yPosition += lineHeight * 1.5;

      const facilityIssues = Object.values(groupedIssues[facilityType]);
      
      facilityIssues.forEach((issue, index) => {
        addNewPageIfNeeded(lineHeight * 3);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // 불량내용
        const issueText = `${index + 1}. ${issue.description}`;
        const issueLines = splitTextToLines(doc, issueText, maxWidth - 10);
        
        issueLines.forEach((line, lineIndex) => {
          if (lineIndex > 0) addNewPageIfNeeded(lineHeight);
          doc.text(line, margin + 5, yPosition);
          yPosition += lineHeight;
        });

        // 위치 정보 - 상세위치 콤마 구분
        let locationText = `   위치: ${issue.location}`;
        
        if (issue.detailLocations.length > 0) {
          locationText += ` (${issue.detailLocations.join(', ')})`;
        }

        const locationLines = splitTextToLines(doc, locationText, maxWidth - 10);
        
        locationLines.forEach((line, lineIndex) => {
          if (lineIndex > 0) addNewPageIfNeeded(lineHeight);
          doc.text(line, margin + 5, yPosition);
          yPosition += lineHeight;
        });

        yPosition += lineHeight * 0.5;
      });

      yPosition += lineHeight;
    });

    // 요약 정보
    addNewPageIfNeeded(lineHeight * 6);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('===점검 요약===', margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`총 지적사항: ${(inspection.issues || []).length}건`, margin, yPosition);
    yPosition += lineHeight * 2;

    // 특이사항
    if (inspection.notes) {
      const notesText = `점검 특이사항: ${inspection.notes}`;
      const notesLines = splitTextToLines(doc, notesText, maxWidth);
      
      notesLines.forEach(line => {
        addNewPageIfNeeded(lineHeight);
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    } else {
      doc.text('점검 특이사항: 없음', margin, yPosition);
    }

    yPosition += lineHeight;

    if (site?.notes) {
      const siteNotesText = `현장 특이사항: ${site.notes}`;
      const siteNotesLines = splitTextToLines(doc, siteNotesText, maxWidth);
      
      siteNotesLines.forEach(line => {
        addNewPageIfNeeded(lineHeight);
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    }

    // 파일명 생성
    const dateStr = new Date(inspection.created_at)
      .toLocaleDateString('ko-KR')
      .replace(/\./g, '');
    const filename = `소방시설_점검보고서_${site?.name || 'Unknown'}_${dateStr}.pdf`;

    // PDF 저장
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF 생성 중 오류:', error);
    throw new Error('PDF 생성에 실패했습니다.');
  }
};
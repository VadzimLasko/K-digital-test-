import { RefObject, useEffect, useState } from 'react'
import { CButton, CContainer, CCol, CRow } from '@coreui/react-pro'
import { useReactToPrint } from 'react-to-print'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PrintAndSaveButtonsProps {
  printRef: RefObject<HTMLDivElement>
  setPrepareForPrint?: (value: boolean) => void
}

const PrintAndSaveButtons: React.FC<PrintAndSaveButtonsProps> = ({
  printRef,
  setPrepareForPrint,
}) => {
  const [content, setContent] = useState<HTMLDivElement | null>(null)
  const [action, setAction] = useState<'print' | 'download' | null>(null)

  const triggerPrint = useReactToPrint({
    content: () => content,
    onAfterPrint: () => {
      if (setPrepareForPrint) {
        setPrepareForPrint(false)
      }
    },
  })

  const handlePrint = () => {
    if (printRef.current) {
      setContent(printRef.current)
      printRef.current.style.padding = '0.7rem'
      setAction('print')
      if (setPrepareForPrint) {
        setPrepareForPrint(true)
      }
    }
  }

  const downloadPDF = async () => {
    if (printRef.current) {
      printRef.current.style.padding = '0.7rem'
      const canvas = await html2canvas(printRef.current)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      const imgWidth = 190
      const pageHeight = pdf.internal.pageSize.height
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      while (heightLeft >= 0) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
        position -= pageHeight
        if (heightLeft >= 0) {
          pdf.addPage()
        }
      }

      if (printRef.current) {
        const paragraph = printRef.current.querySelector(
          '.id-text-title',
        ) as HTMLElement
        if (paragraph) {
          const text = paragraph.innerText
          pdf.save(`${text}.pdf`)
        }
      }
      if (setPrepareForPrint) {
        setPrepareForPrint(false)
      }
    }
  }

  useEffect(() => {
    if (action === 'print') {
      triggerPrint()
      setAction(null)
      if (printRef.current) {
        printRef.current.style.padding = ''
      }
    } else if (action === 'download') {
      downloadPDF()
      setAction(null)
      if (printRef.current) {
        printRef.current.style.padding = ''
      }
    }
  }, [action])

  const handleDownload = () => {
    if (printRef.current) {
      setContent(printRef.current)
      printRef.current.style.padding = '0.7rem'
      setAction('download')
      if (setPrepareForPrint) {
        setPrepareForPrint(true)
      }
    }
  }

  return (
    <CContainer
      style={{
        display: 'flex',
        justifyContent: 'right',
        padding: '0.7rem',
      }}
    >
      <CRow>
        <CCol sm="auto">
          <CButton color="secondary" variant="outline" onClick={handlePrint}>
            Печать
          </CButton>
        </CCol>
        <CCol sm="auto">
          <CButton color="secondary" variant="outline" onClick={handleDownload}>
            Скачать
          </CButton>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default PrintAndSaveButtons

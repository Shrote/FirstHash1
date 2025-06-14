"use client"

import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { doc, setDoc, serverTimestamp, collection, getDocs, getDoc } from "firebase/firestore"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { firestore } from "@/lib/firebase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

function Page() {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState("")

  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientAddress, setClientAddress] = useState("")

  const [rows, setRows] = useState([{ product: "", price: 0 }])
  const [amountPaid, setAmountPaid] = useState(0)
  const [bills, setBills] = useState([])

  const selectedCompany = typeof window !== "undefined" ? localStorage.getItem("selectedCompany") : null

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "clients"))
        const data = snapshot.docs.map((doc) => {
          const clientData = doc.data()
          return {
            id: doc.id,
            name: clientData.name || "",
            phone: clientData.phone || "",
            address: clientData.address || "",
            email: clientData.email || "",
            gstin: clientData.gstin || "",
            assignedCompany: clientData.assignedCompany || "",
            status: clientData.status || "Active",
            ...clientData,
          }
        })
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
      }
    }

    const fetchProjects = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, "projects"))
        const data = snapshot.docs.map((doc) => {
          const projectData = doc.data()
          return {
            id: doc.id,
            projectName: projectData.projectName || "",
            clientId: projectData.clientId || "",
            companyId: projectData.companyId || "",
            description: projectData.description || "",
            projectBudget: projectData.projectBudget || "",
            priority: projectData.priority || "low",
            status: projectData.status || "active",
            projectTimeline: projectData.projectTimeline || "",
            deliverables: projectData.deliverables || [],
            ...projectData,
          }
        })
        setProjects(data)
      } catch (error) {
        console.error("Error fetching projects:", error)
      }
    }

    const fetchBills = async () => {
      if (!selectedCompany) return
      const snapshot = await getDocs(collection(firestore, "billingInfo"))
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((bill) => bill.companyId === selectedCompany)
      setBills(data)
    }

    fetchClients()
    fetchProjects()
    fetchBills()
  }, [selectedCompany])

  const handleClientChange = (id) => {
    setSelectedClientId(id)
    const client = clients.find((c) => c.id === id)
    if (client) {
      setClientName(client.name || "")
      setClientPhone(client.phone || "")
      setClientAddress(client.address || "")
    }
  }

  const handleProjectChange = (id) => {
    setSelectedProjectId(id)
    const project = projects.find((p) => p.id === id)
    console.log("Selected project:", project)
  }

  const fetchBills = async () => {
    if (!selectedCompany) return
    const snapshot = await getDocs(collection(firestore, "billingInfo"))
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((bill) => bill.companyId === selectedCompany)
    setBills(data)
  }

  const handleSaveBill = async () => {
    try {
      const id = `${Date.now()}`
      const billRef = doc(firestore, "billingInfo", id)

      await setDoc(billRef, {
        clientId: selectedClientId,
        clientName,
        clientPhone,
        clientAddress,
        projectId: selectedProjectId,
        projectName: projects.find((p) => p.id === selectedProjectId)?.projectName || "",
        billingRows: rows,
        subTotal,
        tax,
        grandTotal,
        amountPaid,
        amountDue,
        timestamp: serverTimestamp(),
        companyId: selectedCompany || null,
      })

      await fetchBills()
      alert("Bill saved successfully!")
      setOpen(false)
    } catch (error) {
      console.error("Error saving bill:", error)
      alert("Failed to save bill.")
    }
  }

  const handleAddRow = () => {
    setRows([...rows, { product: "", price: 0 }])
  }

  const handleDeleteRow = () => {
    if (rows.length > 1) {
      const updated = [...rows]
      updated.pop()
      setRows(updated)
    }
  }

  const handleRowChange = (index, field, value) => {
    const updated = [...rows]
    updated[index][field] = field === "price" ? Number(value) : value
    setRows(updated)
  }

  const subTotal = rows.reduce((sum, row) => sum + Number(row.price || 0), 0)
  const tax = subTotal * 0.18
  const grandTotal = subTotal + tax
  const amountDue = grandTotal - amountPaid

  const handleOpenPopup = () => {
    if (!selectedCompany) {
      alert("Please select a company first.")
      return
    }
    setOpen(true)
  }

  // Responsive PDF Generation Functions
  const generateInvoicePDF = async (bill) => {
    try {
      if (!bill || typeof bill !== "object") throw new Error("Invalid bill data")

      const safeBill = {
        id: bill.id || "N/A",
        timestamp: bill.timestamp || new Date(),
        clientName: bill.clientName || "N/A",
        clientAddress: bill.clientAddress || "N/A",
        clientGSTIN: bill.clientGSTIN || "",
        billingRows: Array.isArray(bill.billingRows) ? bill.billingRows : [],
        subTotal: Number(bill.subTotal) || 0,
        tax: Number(bill.tax) || 0,
        grandTotal: Number(bill.grandTotal) || 0,
        amountDue: Number(bill.amountDue) || 0,
        ...bill,
      }

      const companyDetails = await getCompanyDetails()
      const docPDF = new jsPDF({
        unit: "mm",
        format: "a4",
        putOnlyUsedFonts: true,
      })

      // Page dimensions
      const pageWidth = docPDF.internal.pageSize.width
      const pageHeight = docPDF.internal.pageSize.height
      const margin = 10

      // Generate invoice with exact layout
      generateProfessionalInvoice(docPDF, companyDetails, safeBill, pageWidth, pageHeight, margin)

      docPDF.save("INV-" + safeBill.id + ".pdf")
    } catch (error) {
      console.error("Invoice generation failed:", error)
      alert("Failed to generate invoice PDF. Please try again.")
    }
  }

  async function getCompanyDetails() {
    const selectedCompany = localStorage.getItem("selectedCompany") 

    // Default company details
    const defaults = {
      name: "Q Po India Automotive Pvt Ltd",
      address: "Main Road, Uttar Pradesh, India",
      gstin: "27BMTPB2230B1ZJ",
      state: "Maharashtra",
      stateCode: "27",
      contactPerson: "Gourav Kumar",
      email: "kgourav038@gmail.com",
      phone: "7377547571",
    }

    try {
      // Try to fetch from kworld/details path based on your Firebase structure
      const companyRef = doc(firestore, selectedCompany, "details")
      const companySnap = await getDoc(companyRef)

      if (companySnap.exists()) {
        const companyData = companySnap.data()
        return {
          name: companyData.name || defaults.name,
          address: companyData.address || defaults.address,
          gstin: companyData.gstin || defaults.gstin,
          state: companyData.state || defaults.state,
          stateCode: companyData.stateCode || defaults.stateCode,
          contactPerson: companyData.contactPerson || defaults.contactPerson,
          email: companyData.email || defaults.email,
          phone: companyData.phone || defaults.phone,
          registrationNumber: companyData.registrationNumber || "",
          profileStatus: companyData.profileStatus || "Active",
        }
      } else {
        console.log("Company details document not found, using defaults")
        return defaults
      }
    } catch (error) {
      console.error("Error fetching company details:", error)
      return defaults
    }
  }

  function generateProfessionalInvoice(docPDF, companyDetails, bill, pageWidth, pageHeight, margin) {
    let currentY = margin + 5

    // Company Header
    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(14)
    docPDF.text(companyDetails.name || "Q Po India Automotive Pvt Ltd", margin, currentY)
    currentY += 6

    docPDF.setFont("helvetica", "normal")
    docPDF.setFontSize(9)
    const companyAddress = companyDetails.address || ", , Uttar Pradesh - , India"
    docPDF.text(companyAddress, margin, currentY)
    currentY += 10

    // TAX INVOICE Header
    docPDF.setFillColor(240, 240, 240)
    docPDF.rect(margin, currentY, pageWidth - 2 * margin, 8, "F")
    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(12)
    docPDF.text("TAX INVOICE", pageWidth / 2, currentY + 5, { align: "center" })
    currentY += 15

    // Invoice Details Section
    currentY = generateInvoiceDetailsSection(docPDF, bill, currentY, margin, pageWidth)

    // Bill To and Ship To Section
    currentY = generateBillToShipToSection(docPDF, bill, currentY, margin, pageWidth)

    // Place of Supply
    // docPDF.setFont("helvetica", "normal")
    // docPDF.setFontSize(9)
    // docPDF.text(`Place Of Supply : ${}`, margin, currentY)
    // currentY += 10

    // Items Table
    currentY = generateProfessionalItemsTable(docPDF, bill, currentY, margin, pageWidth)

    // Summary Section
    currentY = generateProfessionalSummary(docPDF, bill, currentY, margin, pageWidth)

    // Footer
    generateProfessionalFooter(docPDF, companyDetails, bill, pageHeight, margin, pageWidth)
  }

  function generateInvoiceDetailsSection(docPDF, bill, startY, margin, pageWidth) {
    const currentY = startY
    const leftCol = margin
    const rightCol = pageWidth / 2 + 10

    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(9)

    // Left column
    docPDF.text("Invoice#", leftCol, currentY)
    docPDF.setFont("helvetica", "normal")
    docPDF.text("INV-" + bill.id, leftCol + 25, currentY)

    docPDF.setFont("helvetica", "bold")
    docPDF.text("Invoice Date", leftCol, currentY + 5)
    docPDF.setFont("helvetica", "normal")
    docPDF.text(":", leftCol + 25, currentY + 5)
    docPDF.text(formatInvoiceDate(bill.timestamp), leftCol + 30, currentY + 5)

    docPDF.setFont("helvetica", "bold")
    docPDF.text("Terms", leftCol, currentY + 10)
    docPDF.setFont("helvetica", "normal")
    docPDF.text(":", leftCol + 25, currentY + 10)
    docPDF.text(" 15 Days", leftCol + 30, currentY + 10)

    // Right column
    docPDF.setFont("helvetica", "bold")
    docPDF.text("Due Date", rightCol, currentY + 5)
    docPDF.setFont("helvetica", "normal")
    docPDF.text(":", rightCol + 25, currentY + 5)
    docPDF.text(formatDueDate(bill.timestamp), rightCol + 30, currentY + 5)

    docPDF.setFont("helvetica", "bold")
    docPDF.text("P.O.#", rightCol, currentY + 10)
    docPDF.setFont("helvetica", "normal")
    docPDF.text(":", rightCol + 25, currentY + 10)
    docPDF.text("INV-" + bill.id, rightCol + 30, currentY + 10)

    return currentY + 20
  }

  function generateBillToShipToSection(docPDF, bill, startY, margin, pageWidth) {
    let currentY = startY
    const leftCol = margin
    const rightCol = pageWidth / 2 + 5
    const colWidth = pageWidth / 2 - 15

    // Bill To
    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(9)
    docPDF.text("Bill To :", leftCol, currentY)
    currentY += 5

    docPDF.setFont("helvetica", "normal")
    docPDF.setFontSize(8)

    // Client name
    docPDF.setFont("helvetica", "bold")
    docPDF.text(bill.clientName.toUpperCase(), leftCol, currentY)
    currentY += 4

    // Client address
    docPDF.setFont("helvetica", "normal")
    const addressLines = docPDF.splitTextToSize(bill.clientAddress, colWidth)
    docPDF.text(addressLines, leftCol, currentY)
    const addressHeight = addressLines.length * 4

    // GSTIN
    if (bill.clientGSTIN) {
      docPDF.text("GSTIN " + bill.clientGSTIN, leftCol, currentY + addressHeight + 4)
    }

    // Ship To (same as Bill To for now)
    let shipToY = startY
    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(9)
    docPDF.text("Ship To :", rightCol, shipToY)
    shipToY += 5

    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(8)
    docPDF.text(bill.clientName.toUpperCase(), rightCol, shipToY)
    shipToY += 4

    docPDF.setFont("helvetica", "normal")
    const shipAddressLines = docPDF.splitTextToSize(bill.clientAddress, colWidth)
    docPDF.text(shipAddressLines, rightCol, shipToY)

    if (bill.clientGSTIN) {
      docPDF.text("GSTIN " + bill.clientGSTIN, rightCol, shipToY + addressHeight + 4)
    }

    return Math.max(currentY + addressHeight + 15, shipToY + addressHeight + 15)
  }

  function generateProfessionalItemsTable(docPDF, bill, startY, margin, pageWidth) {
    const tableData = []

    // Process billing rows
    bill.billingRows.forEach((item, index) => {
      const quantity = item.quantity || 1
      const rate = item.price || 0
      const discount = item.discount || 0
      const taxRate = item.taxRate || 0.18

      const discountAmount = rate * quantity * (discount / 100)
      const taxableAmount = rate * quantity - discountAmount
      const taxAmount = taxableAmount * taxRate
      const totalAmount = taxableAmount + taxAmount

      tableData.push([
        (index + 1).toString(),
        item.product || "Product/Service",
        // item.hsnCode || "4016911",
        quantity.toString(),
        "pcs",
        rate.toFixed(2),
        discount.toFixed(2) + "%",
        taxAmount.toFixed(2) + "(" + (taxRate * 100).toFixed(0) + "%)",
        totalAmount.toFixed(2),
      ])
    })

    // Add discount rows if applicable
    if (bill.schemeDiscount) {
      tableData.push([
        "",
        "Less - Scheme Discount",
        "",
        "1.00",
        "",
        "-" + bill.schemeDiscount.toFixed(2),
        "0.00",
        "-" + (bill.schemeDiscount * 0.18).toFixed(2) + "(18%)",
        "-" + bill.schemeDiscount.toFixed(2),
      ])
    }

    autoTable(docPDF, {
      startY: startY,
      head: [["S.\nNo.", "Description",  "Qty", "Unit", "Rate", "Discount %", "IGST", "Amount"]],
      body: tableData,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
        valign: "middle",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left", cellWidth: 60 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "center", cellWidth: 15 },
        4: { halign: "center", cellWidth: 15 },
        5: { halign: "right", cellWidth: 20 },
        6: { halign: "center", cellWidth: 20 },
        7: { halign: "right", cellWidth: 25 },
        8: { halign: "right", cellWidth: 25 },
      },
      margin: { left: margin, right: margin },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.5,
      showHead: "everyPage",
    })

    return docPDF.lastAutoTable.finalY + 10
  }

  function generateProfessionalSummary(docPDF, bill, startY, margin, pageWidth) {
    let currentY = startY

    // Notes section
    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(8)
    docPDF.text("Notes :", margin, currentY)
    docPDF.setFont("helvetica", "normal")
    docPDF.text("Order #" + bill.id + ". Thank you for your business.", margin + 15, currentY)
    currentY += 10

    // Summary box
    const summaryStartX = pageWidth - 80
    const summaryWidth = 70

    // Summary items
    const summaryItems = [
      ["Sub Total", bill.subTotal.toFixed(2)],
      ["IGST18 (18%)", (bill.tax * 0.6).toFixed(2)],
      ["IGST28 (28%)", (bill.tax * 0.4).toFixed(2)],
      ["Rounding", "0.16"],
      ["Total", bill.grandTotal.toFixed(2)],
      ["Balance Due", bill.amountDue.toFixed(2)],
    ]

    docPDF.setFontSize(9)
    summaryItems.forEach((item, index) => {
      const isTotal = item[0] === "Total" || item[0] === "Balance Due"

      if (isTotal) {
        docPDF.setFont("helvetica", "bold")
      } else {
        docPDF.setFont("helvetica", "normal")
      }

      docPDF.text(item[0], summaryStartX, currentY)
      docPDF.text(item[1], summaryStartX + summaryWidth, currentY, { align: "right" })
      currentY += 5
    })

    // Total in words
    currentY += 5
    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(8)
    docPDF.text("Total In Words :", margin, currentY)
    docPDF.setFont("helvetica", "normal")
    const amountInWords = "Indian Rupee " + convertToWords(bill.grandTotal) + " Only"
    docPDF.text(amountInWords, margin + 30, currentY)

    return currentY + 10
  }

  function generateProfessionalFooter(docPDF, companyDetails, bill, pageHeight, margin, pageWidth) {
    const footerY = pageHeight - 25

    // Terms & Conditions
    docPDF.setFont("helvetica", "bold")
    docPDF.setFontSize(8)
    docPDF.text("Terms & Conditions :", margin, footerY)
    docPDF.setFont("helvetica", "normal")
    docPDF.text("Payment due within 15 days.", margin + 35, footerY)

    // Authorized Signature
    docPDF.setFont("helvetica", "bold")
    docPDF.text("Authorized Signature", pageWidth - 50, footerY + 10)
  }

  function formatInvoiceDate(date) {
    try {
      const d = date.toDate ? date.toDate() : new Date(date)
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      return new Date().toLocaleDateString("en-GB")
    }
  }

  function formatDueDate(date) {
    try {
      const d = date.toDate ? date.toDate() : new Date(date)
      const dueDate = new Date(d)
      dueDate.setDate(dueDate.getDate() + 15) // Add 15 days
      return dueDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 15)
      return dueDate.toLocaleDateString("en-GB")
    }
  }

  // Enhanced convertToWords function for Indian numbering
  function convertToWords(amount) {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    function convertHundreds(num) {
      let result = ""
      if (num > 99) {
        result += ones[Math.floor(num / 100)] + " Hundred "
        num %= 100
      }
      if (num > 19) {
        result += tens[Math.floor(num / 10)] + " "
        num %= 10
      }
      if (num > 0) {
        result += ones[num] + " "
      }
      return result
    }

    if (amount === 0) return "Zero"

    let result = ""
    const crores = Math.floor(amount / 10000000)
    amount %= 10000000

    const lakhs = Math.floor(amount / 100000)
    amount %= 100000

    const thousands = Math.floor(amount / 1000)
    amount %= 1000

    const hundreds = Math.floor(amount)

    if (crores > 0) {
      result += convertHundreds(crores) + "Crore "
    }
    if (lakhs > 0) {
      result += convertHundreds(lakhs) + "Lakh "
    }
    if (thousands > 0) {
      result += convertHundreds(thousands) + "Thousand "
    }
    if (hundreds > 0) {
      result += convertHundreds(hundreds)
    }

    return result.trim()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex h-16 items-center justify-between px-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Billing</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button onClick={handleOpenPopup}>+ Create Bill</Button>
      </header>

      <div className="p-4 md:p-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-4xl">
            <DialogTitle>Create New Bill</DialogTitle>

            {/* Client Info */}
            <div className="mb-6 space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Client Information</h2>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="client-select">Select Client</Label>
                  <select
                    id="client-select"
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedClientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input id="client-name" value={clientName} readOnly className="bg-gray-50" />
                  </div>
                  <div>
                    <Label htmlFor="client-phone">Client Phone</Label>
                    <Input id="client-phone" value={clientPhone} readOnly className="bg-gray-50" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="client-address">Client Address</Label>
                  <Input id="client-address" value={clientAddress} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="mb-6 space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Project Information</h2>

              <div>
                <Label htmlFor="project-select">Select Project</Label>
                <select
                  id="project-select"
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Billing Info */}
            <div className="mb-6 space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Billing Items</h2>

              <div className="space-y-3">
                {rows.map((row, index) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-md bg-gray-50" key={index}>
                    <div>
                      <Label htmlFor={`product-${index}`}>Product/Service</Label>
                      <Input
                        id={`product-${index}`}
                        placeholder="Enter Product Name"
                        value={row.product}
                        onChange={(e) => handleRowChange(index, "product", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`price-${index}`}>Unit Price (₹)</Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        placeholder="Enter Unit Price"
                        value={row.price}
                        onChange={(e) => handleRowChange(index, "price", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleAddRow}>
                  + Add Item
                </Button>
                {rows.length > 1 && (
                  <Button variant="destructive" onClick={handleDeleteRow}>
                    Remove Last Item
                  </Button>
                )}
              </div>
            </div>

            {/* Tax & Summary */}
            <div className="space-y-3 border-t pt-4 bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold">Bill Summary</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span className="font-medium">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST(9%) + SGST(9%):</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2">
                  <Label htmlFor="amount-paid">Amount Paid:</Label>
                  <Input
                    id="amount-paid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full sm:w-40"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-between font-semibold text-red-600">
                  <span>Amount Due:</span>
                  <span>₹{amountDue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSaveBill} className="px-8">
                Save Bill
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bills Table */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Bills for Selected Company</h2>
          </div>

          <div className="p-6">
            {bills.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No bills available for this company.</p>
                <p className="text-sm mt-2">Create your first bill using the button above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium">Client</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium">Project</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-medium">Subtotal</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-medium">Tax</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-medium">Grand Total</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-medium">Paid</th>
                      <th className="border border-gray-200 px-4 py-3 text-right font-medium">Due</th>
                      <th className="border border-gray-200 px-4 py-3 text-left font-medium">Date</th>
                      <th className="border border-gray-200 px-4 py-3 text-center font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill, index) => (
                      <tr key={bill.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-200 px-4 py-3">{bill.clientName}</td>
                        <td className="border border-gray-200 px-4 py-3">{bill.projectName}</td>
                        <td className="border border-gray-200 px-4 py-3 text-right">₹{bill.subTotal.toFixed(2)}</td>
                        <td className="border border-gray-200 px-4 py-3 text-right">₹{bill.tax.toFixed(2)}</td>
                        <td className="border border-gray-200 px-4 py-3 text-right font-medium">
                          ₹{bill.grandTotal.toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-right">₹{bill.amountPaid.toFixed(2)}</td>
                        <td className="border border-gray-200 px-4 py-3 text-right text-red-600 font-medium">
                          ₹{bill.amountDue.toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-4 py-3">
                          {bill.timestamp?.toDate().toLocaleDateString("en-IN")}
                        </td>
                        <td className="border border-gray-200 px-4 py-3 text-center">
                          <Button onClick={() => generateInvoicePDF(bill)} size="sm" className="text-xs">
                            Generate PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page

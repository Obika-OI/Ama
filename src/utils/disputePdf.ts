import { jsPDF } from 'jspdf';

export interface DisputePdfData {
  orderCode: string;
  orderId: string;
  itemTitle: string;
  category: string;
  itemKind: 'service' | 'goods';
  handoverType?: 'in_person' | 'shipping';
  agreedAmount: number;
  currency: string;
  isInternational: boolean;
  orderCreatedAt: string;
  status: string;

  // Provider Details
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerDeviceId: string;
  sellerKycVerified: boolean;
  sellerProviderLevel?: number;

  // Consumer Details
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerDeviceId: string;
  buyerKycVerified: boolean;

  // Locked Payment Details
  lockedPaymentMethod: {
    type: 'local_bank' | 'global_app';
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    appName?: string;
    handleOrEmail?: string;
    payUrl?: string;
    legalName?: string;
    country?: string;
  };

  // Payment Proof
  paymentProof?: {
    method?: string;
    amountPaid?: number;
    currency?: string;
    paidTimestamp?: string;
    transactionId?: string;
    receiptProofUrl?: string;
    screenshotUrl?: string;
    notes?: string;
    submittedAt?: string;
  };

  // Review & Denial
  reviewDeadline?: string;
  confirmedAt?: string;
  deniedAt?: string;
  denialReason?: string;
  denialStatementUrl?: string;

  // Shipping & Dispatch Proof
  shippingProof?: {
    courierName: string;
    waybillNumber: string;
    receiptDocUrl?: string;
    packagePhotoUrl?: string;
    shippedAt: string;
    notes?: string;
  };
  dispatchDeadline?: string;
  shippedAt?: string;
  deliveryEta?: string;

  // Non-Delivery Dispute & Provider Grace Window
  deliveryDisputedAt?: string;
  deliveryDisputeEvidence?: {
    reason: string;
    evidenceUrl?: string;
    notes?: string;
    filedAt: string;
  };
  providerGraceDeadline?: string;
  providerDeliveryResponse?: {
    responseType: string;
    proofUrl?: string;
    notes?: string;
    respondedAt: string;
  };
  courierDeliveredAt?: string;
  autoCompleteDeadline?: string;
  completedAt?: string;
  isProviderFrozen?: boolean;
  isConsumerStrikeApplied?: boolean;
  providerProtectionAwarded?: boolean;

  // Chat Transcript
  chatTranscript?: Array<{
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: string;
  }>;
}

export function generateDisputeEvidencePdf(data: DisputePdfData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      drawHeaderBanner(true);
    }
  };

  const drawHeaderBanner = (isSubsequentPage = false) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, pageWidth - margin * 2, isSubsequentPage ? 14 : 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(isSubsequentPage ? 10 : 13);
    doc.text('AMA BABY CARE MARKETPLACE', margin + 4, y + (isSubsequentPage ? 6 : 9));

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(isSubsequentPage ? 8 : 9);
    doc.setTextColor(226, 232, 240); // slate-200
    doc.text(
      'ORDER, SHIPPING & DISPUTE SUMMARY RECORD',
      margin + 4,
      y + (isSubsequentPage ? 11 : 16)
    );

    y += isSubsequentPage ? 18 : 28;
  };

  drawHeaderBanner(false);

  // Metadata Summary Box
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Order Reference Code: ${data.orderCode}`, margin + 4, y + 6);
  doc.text(`Current Status: ${data.status.replace(/_/g, ' ').toUpperCase()}`, margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Internal Order ID: ${data.orderId}`, margin + 4, y + 17);
  doc.text(
    `Issue & Generation Timestamp: ${new Date().toISOString()} (UTC)`,
    margin + 4,
    y + 21
  );

  const verificationHash = `HASH-${Math.abs(
    (data.orderCode + data.orderId + data.sellerDeviceId + data.buyerDeviceId)
      .split('')
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  ).toString(16).toUpperCase()}`;

  doc.text(`Order Reference Hash: ${verificationHash}`, margin + 95, y + 6);
  doc.text(
    `Settlement: ${data.isInternational ? '48h International Settlement' : '24h Local Settlement'}`,
    margin + 95,
    y + 12
  );
  doc.text(
    `Handover Mode: ${data.handoverType === 'shipping' ? 'Trackable Courier Shipping' : 'In-Person Local Handover'}`,
    margin + 95,
    y + 17
  );

  y += 28;

  // 1. Transaction Agreed Terms
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. AGREED TRANSACTION TERMS & LISTING DETAILS', margin, y);
  y += 5;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Listing Title: ${data.itemTitle}`, margin + 4, y + 6);
  doc.text(`Listing Category: ${data.category} (${data.itemKind.toUpperCase()})`, margin + 4, y + 11);
  doc.text(`Order Lock Date: ${new Date(data.orderCreatedAt).toLocaleString()}`, margin + 4, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Locked Agreed Amount: ${data.currency} ${data.agreedAmount.toLocaleString()}`,
    margin + 105,
    y + 6
  );
  doc.text(
    `Fulfillment: ${data.handoverType === 'shipping' ? 'Remote Shipping (Level 2)' : 'Local In-Person'}`,
    margin + 105,
    y + 11
  );

  y += 26;

  // 2. Recorded Parties (Provider and Consumer Profile Details)
  checkPageBreak(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. RECORDED PARTIES & PROFILE DETAILS', margin, y);
  y += 5;

  const colWidth = (pageWidth - margin * 2 - 4) / 2;

  // Provider box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`CARE / ITEM PROVIDER DETAILS`, margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Name: ${data.sellerName}`, margin + 4, y + 12);
  doc.text(`Phone: ${data.sellerPhone || 'Not provided'}`, margin + 4, y + 17);
  doc.text(`Email: ${data.sellerEmail || 'Not provided'}`, margin + 4, y + 22);
  doc.text(`Profile Check: ${data.sellerKycVerified ? 'ID Info Submitted' : 'Standard Tier'}`, margin + 4, y + 27);
  doc.text(`Session Device Ref:`, margin + 4, y + 32);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text(data.sellerDeviceId || 'Unknown', margin + 4, y + 36);

  // Consumer box
  doc.setFont('helvetica', 'normal');
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + colWidth + 4, y, colWidth, 38, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`FAMILY / CONSUMER DETAILS`, margin + colWidth + 8, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Name: ${data.buyerName}`, margin + colWidth + 8, y + 12);
  doc.text(`Phone: ${data.buyerPhone || 'Not provided'}`, margin + colWidth + 8, y + 17);
  doc.text(`Email: ${data.buyerEmail || 'Not provided'}`, margin + colWidth + 8, y + 22);
  doc.text(`Profile Check: ${data.buyerKycVerified ? 'ID Info Submitted' : 'Standard Tier'}`, margin + colWidth + 8, y + 27);
  doc.text(`Session Device Ref:`, margin + colWidth + 8, y + 32);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text(data.buyerDeviceId || 'Unknown', margin + colWidth + 8, y + 36);

  y += 42;

  // 3. Snapshot of Provider Payment Details
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. RECORDED PROVIDER PAYMENT INSTRUCTIONS', margin, y);
  y += 5;

  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 25, 2, 2, 'FD');

  const pm = data.lockedPaymentMethod;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 53, 15); // amber-900
  doc.text('ORDER SNAPSHOT: Payment details captured when this order was created.', margin + 4, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  if (pm.type === 'local_bank') {
    doc.text(`Bank / Fintech Name: ${pm.bankName || 'Local Bank'}`, margin + 4, y + 11);
    doc.text(`Account Holder Name: ${pm.accountName || data.sellerName}`, margin + 4, y + 16);
    doc.text(`Account Number: ${pm.accountNumber || 'N/A'}`, margin + 4, y + 21);
  } else {
    doc.text(`Global / P2P App: ${pm.appName || 'P2P Platform'}`, margin + 4, y + 11);
    doc.text(`Account Handle / Email / Phone: ${pm.handleOrEmail || 'N/A'}`, margin + 4, y + 16);
    if (pm.payUrl) {
      doc.text(`Direct Payment Link: ${pm.payUrl}`, margin + 4, y + 21);
    } else if (pm.legalName) {
      doc.text(`Legal Name & Country: ${pm.legalName} (${pm.country || 'International'})`, margin + 4, y + 21);
    }
  }

  y += 29;

  // 4. Consumer Submitted Structured Payment Proof
  checkPageBreak(38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('4. CONSUMER SUBMITTED PAYMENT PROOF & TRANSFER EVIDENCE', margin, y);
  y += 5;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 2, 2, 'FD');

  const proof = data.paymentProof;
  if (!proof || !proof.transactionId) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No payment proof submitted yet for this locked order.', margin + 4, y + 8);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`Payment Method Selected: ${proof.method || 'Bank Transfer'}`, margin + 4, y + 6);
    doc.text(
      `Amount Paid: ${proof.currency || data.currency} ${(proof.amountPaid || data.agreedAmount).toLocaleString()}`,
      margin + 4,
      y + 11
    );
    doc.text(`Payment Timestamp: ${proof.paidTimestamp || 'Recorded on transfer'}`, margin + 4, y + 16);
    doc.text(`Date Proof Submitted: ${proof.submittedAt ? new Date(proof.submittedAt).toLocaleString() : 'N/A'}`, margin + 4, y + 21);

    doc.setFont('helvetica', 'bold');
    doc.text(`Official Transaction / Session ID:`, margin + 95, y + 6);
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.text(proof.transactionId, margin + 95, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Attached Document: ${proof.receiptProofUrl ? 'Official Bank Statement / Receipt Uploaded' : 'None'}`, margin + 95, y + 17);
    if (proof.notes) {
      doc.text(`Consumer Narration / Remarks: ${proof.notes.slice(0, 50)}`, margin + 95, y + 23);
    }
  }

  y += 34;

  // 5. Courier Shipping & Dispatch Proof (Level 2 Provider Verification)
  if (data.handoverType === 'shipping' || data.shippingProof) {
    checkPageBreak(38);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('5. COURIER SHIPPING & DISPATCH VERIFICATION (LEVEL 2)', margin, y);
    y += 5;

    doc.setDrawColor(186, 230, 253); // sky-200
    doc.setFillColor(240, 249, 255); // sky-50
    doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 2, 2, 'FD');

    if (data.shippingProof) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(3, 105, 161); // sky-700
      doc.text(`Courier Service: ${data.shippingProof.courierName}`, margin + 4, y + 6);
      doc.text(`Waybill / Tracking Number: ${data.shippingProof.waybillNumber}`, margin + 4, y + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Dispatched At: ${new Date(data.shippingProof.shippedAt).toLocaleString()}`, margin + 4, y + 18);
      doc.text(`Estimated Delivery Window (ETA): ${data.deliveryEta ? new Date(data.deliveryEta).toLocaleString() : 'Standard ETA'}`, margin + 4, y + 24);

      doc.text(`Receipt Uploaded: ${data.shippingProof.receiptDocUrl ? 'Yes (Courier Slip Uploaded)' : 'Pending'}`, margin + 105, y + 6);
      doc.text(`Packed Item Photo: ${data.shippingProof.packagePhotoUrl ? 'Yes (Package Photo Uploaded)' : 'Pending'}`, margin + 105, y + 12);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Note: Shipped via trackable reliable courier (e.g., DHL, GIG Logistics, Royal Mail, FedEx, etc.)', margin + 4, y + 29);
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Awaiting Provider courier dispatch proof (48-hour mandatory window post payment confirmation).', margin + 4, y + 8);
    }

    y += 36;
  }

  // 6. Delivery Dispute, Non-Delivery Audit & Provider Grace Period
  checkPageBreak(38);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('6. DELIVERY AUDIT, DISPUTE STATUS & GRACE WINDOW RECORD', margin, y);
  y += 5;

  const isDisputed = data.status.toLowerCase().includes('disputed') || Boolean(data.deliveryDisputedAt);
  const isCompleted = data.status.toLowerCase().includes('completed') || Boolean(data.completedAt);

  doc.setFillColor(isDisputed ? 254 : isCompleted ? 240 : 248, isDisputed ? 242 : isCompleted ? 253 : 250, isDisputed ? 242 : isCompleted ? 244 : 252);
  doc.setDrawColor(isDisputed ? 239 : isCompleted ? 34 : 203, isDisputed ? 68 : isCompleted ? 197 : 213, isDisputed ? 68 : isCompleted ? 94 : 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);

  if (isCompleted) {
    doc.setTextColor(21, 128, 61); // green-700
    doc.text(`✓ TRANSACTION OFFICIALLY COMPLETED & FULFILLED`, margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Completed At: ${new Date(data.completedAt || data.orderCreatedAt).toLocaleString()}`, margin + 4, y + 12);
    if (data.providerProtectionAwarded) {
      doc.text(`Provider Protection Badge Awarded: Confirmed authentic fulfillment; Consumer strike applied for false dispute.`, margin + 4, y + 17);
    } else {
      doc.text(`Goods or care service successfully received and confirmed by Consumer.`, margin + 4, y + 17);
    }
  } else if (isDisputed) {
    doc.setTextColor(185, 28, 28); // red-700
    doc.text(`⚠️ NON-DELIVERY DISPUTE FILED (ACTIVE INVESTIGATION)`, margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(69, 10, 10);
    doc.text(`Dispute Filed At: ${new Date(data.deliveryDisputedAt || '').toLocaleString()}`, margin + 4, y + 12);
    doc.text(`Reason: ${data.deliveryDisputeEvidence?.reason || 'Non-delivery past courier ETA window.'}`, margin + 4, y + 17);
    if (data.providerGraceDeadline) {
      doc.text(`Provider 24-Hour Grace Window Deadline: ${new Date(data.providerGraceDeadline).toLocaleString()}`, margin + 4, y + 22);
    }
  } else {
    doc.setTextColor(30, 41, 59);
    doc.text(`STANDARD TRANSACTION IN PROGRESS`, margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Awaiting courier delivery confirmation or handover. 48h auto-complete applies once tracking shows Delivered.`, margin + 4, y + 12);
  }

  y += 32;

  // 7. Chat Transcript / Communication Audit Log
  if (data.chatTranscript && data.chatTranscript.length > 0) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('7. MARKETPLACE CHAT & TRANSACTION AUDIT LOG', margin, y);
    y += 5;

    const chatItems = data.chatTranscript.slice(-8);
    for (const msg of chatItems) {
      checkPageBreak(12);
      doc.setDrawColor(241, 245, 249);
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, pageWidth - margin * 2, 9, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      doc.text(`${msg.senderName} (${msg.senderRole}) [${timeStr}]:`, margin + 3, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const textSnippet = msg.text.slice(0, 95);
      doc.text(textSnippet, margin + 45, y + 5);
      y += 10;
    }
    y += 4;
  }

  // 8. Formal Fraud & Legal Notice
  checkPageBreak(30);
  doc.setDrawColor(148, 163, 184);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('ORDER & DISPUTE SUMMARY NOTICE', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  const legalText =
    'This summary document is compiled from user-submitted order records, timestamps, payment transfer notes, courier tracking inputs, ' +
    'and marketplace chat history recorded on Ama Baby Care. It is provided for personal recordkeeping and reference when communicating ' +
    'with participating parties or payment provider support teams. Ama Baby Care is not a bank, arbitrator, or law enforcement agency.';

  const splitNotice = doc.splitTextToSize(legalText, pageWidth - margin * 2 - 8);
  doc.text(splitNotice, margin + 4, y + 10);

  // Trigger download
  doc.save(`Ama_Dispute_Evidence_Pack_${data.orderCode}.pdf`);
}

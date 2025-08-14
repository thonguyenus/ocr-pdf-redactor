import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { findRateByTerm } from "../constants";
import type { OcrField } from "../types";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    minWidth: 600,
    maxWidth: 700,
    maxHeight: "90vh",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const EmailContent = styled(Box)(({ theme }) => ({
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  lineHeight: 1.6,
  color: theme.palette.text.primary,
  "& .email-header": {
    marginBottom: theme.spacing(2),
  },
  "& .email-body": {
    marginBottom: theme.spacing(2),
  },
  "& .account-details": {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[200]}`,
  },
  "& .detail-row": {
    display: "flex",
    marginBottom: theme.spacing(1),
    "& .label": {
      fontWeight: "bold",
      minWidth: 120,
      marginRight: theme.spacing(1),
    },
    "& .value": {
      flex: 1,
    },
  },
  "& .instruction": {
    margin: theme.spacing(2, 0),
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.warning.light,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.warning.main}`,
    color: theme.palette.warning.dark,
  },
  "& .footer": {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
}));

const CopyButton = styled(Button)(({ theme }) => ({
  marginLeft: "auto",
  marginRight: theme.spacing(1),
}));

interface EmailTemplateModalProps {
  open: boolean;
  onClose: () => void;
  ocrFields: OcrField[];
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  open,
  onClose,
  ocrFields,
}) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Extract OCR data for template fields
  const getOcrValue = (fieldName: string): string => {
    // Look for exact matches first
    let field = ocrFields.find((f) =>
      f.value.toLowerCase().includes(fieldName.toLowerCase())
    );

    // If not found, try alternative names
    if (!field) {
      if (fieldName === "term length") {
        // Try multiple variations for term length
        field = ocrFields.find((f) => {
          const value = f.value.toLowerCase();
          return (
            (value.includes("term") && value.includes("length")) ||
            value.includes("term length") ||
            value.includes("term:") ||
            value.includes("term") ||
            value.includes("duration") ||
            value.includes("period")
          );
        });
      } else if (fieldName === "maturity date") {
        // Try multiple variations for maturity date
        field = ocrFields.find((f) => {
          const value = f.value.toLowerCase();
          return (
            (value.includes("maturity") && value.includes("date")) ||
            value.includes("maturity date") ||
            value.includes("maturity:") ||
            value.includes("due date") ||
            value.includes("end date") ||
            value.includes("expiry")
          );
        });
      }
    }

    return field?.value || "";
  };

  // Get term length from OCR
  const termLength = getOcrValue("term length");

  // Get maturity date from OCR
  const maturityDate = getOcrValue("maturity date");

  // Calculate rate based on term length
  const calculatedRate = termLength ? findRateByTerm(termLength) : null;
  const rateDisplay = calculatedRate
    ? `${calculatedRate.rate.toFixed(2)}%`
    : "";

  // Check if OCR fields were found
  const hasOcrData = ocrFields.length > 0;
  const hasTermLength = !!termLength;
  const hasMaturityDate = !!maturityDate;
  const hasRate = !!calculatedRate;

  const emailTemplate = `Hi All,

Re: Term Deposit Account Opening Confirmation

Account Name:
Account No:
Value:
Term: ${
    termLength || (hasOcrData && !hasTermLength ? "[NOT FOUND IN OCR]" : "")
  }
Rate: ${rateDisplay || (hasOcrData && !hasRate ? "[CANNOT CALCULATE]" : "")}
Maturity Date: ${
    maturityDate || (hasOcrData && !hasMaturityDate ? "[NOT FOUND IN OCR]" : "")
  }
Source of Funding: Funded / Yet to be funded by Client
Kindly provide a valid ABN/TFN once available to avoid being charged WHT.



This is to confirm that the above account (which was opened under your Master Account Authority Agreement) has been opened by NAB in accordance with the instructions given by you.

A copy of the NAB Term Deposit Terms & Conditions can be obtained at nab.com.au/tdterms. As you have chosen to receive electronic communications, as part of your Master Account Authority, you will not be provided with a paper copy of these terms unless you specifically request a copy.

Should you have any queries, please contact <Banker Name> on <Banker Contact>.

Kind Regards,

Moonie Do`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      setShowCopySuccess(true);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleClose = () => {
    setShowCopySuccess(false);
    onClose();
  };

  return (
    <>
      <StyledDialog open={open} onClose={handleClose}>
        <StyledDialogTitle>
          <Typography variant="h6" component="div">
            Email Template - Term Deposit Confirmation
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <EmailContent>
            {hasOcrData && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: "#f8f9fa",
                  borderRadius: 1,
                  border: "1px solid #dee2e6",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  <strong>OCR Status:</strong>
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "12px" }}
                >
                  {hasTermLength
                    ? "✅ Term Length found"
                    : "❌ Term Length not found"}{" "}
                  •
                  {hasMaturityDate
                    ? " ✅ Maturity Date found"
                    : " ❌ Maturity Date not found"}{" "}
                  •
                  {hasRate
                    ? " ✅ Rate calculated"
                    : " ❌ Rate cannot be calculated"}
                </Typography>
                {!hasTermLength && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{ fontSize: "11px", mt: 1 }}
                  >
                    💡 Tip: Make sure the PDF contains "Term length" or "Term"
                    field
                  </Typography>
                )}
                {!hasMaturityDate && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{ fontSize: "11px", mt: 0.5 }}
                  >
                    💡 Tip: Make sure the PDF contains "Maturity date" or "Due
                    date" field
                  </Typography>
                )}
              </Box>
            )}

            <div className="email-header">
              <Typography variant="body2" color="text.secondary">
                <strong>Subject:</strong> Re: Term Deposit Account Opening
                Confirmation
              </Typography>
            </div>

            <div className="email-body">
              <Typography variant="body1" paragraph>
                Hi All,
              </Typography>

              <Typography variant="body1" paragraph>
                <strong>Re: Term Deposit Account Opening Confirmation</strong>
              </Typography>

              <div className="account-details">
                <div className="detail-row">
                  <span className="label">Account Name:</span>
                  <span className="value"></span>
                </div>
                <div className="detail-row">
                  <span className="label">Account No:</span>
                  <span className="value"></span>
                </div>
                <div className="detail-row">
                  <span className="label">Value:</span>
                  <span className="value"></span>
                </div>
                <div className="detail-row">
                  <span className="label">Term:</span>
                  <span className="value">
                    {termLength ||
                      (hasOcrData && !hasTermLength
                        ? "⚠️ Not found in OCR"
                        : "")}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Rate:</span>
                  <span className="value">
                    {rateDisplay ||
                      (hasOcrData && !hasRate
                        ? "⚠️ Cannot calculate (Term not found)"
                        : "")}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Maturity Date:</span>
                  <span className="value">
                    {maturityDate ||
                      (hasOcrData && !hasMaturityDate
                        ? "⚠️ Not found in OCR"
                        : "")}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Source of Funding:</span>
                  <span className="value">
                    Funded / Yet to be funded by Client
                  </span>
                </div>
              </div>

              <div className="instruction">
                <Typography variant="body2">
                  <strong>Note:</strong> Kindly provide a valid ABN/TFN once
                  available to avoid being charged WHT.
                </Typography>
              </div>

              <Typography variant="body1" paragraph>
                This is to confirm that the above account (which was opened
                under your Master Account Authority Agreement) has been opened
                by NAB in accordance with the instructions given by you.
              </Typography>

              <Typography variant="body1" paragraph>
                A copy of the NAB Term Deposit Terms & Conditions can be
                obtained at nab.com.au/tdterms. As you have chosen to receive
                electronic communications, as part of your Master Account
                Authority, you will not be provided with a paper copy of these
                terms unless you specifically request a copy.
              </Typography>

              <Typography variant="body1" paragraph>
                Should you have any queries, please contact{" "}
                <strong>&lt;Banker Name&gt;</strong> on{" "}
                <strong>&lt;Banker Contact&gt;</strong>.
              </Typography>
            </div>

            <div className="footer">
              <Typography variant="body1" paragraph>
                Kind Regards,
              </Typography>
              <Typography variant="body1">Moonie Do</Typography>
            </div>
          </EmailContent>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <CopyButton
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={handleCopyToClipboard}
            color="primary"
          >
            Copy Template
          </CopyButton>
          <Button onClick={handleClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </StyledDialog>

      <Snackbar
        open={showCopySuccess}
        autoHideDuration={3000}
        onClose={() => setShowCopySuccess(false)}
        message="Email template copied to clipboard!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

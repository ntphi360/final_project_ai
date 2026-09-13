from app.services.email_service import sendEmail

result = sendEmail(
    recipientEmail="ntphi360@gmail.com",
    subject="Test Resend",
    htmlContent="<strong>Test thành công</strong>"
)

print(result)